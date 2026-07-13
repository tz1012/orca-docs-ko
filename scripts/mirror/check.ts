import { spawn, type ChildProcess } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";
import { z } from "zod";

import {
  assertNotice,
  contentRelativePath,
  validateInternalLinks,
} from "./apply.js";
import { canMirrorAsset, discoverDocs } from "./discover.js";
import { extractPage } from "./extract.js";
import { sha256 } from "./hash.js";
import {
  assertExactInventory,
  expectedFileInventory,
} from "./inventory.js";
import {
  translationRelativePath,
  validateRetainedTranslation,
  validateTranslation,
} from "./jobs.js";
import { withWorkspaceLock } from "./lock.js";
import {
  SourceManifestSchema,
  TranslationFileSchema,
  type ManifestPage,
  type SourceManifest,
  type SourcePage,
  type TranslationFile,
} from "./model.js";
import {
  defaultMirrorConfig,
  resolveWithin,
  summaryOnly,
  validateMirrorConfigPaths,
  type MirrorConfig,
  type MirrorSummary,
} from "./prepare.js";
import { renderPage, TRANSLATION_NOTICE } from "./render.js";
import {
  countFences,
  requiresKoreanTranslation,
} from "./translation-policy.js";

export interface CheckResult extends MirrorSummary {}

const messageFor = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const compareStrings = (left: string, right: string) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const sameStrings = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const readManifest = async (path: string): Promise<SourceManifest> =>
  SourceManifestSchema.parse(JSON.parse(await readFile(path, "utf8")));

const readTranslation = async (
  root: string,
  mirrorPath: string,
): Promise<TranslationFile> =>
  TranslationFileSchema.parse(
    JSON.parse(
      await readFile(
        resolveWithin(
          root,
          join(root, translationRelativePath(mirrorPath)),
          `translation path for ${mirrorPath}`,
        ),
        "utf8",
      ),
    ),
  );

const expectedSegmentHashes = (page: SourcePage) =>
  Object.fromEntries(
    page.segments
      .map((segment) => [segment.id, segment.sourceHash] as const)
      .sort(([left], [right]) => compareStrings(left, right)),
  );

const expectedSegmentValidation = (page: SourcePage) =>
  Object.fromEntries(
    page.segments
      .map((segment) => [
        segment.id,
        {
          kind: segment.kind,
          fencedCodeCount: countFences(segment.source),
          protectedTokens: Object.keys(segment.protected).sort(compareStrings),
          requiresKorean: requiresKoreanTranslation(segment),
        },
      ] as const)
      .sort(([left], [right]) => compareStrings(left, right)),
  );

const recordsMatch = (
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>,
) => JSON.stringify(left) === JSON.stringify(right);

const assertCurrentSource = (page: SourcePage, manifestPage: ManifestPage) => {
  if (
    !sameStrings(
      page.images.map((image) => image.sourceUrl),
      manifestPage.images.map((image) => image.sourceUrl),
    )
  ) {
    throw new Error(`Image state is stale for ${page.mirrorPath}`);
  }
  if (
    page.sourceUrl !== manifestPage.sourceUrl ||
    page.mirrorPath !== manifestPage.mirrorPath ||
    page.titleSegmentId !== manifestPage.titleSegmentId ||
    page.pageHash !== manifestPage.pageHash ||
    page.sitemapLastmod !== manifestPage.sitemapLastmod ||
    !recordsMatch(
      expectedSegmentHashes(page),
      manifestPage.segmentHashes,
    ) ||
    !recordsMatch(
      expectedSegmentValidation(page),
      manifestPage.segmentValidation,
    )
  ) {
    throw new Error(
      `Source hashes or validation metadata is stale for ${page.mirrorPath}`,
    );
  }
};

const withManifestState = (
  page: SourcePage,
  manifestPage: ManifestPage,
): SourcePage => ({
  ...page,
  checkedAt: manifestPage.checkedAt,
  sitemapLastmod: manifestPage.sitemapLastmod,
  images: manifestPage.images,
});

const validateImages = async (
  manifestPages: readonly ManifestPage[],
  robotsText: string,
  assetRoot: string,
) => {
  for (const page of manifestPages) {
    for (const image of page.images) {
      const allowed = canMirrorAsset(robotsText, new URL(image.sourceUrl));
      if (image.robotsRemote === allowed) {
        throw new Error(`Invalid remote image exception status: ${image.sourceUrl}`);
      }
      if (image.robotsRemote) {
        if (image.localPath !== null || image.contentHash !== null) {
          throw new Error(`Remote image exception cannot be local: ${image.sourceUrl}`);
        }
        continue;
      }
      if (image.localPath === null || image.contentHash === null) {
        throw new Error(`Allowed image is not mirrored locally: ${image.sourceUrl}`);
      }
      const body = new Uint8Array(
        await readFile(
          resolveWithin(
            assetRoot,
            join(assetRoot, basename(image.localPath)),
            `asset path for ${image.localPath}`,
          ),
        ),
      );
      if (sha256(body) !== image.contentHash) {
        throw new Error(`Local image hash mismatch: ${image.localPath}`);
      }
    }
  }
};

