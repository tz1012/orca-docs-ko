import { spawn } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertNotice,
  validateInternalLinks,
} from "./apply.js";
import { canMirrorAsset, discoverDocs } from "./discover.js";
import { extractPage } from "./extract.js";
import { sha256 } from "./hash.js";
import {
  translationRelativePath,
  validateTranslation,
} from "./jobs.js";
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
  summaryOnly,
  type MirrorConfig,
  type MirrorSummary,
} from "./prepare.js";
import { renderPage } from "./render.js";

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
      await readFile(join(root, translationRelativePath(mirrorPath)), "utf8"),
    ),
  );

const expectedSegmentHashes = (page: SourcePage) =>
  Object.fromEntries(
    page.segments
      .map((segment) => [segment.id, segment.sourceHash] as const)
      .sort(([left], [right]) => compareStrings(left, right)),
  );

const recordsMatch = (
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
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
    )
  ) {
    throw new Error(`Source hashes are stale for ${page.mirrorPath}`);
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

const validatePendingTranslation = (
  manifestPage: ManifestPage,
  translation: TranslationFile,
) => {
  if (
    translation.sourceUrl !== manifestPage.sourceUrl ||
    translation.mirrorPath !== manifestPage.mirrorPath
  ) {
    throw new Error(
      `Pending-removal translation identity is stale for ${manifestPage.mirrorPath}`,
    );
  }
  for (const [segmentId, sourceHash] of Object.entries(
    manifestPage.segmentHashes,
  )) {
    if (translation.entries[segmentId]?.sourceHash !== sourceHash) {
      throw new Error(
        `Pending-removal translation hash is stale for ${segmentId}`,
      );
    }
  }
};

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
        await readFile(join(assetRoot, basename(image.localPath))),
      );
      if (sha256(body) !== image.contentHash) {
        throw new Error(`Local image hash mismatch: ${image.localPath}`);
      }
    }
  }
};

const listFiles = async (root: string, extension: string): Promise<string[]> => {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(path);
    }
  }
  return files.sort(compareStrings);
};

const contentPathForFile = (root: string, file: string) => {
  const portable = relative(root, file).split(sep).join("/");
  const suffix = portable === "index.md" ? "" : portable.replace(/\/index\.md$/u, "");
  return suffix.length === 0 ? "/docs/" : `/docs/${suffix}/`;
};

const translationPathForFile = (root: string, file: string) => {
  const portable = relative(root, file).split(sep).join("/");
  const suffix = portable === "index.json" ? "" : portable.replace(/\/index\.json$/u, "");
  return suffix.length === 0 ? "/docs/" : `/docs/${suffix}/`;
};

const validateNotFoundEntry = (source: string) => {
  assertNotice("/404", source);
  if (
    !source.includes('title: "페이지를 찾을 수 없습니다"') ||
    !source.includes("draft: true") ||
    !source.includes("sourceUrl: https://www.onorca.dev/docs") ||
    !/^checkedAt: ["']?\d{4}-\d{2}-\d{2}T[^\r\n"']+["']?$/mu.test(source)
  ) {
    throw new Error("The Korean not-found entry is missing required metadata");
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

const runDefaultBuild = (workspaceRoot: string) =>
  new Promise<void>((resolveBuild, rejectBuild) => {
    const child = spawn(
      process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      ["build"],
      {
        cwd: workspaceRoot,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );
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
    child.once("exit", (code) => {
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

export const checkMirror = async (
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

  const contentFiles = await listFiles(config.contentRoot, ".md");
  const notFoundPath = resolve(config.contentRoot, "404.md");
  const notFoundFile = contentFiles.find((file) => resolve(file) === notFoundPath);
  if (notFoundFile === undefined) {
    throw new Error("Missing Korean not-found entry");
  }
  validateNotFoundEntry(await readFile(notFoundFile, "utf8"));
  const unexpectedContent = contentFiles.filter(
    (file) => resolve(file) !== notFoundPath && basename(file) !== "index.md",
  );
  if (unexpectedContent.length > 0) {
    throw new Error(
      `Unexpected generated content files: ${unexpectedContent.join(", ")}`,
    );
  }

  const actualContent = new Map<string, string>();
  for (const file of contentFiles.filter(
    (candidate) => basename(candidate) === "index.md",
  )) {
    const mirrorPath = contentPathForFile(config.contentRoot, file);
    actualContent.set(mirrorPath, await readFile(file, "utf8"));
  }
  const actualTranslations = (
    await listFiles(config.translationRoot, ".json")
  ).map((file) => translationPathForFile(config.translationRoot, file));
  const committedPaths = [...activePaths, ...pendingPages.map((page) => page.mirrorPath)].sort(
    compareStrings,
  );
  if (
    !sameStrings([...actualContent.keys()].sort(compareStrings), committedPaths)
  ) {
    throw new Error("Generated content pages do not match manifest pages");
  }
  if (!sameStrings(actualTranslations.sort(compareStrings), committedPaths)) {
    throw new Error("Translation files do not match manifest pages");
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
    renderedPages.set(page.mirrorPath, actual);
  }
  for (const manifestPage of pendingPages) {
    const translation = await readTranslation(
      config.translationRoot,
      manifestPage.mirrorPath,
    );
    validatePendingTranslation(manifestPage, translation);
    const markdown = actualContent.get(manifestPage.mirrorPath)!;
    assertNotice(manifestPage.mirrorPath, markdown);
    renderedPages.set(manifestPage.mirrorPath, markdown);
  }

  validateInternalLinks(renderedPages);
  await validateImages(
    [...activePages, ...pendingPages],
    discovery.robotsText,
    config.assetRoot,
  );
  await (config.runBuild ?? (() => runDefaultBuild(config.workspaceRoot)))();

  const images = [...activePages, ...pendingPages].flatMap(
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
