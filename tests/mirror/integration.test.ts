import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { hostname } from "node:os";
import { dirname, join, resolve } from "node:path";

import { expect, test } from "vitest";

import {
  applyMirror,
  contentRelativePath,
  validateInternalLinks,
} from "../../scripts/mirror/apply.js";
import {
  assertCleanBuildOutput,
  checkMirror,
} from "../../scripts/mirror/check.js";
import { translationRelativePath } from "../../scripts/mirror/jobs.js";
import {
  AtomicRollbackError,
  prepareMirror,
  replacePathsAtomically,
  SUMMARY_KEYS,
} from "../../scripts/mirror/prepare.js";
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

test("places generated entries under the docs route prefix", () => {
  expect(contentRelativePath("/docs/")).toBe("docs.md");
  expect(contentRelativePath("/docs/install/")).toBe(
    join("docs", "install.md"),
  );
});

test("migrates previously generated root entries into the docs route prefix", async () => {
  const workspace = await fixtureWorkspace();
  const legacyPath = join(workspace.config.contentRoot, "install", "index.md");
  await mkdir(dirname(legacyPath), { recursive: true });
  await writeFile(legacyPath, "legacy generated content\n", "utf8");
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);

  await applyMirror(workspace.config);

  await expect(stat(legacyPath)).rejects.toMatchObject({ code: "ENOENT" });
  await expect(
    stat(join(workspace.config.contentRoot, "docs", "install.md")),
  ).resolves.toBeDefined();
});

test("does not promote partial or invalid output", async () => {
  const workspace = await fixtureWorkspace();

  const prepared = await prepareMirror(workspace.config);

  expect(prepared.jobs).toHaveLength(2);
  await expect(applyMirror(workspace.config)).rejects.toThrow(/translation/i);
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects ghost content before promoting the staged state", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const ghostPath = join(workspace.config.contentRoot, "ghost", "index.md");
  await mkdir(dirname(ghostPath), { recursive: true });
  await writeFile(ghostPath, "ghost content\n", "utf8");

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /content inventory.*unexpected.*ghost/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects ghost MDX before it can become a public route", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const ghostPath = join(workspace.config.contentRoot, "ghost", "index.mdx");
  await mkdir(dirname(ghostPath), { recursive: true });
  await writeFile(ghostPath, "---\ntitle: Ghost\n---\n", "utf8");

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /content inventory.*unexpected.*file:ghost\/index\.mdx/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects ghost translations before promoting the staged state", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const ghostPath = join(
    workspace.config.translationRoot,
    "ghost",
    "index.json",
  );
  await mkdir(dirname(ghostPath), { recursive: true });
  await writeFile(ghostPath, "{}\n", "utf8");

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /translation inventory.*unexpected.*ghost/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects arbitrary translation files before promotion", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await writeFile(
    join(workspace.config.translationRoot, "translator-notes.txt"),
    "not a translation\n",
    "utf8",
  );

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /translation inventory.*unexpected.*file:translator-notes\.txt/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects unexpected empty directories before promotion", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await mkdir(join(workspace.config.translationRoot, "abandoned"));

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /translation inventory.*unexpected.*directory:abandoned/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects an expected content directory junction before rendering through it", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const target = join(workspace.root, "linked-render-target");
  const sentinel = "do not overwrite through a junction\n";
  await mkdir(target);
  await writeFile(join(target, "index.md"), sentinel, "utf8");
  await symlink(
    target,
    join(workspace.config.contentRoot, "install"),
    process.platform === "win32" ? "junction" : "dir",
  );

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /content inventory.*unexpected.*symbolic-link:install/i,
  );
  await expect(readFile(join(target, "index.md"), "utf8")).resolves.toBe(
    sentinel,
  );
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
    readFile(
      join(
        workspace.config.contentRoot,
        contentRelativePath("/docs/install/"),
      ),
      "utf8",
    ),
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

test("check rejects a ghost MDX route before running the build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  const ghostPath = join(workspace.config.contentRoot, "ghost", "index.mdx");
  await mkdir(dirname(ghostPath), { recursive: true });
  await writeFile(ghostPath, "---\ntitle: Ghost\n---\n", "utf8");
  let builds = 0;

  await expect(
    checkMirror({
      ...workspace.config,
      runBuild: async () => {
        builds += 1;
      },
    }),
  ).rejects.toThrow(/content inventory.*unexpected.*file:ghost\/index\.mdx/i);
  expect(builds).toBe(0);
});