const NotFoundFrontmatterSchema = z.object({
  title: z.literal("페이지를 찾을 수 없습니다"),
  sourceUrl: z.literal("https://www.onorca.dev/docs"),
  checkedAt: z.iso.datetime(),
  draft: z.literal(true),
  translationNotice: z.object({
    title: z.literal(TRANSLATION_NOTICE.title),
    message: z.literal(TRANSLATION_NOTICE.message),
    rights: z.literal(TRANSLATION_NOTICE.rights),
  }),
});

export const parseNotFoundFrontmatter = (source: string) => {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source)?.[1];
  if (frontmatter === undefined) {
    throw new Error("The Korean not-found entry is missing required metadata");
  }
  try {
    return NotFoundFrontmatterSchema.parse(parseYaml(frontmatter));
  } catch (error) {
    throw new Error("The Korean not-found entry is missing required metadata", {
      cause: error,
    });
  }
};

const BUILD_INTEGRITY_WARNING =
  /(?:\[WARN\][^\r\n]*(?:not found|could not render|broken link|missing (?:page|asset))|Entry [^\r\n]* was not found)/iu;

export const assertCleanBuildOutput = (output: string) => {
  const warning = BUILD_INTEGRITY_WARNING.exec(output)?.[0];
  if (warning !== undefined) {
    throw new Error(`Build warning indicates incomplete output: ${warning}`);
  }
};

export const waitForBuildProcess = (child: ChildProcess) =>
  new Promise<void>((resolveBuild, rejectBuild) => {
    if (child.stdout === null || child.stderr === null) {
      rejectBuild(new Error("Build process output pipes are unavailable"));
      return;
    }
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", rejectBuild);
    child.once("close", (code) => {
      if (code === 0) {
        try {
          assertCleanBuildOutput(`${stdout}\n${stderr}`);
          resolveBuild();
        } catch (error) {
          rejectBuild(error);
        }
      } else {
        rejectBuild(
          new Error(
            `pnpm build failed with exit code ${code}${stderr.trim().length === 0 ? "" : `: ${stderr.trim()}`}`,
          ),
        );
      }
    });
  });

