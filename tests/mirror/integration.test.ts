import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { expect, test } from "vitest";

import {
  applyMirror,
  validateInternalLinks,
} from "../../scripts/mirror/apply.js";
import {
  assertCleanBuildOutput,
  checkMirror,
} from "../../scripts/mirror/check.js";
import { translationRelativePath } from "../../scripts/mirror/jobs.js";
import { prepareMirror, SUMMARY_KEYS } from "../../scripts/mirror/prepare.js";
import { fixtureWorkspace } from "../support/factories.js";

const completeTranslations = async (
  workspace: Awaited<ReturnType<typeof fixtureWorkspace>>,
) => {
  const snapshot = JSON.parse(
    await readFile(join(workspace.config.stagingRoot, "snapshot.json"), "utf8"),
  ) as {
    plan: {
      pages: Record<
        string,
        {
          sourceUrl: string;
          mirrorPath: string;
          segments: Array<{
            id: string;
            kind: string;
            source: string;
            sourceHash: string;
          }>;
        }
      >;
    };
  };

  for (const page of Object.values(snapshot.plan.pages)) {
    const path = join(
      workspace.config.translationRoot,
      translationRelativePath(page.mirrorPath),
    );
    await mkdir(dirname(path), { recursive: true });
    await writeFile(
      path,
      `${JSON.stringify(
        {
          sourceUrl: page.sourceUrl,
          mirrorPath: page.mirrorPath,
          entries: Object.fromEntries(
            page.segments.map((segment) => [
              segment.id,
              {
                sourceHash: segment.sourceHash,
                translated:
                  segment.kind === "heading"
                    ? "# 한국어 문서"
                    : segment.kind === "code" || segment.kind === "image"
                      ? segment.source
                      : `한국어 설명입니다. ${segment.source}`,
              },
            ]),
          ),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }
};

test("does not promote partial or invalid output", async () => {
  const workspace = await fixtureWorkspace();

  const prepared = await prepareMirror(workspace.config);

  expect(prepared.jobs).toHaveLength(2);
  await expect(applyMirror(workspace.config)).rejects.toThrow(/translation/i);
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("promotes a complete translated snapshot as one verified state", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);

  const applied = await applyMirror(workspace.config);

  expect(applied).toMatchObject({
    discovered: 2,
    added: 2,
    translatedSegments: 4,
  });
  expect(Object.keys((await workspace.readManifest()).pages)).toEqual([
    "/docs/",
    "/docs/install/",
  ]);
  await expect(
    readFile(join(workspace.config.contentRoot, "install", "index.md"), "utf8"),
  ).resolves.toContain("한국어 설명입니다.");
  await expect(readFile(workspace.config.sidebarPath, "utf8")).resolves.toContain(
    "한국어 문서",
  );
});

test("checks the complete mirror before running the build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  let builds = 0;

  const checked = await checkMirror({
    ...workspace.config,
    runBuild: async () => {
      builds += 1;
    },
  });

  expect(Object.keys(checked)).toEqual(SUMMARY_KEYS);
  expect(checked).toMatchObject({
    discovered: 2,
    unchanged: 2,
    pendingRemoval: 0,
    translatedSegments: 4,
  });
  expect(builds).toBe(1);
});

test("rejects an empty sitemap without replacing prior staged work", async () => {
  const workspace = await fixtureWorkspace();
  await mkdir(workspace.config.stagingRoot, { recursive: true });
  await mkdir(workspace.config.jobRoot, { recursive: true });
  await writeFile(join(workspace.config.stagingRoot, "sentinel"), "staging");
  await writeFile(join(workspace.config.jobRoot, "sentinel"), "jobs");
  const client = workspace.config.client;

  await expect(
    prepareMirror({
      ...workspace.config,
      client: {
        ...client,
        text: async (url) =>
          url.pathname === "/sitemap.xml"
            ? "<?xml version=\"1.0\"?><urlset></urlset>"
            : client.text(url),
      },
    }),
  ).rejects.toThrow(/empty/i);
  await expect(
    readFile(join(workspace.config.stagingRoot, "sentinel"), "utf8"),
  ).resolves.toBe("staging");
  await expect(
    readFile(join(workspace.config.jobRoot, "sentinel"), "utf8"),
  ).resolves.toBe("jobs");
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects when more than twenty percent of page fetches fail", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;

  await expect(
    prepareMirror({
      ...workspace.config,
      client: {
        ...client,
        text: async (url) => {
          if (url.pathname === "/docs/install") {
            throw new Error("fixture page unavailable");
          }
          return client.text(url);
        },
      },
    }),
  ).rejects.toThrow(/partial preparation.*1 of 2/i);
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rolls back every promoted target after a late link validation failure", async () => {
  const workspace = await fixtureWorkspace();
  const originalLanding = await readFile(
    join(workspace.config.contentRoot, "index.md"),
    "utf8",
  ).catch(() => null);
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const translationPath = join(
    workspace.config.translationRoot,
    "install",
    "index.json",
  );
  const translation = JSON.parse(await readFile(translationPath, "utf8")) as {
    entries: Record<string, { translated: string }>;
  };
  const proseEntry = Object.values(translation.entries).find(
    (entry) => !entry.translated.startsWith("#"),
  )!;
  proseEntry.translated =
    "한국어 설명입니다. [깨진 링크](https://www.onorca.dev/docs/missing)";
  await writeFile(
    translationPath,
    `${JSON.stringify(translation, null, 2)}\n`,
    "utf8",
  );

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /broken internal link/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
  await expect(
    readFile(join(workspace.config.contentRoot, "index.md"), "utf8").catch(
      () => null,
    ),
  ).resolves.toBe(originalLanding);
});

test("tracks a missing sitemap page separately as pending removal", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const linkedConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) =>
        url.pathname === "/docs"
          ? `<!doctype html><main><article><h1>Documentation</h1>
              <p>Continue to <a href="/docs/install">installation</a>.</p>
            </article></main>`
          : client.text(url),
    },
  };
  await prepareMirror(linkedConfig);
  await completeTranslations(workspace);
  await applyMirror(linkedConfig);
  const pendingConfig = {
    ...linkedConfig,
    client: {
      ...linkedConfig.client,
      text: async (url: URL) =>
        url.pathname === "/sitemap.xml"
          ? "<?xml version=\"1.0\"?><urlset><url><loc>https://www.onorca.dev/docs</loc></url></urlset>"
          : linkedConfig.client.text(url),
    },
  };
  await prepareMirror(pendingConfig);
  const applied = await applyMirror(pendingConfig);

  expect(applied.pendingRemoval).toBe(1);
  expect((await workspace.readManifest()).pages["/docs/install/"]?.status).toBe(
    "pending-removal",
  );
  const checked = await checkMirror({
    ...pendingConfig,
    runBuild: async () => undefined,
  });
  expect(checked).toMatchObject({
    discovered: 1,
    unchanged: 1,
    pendingRemoval: 1,
  });
});

test("checks mirrored image hashes and current robots exceptions", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const imageConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) => {
        if (url.pathname === "/robots.txt") {
          return "User-agent: *\nDisallow: /blocked.gif";
        }
        if (url.pathname === "/docs/install") {
          return `<!doctype html><main><article>
            <h1>Install</h1><p>Read the documentation.</p>
            <img src="/allowed.png" alt="Allowed">
            <img src="/blocked.gif" alt="Blocked">
          </article></main>`;
        }
        return client.text(url);
      },
    },
  };
  await prepareMirror(imageConfig);
  await completeTranslations(workspace);
  await applyMirror(imageConfig);
  let builds = 0;
  const checked = await checkMirror({
    ...imageConfig,
    runBuild: async () => {
      builds += 1;
    },
  });
  expect(checked).toMatchObject({ localImages: 1, remoteImages: 1 });

  const manifest = await workspace.readManifest();
  const originalManifestText = await readFile(
    workspace.config.manifestPath,
    "utf8",
  );
  manifest.pages["/docs/install/"]!.images.push({
    ...manifest.pages["/docs/install/"]!.images.find(
      (image) => image.robotsRemote,
    )!,
  });
  await writeFile(
    workspace.config.manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await expect(
    checkMirror({
      ...imageConfig,
      runBuild: async () => {
        builds += 1;
      },
    }),
  ).rejects.toThrow(/image state is stale/i);
  expect(builds).toBe(1);
  await writeFile(
    workspace.config.manifestPath,
    originalManifestText,
    "utf8",
  );

  const restoredManifest = await workspace.readManifest();
  const localPath = restoredManifest.pages["/docs/install/"]!.images.find(
    (image) => image.localPath !== null,
  )!.localPath!;
  await writeFile(
    join(workspace.config.assetRoot, localPath.split("/").at(-1)!),
    new Uint8Array([1, 2, 3]),
  );
  await expect(
    checkMirror({
      ...imageConfig,
      runBuild: async () => {
        builds += 1;
      },
    }),
  ).rejects.toThrow(/local image hash mismatch/i);
  expect(builds).toBe(1);
});

test("does not promote stale robots exceptions on pending pages", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const imageConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) => {
        if (url.pathname === "/robots.txt") {
          return "User-agent: *\nDisallow: /blocked.gif";
        }
        if (url.pathname === "/docs/install") {
          return `<!doctype html><main><article>
            <h1>Install</h1><p>Read the documentation.</p>
            <img src="/blocked.gif" alt="Blocked">
          </article></main>`;
        }
        return client.text(url);
      },
    },
  };
  await prepareMirror(imageConfig);
  await completeTranslations(workspace);
  await applyMirror(imageConfig);
  const before = await workspace.readManifest();
  const pendingConfig = {
    ...imageConfig,
    client: {
      ...imageConfig.client,
      text: async (url: URL) => {
        if (url.pathname === "/robots.txt") return "User-agent: *\nAllow: /";
        if (url.pathname === "/sitemap.xml") {
          return "<?xml version=\"1.0\"?><urlset><url><loc>https://www.onorca.dev/docs</loc></url></urlset>";
        }
        return imageConfig.client.text(url);
      },
    },
  };
  await prepareMirror(pendingConfig);

  await expect(applyMirror(pendingConfig)).rejects.toThrow(
    /remote image exception/i,
  );
  expect(await workspace.readManifest()).toEqual(before);
});

test("does not build when notice metadata is invalid", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  const contentPath = join(
    workspace.config.contentRoot,
    "install",
    "index.md",
  );
  await writeFile(
    contentPath,
    (await readFile(contentPath, "utf8")).replace(
      "translationNotice:",
      "translationNoticeBroken:",
    ),
    "utf8",
  );
  let builds = 0;

  await expect(
    checkMirror({
      ...workspace.config,
      runBuild: async () => {
        builds += 1;
      },
    }),
  ).rejects.toThrow(/translation notice/i);
  expect(builds).toBe(0);
});

test("rejects missing-route warnings from an otherwise successful build", () => {
  expect(() =>
    assertCleanBuildOutput("[WARN] Entry docs → 404 was not found."),
  ).toThrow(/build warning.*not found/i);
  expect(() => assertCleanBuildOutput("Build complete")).not.toThrow();
});

test("does not treat protected code examples as internal links", () => {
  const pages = new Map([
    [
      "/docs/",
      "```sh\ncurl https://www.onorca.dev/docs/example-only\n```\n\n`/docs/inline-example`",
    ],
  ]);

  expect(() => validateInternalLinks(pages)).not.toThrow();
});