test("check rejects arbitrary translation files before running the build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  await writeFile(
    join(workspace.config.translationRoot, "translator-notes.txt"),
    "not a translation\n",
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
  ).rejects.toThrow(
    /translation inventory.*unexpected.*file:translator-notes\.txt/i,
  );
  expect(builds).toBe(0);
});

test("check rejects a nested junction or symlink before running the build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  const target = join(workspace.root, "linked-content-target");
  await mkdir(target);
  await writeFile(join(target, "index.md"), "linked ghost\n", "utf8");
  await symlink(
    target,
    join(workspace.config.contentRoot, "linked-ghost"),
    process.platform === "win32" ? "junction" : "dir",
  );
  let builds = 0;

  await expect(
    checkMirror({
      ...workspace.config,
      runBuild: async () => {
        builds += 1;
      },
    }),
  ).rejects.toThrow(
    /content inventory.*unexpected.*symbolic-link:linked-ghost/i,
  );
  expect(builds).toBe(0);
});

test("rejects an unreferenced asset before promotion", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await mkdir(workspace.config.assetRoot, { recursive: true });
  await writeFile(
    join(workspace.config.assetRoot, "unreferenced.bin"),
    new Uint8Array([1, 2, 3]),
  );

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /asset inventory.*unexpected.*file:unreferenced\.bin/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("check rejects an unreferenced asset before running the build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  await writeFile(
    join(workspace.config.assetRoot, "unreferenced.bin"),
    new Uint8Array([1, 2, 3]),
  );
  let builds = 0;

  await expect(
    checkMirror({
      ...workspace.config,
      runBuild: async () => {
        builds += 1;
      },
    }),
  ).rejects.toThrow(
    /asset inventory.*unexpected.*file:unreferenced\.bin/i,
  );
  expect(builds).toBe(0);
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

  const removalConfig = {
    ...pendingConfig,
    client: {
      ...pendingConfig.client,
      text: async (url: URL) =>
        url.pathname === "/docs"
          ? workspace.config.client.text(url)
          : pendingConfig.client.text(url),
    },
  };
  await prepareMirror(removalConfig);
  await completeTranslations(workspace);
  const removed = await applyMirror(removalConfig);
  expect(removed).toMatchObject({ pendingRemoval: 0, removed: 1 });
  await expect(
    stat(join(workspace.config.contentRoot, "install")),
  ).rejects.toMatchObject({ code: "ENOENT" });
  await expect(
    stat(join(workspace.config.translationRoot, "install")),
  ).rejects.toMatchObject({ code: "ENOENT" });
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

test("keeps twenty robots-disallowed GIFs remote across repeated prepare runs", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const blockedImages = Array.from(
    { length: 10 },
    (_, index) => `<img src="/docs/blocked-${index}.gif" alt="Blocked ${index}">`,
  ).join("\n");
  const config = {
    ...workspace.config,
    client: {
      text: async (url: URL) => {
        if (url.pathname === "/robots.txt") {
          return "User-agent: *\nDisallow: /docs/*.gif";
        }
        if (url.pathname === "/docs" || url.pathname === "/docs/install") {
          return `<!doctype html><main><article><h1>Docs</h1>${blockedImages}</article></main>`;
        }
        return client.text(url);
      },
      bytes: async (url: URL) => {
        throw new Error(`Blocked GIF must not be downloaded: ${url.href}`);
      },
    },
  };

  for (let run = 0; run < 2; run += 1) {
    const result = await prepareMirror(config);
    expect(result).toMatchObject({ localImages: 0, remoteImages: 20 });
    const snapshot = JSON.parse(
      await readFile(join(config.stagingRoot, "snapshot.json"), "utf8"),
    ) as { plan: { pages: Record<string, { images: Array<{ robotsRemote: boolean }> }> } };
    expect(
      Object.values(snapshot.plan.pages).flatMap((page) => page.images),
    ).toHaveLength(20);
    expect(
      Object.values(snapshot.plan.pages)
        .flatMap((page) => page.images)
        .every((image) => image.robotsRemote),
    ).toBe(true);
  }
});