const runDefaultBuild = (workspaceRoot: string) => {
  const child = spawn(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["build"],
    {
      cwd: workspaceRoot,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  return waitForBuildProcess(child);
};

const checkMirrorUnlocked = async (
  config: MirrorConfig,
): Promise<CheckResult> => {
  const manifest = await readManifest(config.manifestPath);
  const discovery = await discoverDocs(config.client, config.origin);
  if (discovery.pages.length === 0) {
    throw new Error("Current documentation sitemap is empty");
  }

  const checkedAt = (config.now ?? (() => new Date().toISOString()))();
  const observedPages = await Promise.all(
    discovery.pages.map(async ({ url, lastmod }) =>
      extractPage({
        html: await config.client.text(url),
        sourceUrl: url,
        checkedAt,
        sitemapLastmod: lastmod,
      }),
    ),
  );
  const observedPaths = observedPages
    .map((page) => page.mirrorPath)
    .sort(compareStrings);
  const activePages = Object.values(manifest.pages)
    .filter((page) => page.status === "active")
    .sort((left, right) => compareStrings(left.mirrorPath, right.mirrorPath));
  const activePaths = activePages.map((page) => page.mirrorPath);
  if (!sameStrings(observedPaths, activePaths)) {
    throw new Error(
      `Active mirror pages do not match the current sitemap: expected ${observedPaths.join(", ")}; received ${activePaths.join(", ")}`,
    );
  }

  const pendingPages = Object.values(manifest.pages)
    .filter((page) => page.status === "pending-removal")
    .sort((left, right) => compareStrings(left.mirrorPath, right.mirrorPath));
  for (const pending of pendingPages) {
    if (observedPaths.includes(pending.mirrorPath)) {
      throw new Error(
        `Pending-removal page is still present in the sitemap: ${pending.mirrorPath}`,
      );
    }
  }

  const manifestPages = [...activePages, ...pendingPages];
  const committedPaths = manifestPages
    .map((page) => page.mirrorPath)
    .sort(compareStrings);
  await assertExactInventory(
    "Content",
    config.contentRoot,
    expectedFileInventory([
      "404.md",
      ...committedPaths.map(contentRelativePath),
    ]),
  );
  await assertExactInventory(
    "Translation",
    config.translationRoot,
    expectedFileInventory([
      ".gitkeep",
      "README.md",
      ...committedPaths.map(translationRelativePath),
    ]),
  );
  await assertExactInventory(
    "Asset",
    config.assetRoot,
    expectedFileInventory(
      manifestPages
        .flatMap((page) => page.images)
        .flatMap((image) =>
          image.localPath === null ? [] : [basename(image.localPath)],
        ),
    ),
  );

  const notFoundPath = resolveWithin(
    config.contentRoot,
    resolve(config.contentRoot, "404.md"),
    "not-found content path",
  );
  parseNotFoundFrontmatter(await readFile(notFoundPath, "utf8"));

  const actualContent = new Map<string, string>();
  for (const mirrorPath of committedPaths) {
    const path = resolveWithin(
      config.contentRoot,
      join(config.contentRoot, contentRelativePath(mirrorPath)),
      `content path for ${mirrorPath}`,
    );
    actualContent.set(mirrorPath, await readFile(path, "utf8"));
  }

  const renderedPages = new Map<string, string>();
  const observedByPath = new Map(
    observedPages.map((page) => [page.mirrorPath, page]),
  );
  for (const manifestPage of activePages) {
    const observed = observedByPath.get(manifestPage.mirrorPath)!;
    assertCurrentSource(observed, manifestPage);
    const page = withManifestState(observed, manifestPage);
    const translation = await readTranslation(
      config.translationRoot,
      page.mirrorPath,
    );
    validateTranslation(page, translation);
    const expected = renderPage(page, translation);
    const actual = actualContent.get(page.mirrorPath)!;
    assertNotice(page.mirrorPath, actual);
    if (actual !== expected) {
      throw new Error(`Rendered content is stale for ${page.mirrorPath}`);
    }
    if (
      manifestPage.renderedContentHash === null ||
      sha256(actual) !== manifestPage.renderedContentHash
    ) {
      throw new Error(`Rendered content hash is stale for ${page.mirrorPath}`);
    }
    renderedPages.set(page.mirrorPath, actual);
  }
  for (const manifestPage of pendingPages) {
    const translation = await readTranslation(
      config.translationRoot,
      manifestPage.mirrorPath,
    );
    validateRetainedTranslation(manifestPage, translation);
    const markdown = actualContent.get(manifestPage.mirrorPath)!;
    assertNotice(manifestPage.mirrorPath, markdown);
    if (
      manifestPage.renderedContentHash === null ||
      sha256(markdown) !== manifestPage.renderedContentHash
    ) {
      throw new Error(
        `Retained content hash mismatch for ${manifestPage.mirrorPath}`,
      );
    }
    renderedPages.set(manifestPage.mirrorPath, markdown);
  }

  validateInternalLinks(renderedPages);
  await validateImages(
    manifestPages,
    discovery.robotsText,
    config.assetRoot,
  );
  await (config.runBuild ?? (() => runDefaultBuild(config.workspaceRoot)))();

  const finalManifestIdentity = await readManifest(config.manifestPath);
  if (JSON.stringify(finalManifestIdentity) !== JSON.stringify(manifest)) {
    throw new Error("Source manifest changed during check; retry validation");
  }

  const images = manifestPages.flatMap(
    (page) => page.images,
  );
  return {
    discovered: discovery.pages.length,
    added: 0,
    updated: 0,
    unchanged: activePages.length,
    pendingRemoval: pendingPages.length,
    removed: 0,
    translatedSegments: activePages.reduce(
      (count, page) => count + Object.keys(page.segmentHashes).length,
      0,
    ),
    localImages: images.filter((image) => image.localPath !== null).length,
    remoteImages: images.filter((image) => image.robotsRemote).length,
  };
};

export const checkMirror = async (
  config: MirrorConfig,
): Promise<CheckResult> => {
  await validateMirrorConfigPaths(config);
  return withWorkspaceLock(config.workspaceRoot, () => checkMirrorUnlocked(config));
};

const runCli = async () => {
  const result = await checkMirror(defaultMirrorConfig());
  process.stdout.write(`${JSON.stringify(summaryOnly(result))}\n`);
};

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (executedPath === fileURLToPath(import.meta.url)) {
  runCli().catch((error: unknown) => {
    process.stderr.write(`${messageFor(error)}\n`);
    process.exitCode = 1;
  });
}