test("check reports a missing manifest asset as an inventory mismatch", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const imageConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) =>
        url.pathname === "/docs/install"
          ? `<!doctype html><main><article>
              <h1>Install</h1><p>Read the documentation.</p>
              <img src="/allowed.png" alt="Allowed">
            </article></main>`
          : client.text(url),
    },
  };
  await prepareMirror(imageConfig);
  await completeTranslations(workspace);
  await applyMirror(imageConfig);
  const manifest = await workspace.readManifest();
  const localPath = Object.values(manifest.pages)
    .flatMap((page) => page.images)
    .find((image) => image.localPath !== null)!.localPath!;
  await rm(
    join(workspace.config.assetRoot, localPath.split("/").at(-1)!),
    { force: true },
  );

  await expect(
    checkMirror({ ...imageConfig, runBuild: async () => undefined }),
  ).rejects.toThrow(/asset inventory.*missing.*file:/i);
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
    contentRelativePath("/docs/install/"),
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

test("does not treat remote Markdown image destinations as internal page links", () => {
  const imageOnly = new Map([
    [
      "/docs/",
      "![Orca window](https://www.onorca.dev/docs/orca-split-screen.gif)",
    ],
  ]);
  const brokenLink = new Map([
    [
      "/docs/",
      "[Missing page](https://www.onorca.dev/docs/missing-page)",
    ],
  ]);

  expect(() => validateInternalLinks(imageOnly)).not.toThrow();
  expect(() => validateInternalLinks(brokenLink)).toThrow(/broken internal link/i);
});

test("does not treat a docs-shaped path on another host as an internal link", () => {
  const pages = new Map([
    [
      "/docs/",
      "[Claude Code](https://docs.anthropic.com/claude/docs/claude-code)",
    ],
  ]);

  expect(() => validateInternalLinks(pages)).not.toThrow();
});

test("rejects traversal in prepared plan arrays before mutating content", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const snapshotPath = join(workspace.config.stagingRoot, "snapshot.json");
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8")) as {
    plan: { remove: string[] };
  };
  snapshot.plan.remove.push("/docs/../docs/victim/");
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  const victimPath = join(
    workspace.config.contentRoot,
    "victim",
    "index.md",
  );
  await mkdir(dirname(victimPath), { recursive: true });
  await writeFile(victimPath, "do not remove", "utf8");

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /invalid prepared mirror snapshot|canonical.*mirror path/i,
  );
  await expect(readFile(victimPath, "utf8")).resolves.toBe("do not remove");
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects a canonical prepared plan that does not match its pages", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const snapshotPath = join(workspace.config.stagingRoot, "snapshot.json");
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8")) as {
    plan: { add: string[] };
  };
  snapshot.plan.add.push("/docs/ghost/");
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /prepared.*plan.*inconsistent/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("rejects configured write roots outside the workspace", async () => {
  const workspace = await fixtureWorkspace();
  const outsideJobs = resolve(workspace.root, "..", "outside-jobs");
  await rm(outsideJobs, { recursive: true, force: true });

  await expect(
    prepareMirror({ ...workspace.config, jobRoot: outsideJobs }),
  ).rejects.toThrow(/jobRoot.*outside.*workspace/i);
  await expect(stat(outsideJobs)).rejects.toMatchObject({ code: "ENOENT" });
});

test("does not report failure when only committed-backup cleanup fails", async () => {
  const workspace = await fixtureWorkspace();
  const transactionRoot = join(workspace.root, "transaction-cleanup");
  const target = join(transactionRoot, "target.txt");
  const prepared = join(transactionRoot, "prepared.txt");
  await mkdir(transactionRoot, { recursive: true });
  await writeFile(target, "old", "utf8");
  await writeFile(prepared, "new", "utf8");

  const result = await replacePathsAtomically(
    [{ target, prepared }],
    {
      mkdir,
      rename,
      stat,
      rm: async (path, options) => {
        if (String(path).includes(".backup")) {
          throw new Error("simulated cleanup denial");
        }
        await rm(path, options);
      },
    },
  );

  expect(await readFile(target, "utf8")).toBe("new");
  expect(result.cleanupFailures).toHaveLength(1);
  expect(await readdir(transactionRoot)).toEqual(
    expect.arrayContaining([expect.stringMatching(/\.backup$/u)]),
  );
});

test("surfaces rollback failures with actionable recovery paths", async () => {
  const workspace = await fixtureWorkspace();
  const transactionRoot = join(workspace.root, "transaction-rollback");
  const firstTarget = join(transactionRoot, "first.txt");
  const secondTarget = join(transactionRoot, "second.txt");
  const firstPrepared = join(transactionRoot, "first.new.txt");
  const missingPrepared = join(transactionRoot, "missing.new.txt");
  await mkdir(transactionRoot, { recursive: true });
  await writeFile(firstTarget, "first-old", "utf8");
  await writeFile(secondTarget, "second-old", "utf8");
  await writeFile(firstPrepared, "first-new", "utf8");

  const operation = replacePathsAtomically(
    [
      { target: firstTarget, prepared: firstPrepared },
      { target: secondTarget, prepared: missingPrepared },
    ],
    {
      mkdir,
      rm,
      stat,
      rename: async (source, target) => {
        if (
          String(source).includes(".backup") &&
          resolve(String(target)) === resolve(firstTarget)
        ) {
          throw new Error("simulated restore denial");
        }
        await rename(source, target);
      },
    },
  );

  await expect(operation).rejects.toBeInstanceOf(AtomicRollbackError);
  await expect(operation).rejects.toThrow(/restore.*first\.txt.*backup/i);
});

test("serializes prepare operations with a workspace lock", async () => {
  const workspace = await fixtureWorkspace();
  let entered!: () => void;
  let release!: () => void;
  const enteredRequest = new Promise<void>((resolveEntered) => {
    entered = resolveEntered;
  });
  const requestGate = new Promise<void>((resolveGate) => {
    release = resolveGate;
  });
  const client = workspace.config.client;
  let blocked = false;
  const first = prepareMirror({
    ...workspace.config,
    client: {
      ...client,
      text: async (url) => {
        if (!blocked && url.pathname === "/robots.txt") {
          blocked = true;
          entered();
          await requestGate;
        }
        return client.text(url);
      },
    },
  });
  await enteredRequest;

  await expect(prepareMirror(workspace.config)).rejects.toThrow(
    /workspace.*lock|synchronization.*in progress/i,
  );
  release();
  await expect(first).resolves.toBeDefined();
});

test("safely recovers a stale lock owned by a dead local process", async () => {
  const workspace = await fixtureWorkspace();
  const namespacePath = join(workspace.root, ".mirror", "sync.lock");
  const activePath = join(namespacePath, "active");
  const ownerPath = join(activePath, "owner.json");
  await mkdir(activePath, { recursive: true });
  await writeFile(
    ownerPath,
    `${JSON.stringify({
      schemaVersion: 1,
      token: "stale-test-token",
      pid: 2_147_483_647,
      hostname: hostname(),
      createdAt: "2000-01-01T00:00:00.000Z",
    })}\n`,
    "utf8",
  );

  await expect(prepareMirror(workspace.config)).resolves.toBeDefined();
  await expect(stat(activePath)).rejects.toMatchObject({ code: "ENOENT" });
});

test("holds the workspace lock through the complete check build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  let entered!: () => void;
  let release!: () => void;
  const enteredBuild = new Promise<void>((resolveEntered) => {
    entered = resolveEntered;
  });
  const buildGate = new Promise<void>((resolveGate) => {
    release = resolveGate;
  });
  const checking = checkMirror({
    ...workspace.config,
    runBuild: async () => {
      entered();
      await buildGate;
    },
  });
  await enteredBuild;

  await expect(prepareMirror(workspace.config)).rejects.toThrow(
    /workspace.*lock|synchronization.*in progress/i,
  );
  release();
  await expect(checking).resolves.toBeDefined();
});

test("check rejects a manifest identity change during its build", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  const manifest = await workspace.readManifest();

  await expect(
    checkMirror({
      ...workspace.config,
      runBuild: async () => {
        await writeFile(
          workspace.config.manifestPath,
          `${JSON.stringify({
            ...manifest,
            generatedAt: "2026-07-13T04:05:06.000Z",
          }, null, 2)}\n`,
          "utf8",
        );
      },
    }),
  ).rejects.toThrow(/manifest changed during check/i);
});

test("apply and check both honor an existing live workspace lock", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const activePath = join(
    workspace.root,
    ".mirror",
    "sync.lock",
    "active",
  );
  await mkdir(activePath, { recursive: true });
  await writeFile(
    join(activePath, "owner.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      token: "live-test-token",
      pid: process.pid,
      hostname: hostname(),
      createdAt: new Date().toISOString(),
    })}\n`,
    "utf8",
  );

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /workspace.*lock|synchronization.*in progress/i,
  );
  await expect(checkMirror(workspace.config)).rejects.toThrow(
    /workspace.*lock|synchronization.*in progress/i,
  );
  await rm(activePath, { force: true, recursive: true });
});

test("rejects an apply when the prepared manifest identity is stale", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  const changedManifest = {
    ...workspace.originalManifest,
    generatedAt: "2026-07-13T01:02:03.000Z",
  };
  await writeFile(
    workspace.config.manifestPath,
    `${JSON.stringify(changedManifest, null, 2)}\n`,
    "utf8",
  );

  await expect(applyMirror(workspace.config)).rejects.toThrow(
    /manifest changed after prepare/i,
  );
  expect(await workspace.readManifest()).toEqual(changedManifest);
});

const prepareProtectedPendingPage = async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const linkedConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) =>
        url.pathname === "/docs/install"
          ? `<!doctype html><main><article><h1>Install</h1>
              <p>Continue to <a href="/docs">the documentation landing page</a> for setup details.</p>
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
  const path = join(
    workspace.config.translationRoot,
    "install",
    "index.json",
  );
  const translation = JSON.parse(await readFile(path, "utf8")) as {
    entries: Record<string, { translated: string }>;
  };
  const paragraph = Object.values(translation.entries).find(({ translated }) =>
    translated.includes("ORCA_PROTECTED_"),
  )!;
  return { workspace, pendingConfig, path, translation, paragraph };
};

const englishOnlyWithRetainedTokens = (translated: string) => {
  const tokens = translated.match(/ORCA_PROTECTED_\d+/gu) ?? [];
  return `English only ${tokens.join(" ")}`;
};

test("validates protected tokens retained by pending-removal pages", async () => {
  const fixture = await prepareProtectedPendingPage();
  fixture.paragraph.translated = fixture.paragraph.translated.replace(
    /ORCA_PROTECTED_\d+/u,
    "removed-token",
  );
  await writeFile(
    fixture.path,
    `${JSON.stringify(fixture.translation, null, 2)}\n`,
    "utf8",
  );
  const before = await fixture.workspace.readManifest();

  await expect(applyMirror(fixture.pendingConfig)).rejects.toThrow(
    /protected token/i,
  );
  expect(await fixture.workspace.readManifest()).toEqual(before);
});

test("validates Korean coverage retained by pending-removal pages", async () => {
  const fixture = await prepareProtectedPendingPage();
  fixture.paragraph.translated = englishOnlyWithRetainedTokens(
    fixture.paragraph.translated,
  );
  await writeFile(
    fixture.path,
    `${JSON.stringify(fixture.translation, null, 2)}\n`,
    "utf8",
  );
  const before = await fixture.workspace.readManifest();

  await expect(applyMirror(fixture.pendingConfig)).rejects.toThrow(
    /Korean characters/i,
  );
  expect(await fixture.workspace.readManifest()).toEqual(before);
});

test("check revalidates retained pending-removal translation policy", async () => {
  const fixture = await prepareProtectedPendingPage();
  await applyMirror(fixture.pendingConfig);
  fixture.paragraph.translated = englishOnlyWithRetainedTokens(
    fixture.paragraph.translated,
  );
  await writeFile(
    fixture.path,
    `${JSON.stringify(fixture.translation, null, 2)}\n`,
    "utf8",
  );

  await expect(
    checkMirror({ ...fixture.pendingConfig, runBuild: async () => undefined }),
  ).rejects.toThrow(/Korean characters/i);
});

test("check rejects stale active-page validation metadata", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  const manifest = await workspace.readManifest();
  const page = manifest.pages["/docs/install/"]!;
  const segmentId = Object.keys(page.segmentValidation)[0]!;
  page.segmentValidation[segmentId]!.fencedCodeCount += 1;
  await writeFile(
    workspace.config.manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  await expect(
    checkMirror({ ...workspace.config, runBuild: async () => undefined }),
  ).rejects.toThrow(/validation metadata is stale/i);
});

test("apply rejects altered public Markdown for a retained page", async () => {
  const fixture = await prepareProtectedPendingPage();
  const contentPath = join(
    fixture.workspace.config.contentRoot,
    contentRelativePath("/docs/install/"),
  );
  await writeFile(
    contentPath,
    `${await readFile(contentPath, "utf8")}\nAltered retained content.\n`,
    "utf8",
  );

  await expect(applyMirror(fixture.pendingConfig)).rejects.toThrow(
    /retained content hash.*install/i,
  );
});

test("check rejects altered public Markdown for a retained page", async () => {
  const fixture = await prepareProtectedPendingPage();
  await applyMirror(fixture.pendingConfig);
  const contentPath = join(
    fixture.workspace.config.contentRoot,
    contentRelativePath("/docs/install/"),
  );
  await writeFile(
    contentPath,
    `${await readFile(contentPath, "utf8")}\nAltered after promotion.\n`,
    "utf8",
  );

  await expect(
    checkMirror({ ...fixture.pendingConfig, runBuild: async () => undefined }),
  ).rejects.toThrow(/retained content hash.*install/i);
});

test("retained translations preserve their fenced-code count", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const codeConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) =>
        url.pathname === "/docs/install"
          ? `<!doctype html><main><article><h1>Install</h1>
              <p>Run the installation command shown below.</p>
              <pre><code class="language-sh">orca open</code></pre>
            </article></main>`
          : client.text(url),
    },
  };
  await prepareMirror(codeConfig);
  await completeTranslations(workspace);
  await applyMirror(codeConfig);
  const pendingConfig = {
    ...codeConfig,
    client: {
      ...codeConfig.client,
      text: async (url: URL) =>
        url.pathname === "/sitemap.xml"
          ? "<?xml version=\"1.0\"?><urlset><url><loc>https://www.onorca.dev/docs</loc></url></urlset>"
          : codeConfig.client.text(url),
    },
  };
  await prepareMirror(pendingConfig);
  const translationPath = join(
    workspace.config.translationRoot,
    "install",
    "index.json",
  );
  const translation = JSON.parse(
    await readFile(translationPath, "utf8"),
  ) as { entries: Record<string, { translated: string }> };
  const codeEntry = Object.values(translation.entries).find(({ translated }) =>
    translated.includes("```"),
  )!;
  codeEntry.translated = `${codeEntry.translated}\n\`\`\``;
  await writeFile(
    translationPath,
    `${JSON.stringify(translation, null, 2)}\n`,
    "utf8",
  );

  await expect(applyMirror(pendingConfig)).rejects.toThrow(
    /fenced-code count/i,
  );
});

test("verifies staged asset bytes before promotion", async () => {
  const workspace = await fixtureWorkspace();
  const client = workspace.config.client;
  const imageConfig = {
    ...workspace.config,
    client: {
      ...client,
      text: async (url: URL) =>
        url.pathname === "/docs/install"
          ? `<!doctype html><main><article><h1>Install</h1>
              <p>Read the documentation.</p><img src="/allowed.png" alt="Allowed">
            </article></main>`
          : client.text(url),
    },
  };
  await prepareMirror(imageConfig);
  await completeTranslations(workspace);
  const snapshot = JSON.parse(
    await readFile(join(workspace.config.stagingRoot, "snapshot.json"), "utf8"),
  ) as { plan: { pages: Record<string, { images: Array<{ localPath: string | null }> }> } };
  const localPath = Object.values(snapshot.plan.pages)
    .flatMap(({ images }) => images)
    .find((image) => image.localPath !== null)!.localPath!;
  await writeFile(
    join(workspace.config.stagingRoot, "assets", localPath.split("/").at(-1)!),
    new Uint8Array([1, 2, 3]),
  );

  await expect(applyMirror(imageConfig)).rejects.toThrow(
    /local image hash mismatch/i,
  );
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});

test("does not accept 404 metadata spoofed in the Markdown body", async () => {
  const workspace = await fixtureWorkspace();
  await prepareMirror(workspace.config);
  await completeTranslations(workspace);
  await applyMirror(workspace.config);
  const path = join(workspace.config.contentRoot, "404.md");
  const source = await readFile(path, "utf8");
  await writeFile(
    path,
    `${source.replace(
      'title: "페이지를 찾을 수 없습니다"',
      'title: "Wrong title"',
    )}\n<!--
title: "페이지를 찾을 수 없습니다"
sourceUrl: https://www.onorca.dev/docs
checkedAt: "2026-07-13T01:00:00.000Z"
draft: true
-->\n`,
    "utf8",
  );

  await expect(
    checkMirror({ ...workspace.config, runBuild: async () => undefined }),
  ).rejects.toThrow(/not-found entry.*metadata/i);
});
