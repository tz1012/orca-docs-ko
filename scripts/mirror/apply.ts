import { randomUUID } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { canMirrorAsset } from "./discover.js";
import { sha256 } from "./hash.js";
import {
  translationRelativePath,
  validateReady,
  validateRetainedTranslation,
  validateTranslation,
} from "./jobs.js";
import { withWorkspaceLock } from "./lock.js";
import {
  SourceManifestSchema,
  TranslationFileSchema,
  type SourceManifest,
  type TranslationFile,
} from "./model.js";
import {
  defaultMirrorConfig,
  readPreparedSnapshot,
  replacePathsAtomically,
  resolveWithin,
  summaryOnly,
  validateMirrorConfigPaths,
  type MirrorConfig,
  type MirrorSummary,
} from "./prepare.js";
import {
  buildSidebar,
  renderPage,
  TRANSLATION_NOTICE,
  type RenderablePage,
} from "./render.js";
import {
  promoteManifest,
  recordRenderedContentHashes,
} from "./state.js";

export interface ApplyResult extends MirrorSummary {}

const messageFor = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

const pathExists = async (path: string) => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (errorCode(error) === "ENOENT") return false;
    throw error;
  }
};

const temporaryDirectoryFor = async (target: string) => {
  await mkdir(dirname(target), { recursive: true });
  return mkdtemp(join(dirname(target), `.${basename(target)}.tmp-`));
};

const temporaryFileFor = async (target: string) => {
  await mkdir(dirname(target), { recursive: true });
  return join(
    dirname(target),
    `.${basename(target)}.${randomUUID()}.tmp`,
  );
};

const cloneDirectory = async (source: string, target: string) => {
  if (await pathExists(source)) {
    await cp(source, target, { recursive: true });
  } else {
    await mkdir(target, { recursive: true });
  }
};

export const contentRelativePath = (mirrorPath: string) => {
  const suffix = mirrorPath.slice("/docs/".length, -1);
  return suffix.length === 0
    ? "index.md"
    : join(...suffix.split("/"), "index.md");
};

const canonicalMirrorPath = (pathname: string) => {
  if (pathname === "/docs" || pathname === "/docs/") return "/docs/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

const withoutInlineCode = (line: string) => {
  let output = "";
  let cursor = 0;
  while (cursor < line.length) {
    if (line[cursor] !== "`") {
      output += line[cursor];
      cursor += 1;
      continue;
    }
    let ticks = 1;
    while (line[cursor + ticks] === "`") ticks += 1;
    const delimiter = "`".repeat(ticks);
    const closing = line.indexOf(delimiter, cursor + ticks);
    if (closing < 0) {
      output += delimiter;
      cursor += ticks;
    } else {
      cursor = closing + ticks;
    }
  }
  return output;
};

const withoutCode = (markdown: string) => {
  let fence: { marker: string; length: number } | null = null;
  return markdown
    .split(/\r?\n/u)
    .map((line) => {
      const unquoted = line.replace(/^[ \t]{0,3}(?:>[ \t]*)*/u, "");
      const opening = /^(`{3,}|~{3,})/u.exec(unquoted)?.[1];
      if (fence !== null) {
        if (
          opening !== undefined &&
          opening[0] === fence.marker &&
          opening.length >= fence.length
        ) {
          fence = null;
        }
        return "";
      }
      if (opening !== undefined) {
        fence = { marker: opening[0]!, length: opening.length };
        return "";
      }
      if (/^(?: {4}|\t)/u.test(line)) return "";
      return withoutInlineCode(line);
    })
    .join("\n");
};

export const validateInternalLinks = (
  renderedPages: ReadonlyMap<string, string>,
) => {
  const activePaths = new Set(renderedPages.keys());
  const linkPattern = /(?:https:\/\/www\.onorca\.dev|\/orca-docs-ko)?(\/docs(?:\/[^\s)'"<>?#]*)?)(?:[?#][^\s)'"<>]*)?/gu;
  for (const [pagePath, markdown] of renderedPages) {
    for (const match of withoutCode(markdown).matchAll(linkPattern)) {
      const path = canonicalMirrorPath(match[1]!);
      if (!activePaths.has(path)) {
        throw new Error(`Broken internal link from ${pagePath} to ${path}`);
      }
    }
  }
};

export const assertNotice = (mirrorPath: string, markdown: string) => {
  const expected = [
    "translationNotice:",
    `  title: ${JSON.stringify(TRANSLATION_NOTICE.title)}`,
    `  message: ${JSON.stringify(TRANSLATION_NOTICE.message)}`,
    `  rights: ${JSON.stringify(TRANSLATION_NOTICE.rights)}`,
  ];
  if (!expected.every((value) => markdown.includes(value))) {
    throw new Error(`Missing translation notice metadata for ${mirrorPath}`);
  }
};

const readManifest = async (path: string): Promise<SourceManifest> =>
  SourceManifestSchema.parse(JSON.parse(await readFile(path, "utf8")));

const manifestsMatch = (left: SourceManifest, right: SourceManifest) =>
  JSON.stringify(left) === JSON.stringify(right);

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

const removePage = async (
  root: string,
  mirrorPath: string,
  kind: "content" | "translation",
) => {
  const path =
    kind === "content"
      ? resolveWithin(
          root,
          join(root, contentRelativePath(mirrorPath)),
          `content path for ${mirrorPath}`,
        )
      : resolveWithin(
          root,
          join(root, translationRelativePath(mirrorPath)),
          `translation path for ${mirrorPath}`,
        );
  await rm(path, { force: true });
};

const validateImageState = async (
  pages: ReadonlyArray<{ images: RenderablePage["page"]["images"] }>,
  robotsText: string,
  assetRoot: string,
) => {
  for (const page of pages) {
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
      const filename = basename(image.localPath);
      const assetPath = resolveWithin(
        assetRoot,
        join(assetRoot, filename),
        `asset path for ${image.localPath}`,
      );
      if (!(await pathExists(assetPath))) {
        throw new Error(`Missing local image asset: ${image.localPath}`);
      }
      const body = new Uint8Array(await readFile(assetPath));
      if (sha256(body) !== image.contentHash) {
        throw new Error(`Local image hash mismatch: ${image.localPath}`);
      }
    }
  }
};

const applyMirrorUnlocked = async (
  config: MirrorConfig,
): Promise<ApplyResult> => {
  const snapshot = await readPreparedSnapshot(config.stagingRoot);
  const ready = await validateReady(config.jobRoot, config.translationRoot);
  if (ready.remaining.length > 0 || ready.invalid.length > 0) {
    throw new Error(
      `Translation output is incomplete or invalid (${ready.remaining.length} remaining, ${ready.invalid.length} invalid)`,
    );
  }

  if (
    snapshot.failures.length > 0 ||
    Object.keys(snapshot.plan.pages).length !== snapshot.discoveredUrls.length
  ) {
    throw new Error(
      "Prepared snapshot is incomplete and cannot be promoted",
    );
  }

  const currentManifest = await readManifest(config.manifestPath);
  if (!manifestsMatch(currentManifest, snapshot.baseManifest)) {
    throw new Error("Source manifest changed after prepare; run prepare again");
  }

  const temporaryContent = await temporaryDirectoryFor(config.contentRoot);
  const temporaryTranslations = await temporaryDirectoryFor(
    config.translationRoot,
  );
  const temporaryAssets = await temporaryDirectoryFor(config.assetRoot);
  const temporarySidebar = await temporaryFileFor(config.sidebarPath);
  const temporaryManifest = await temporaryFileFor(config.manifestPath);

  const preparedPaths = [
    temporaryContent,
    temporaryTranslations,
    temporaryAssets,
    temporarySidebar,
    temporaryManifest,
  ];
  try {
    await Promise.all([
      cloneDirectory(config.contentRoot, temporaryContent),
      cloneDirectory(config.translationRoot, temporaryTranslations),
      cloneDirectory(config.assetRoot, temporaryAssets),
    ]);
    const stagedAssets = resolveWithin(
      config.stagingRoot,
      join(config.stagingRoot, "assets"),
      "staged asset directory",
    );
    if (await pathExists(stagedAssets)) {
      await cp(stagedAssets, temporaryAssets, { recursive: true });
    }

    for (const mirrorPath of snapshot.plan.remove) {
      await Promise.all([
        removePage(temporaryContent, mirrorPath, "content"),
        removePage(temporaryTranslations, mirrorPath, "translation"),
      ]);
    }

    const renderables: RenderablePage[] = [];
    const renderedPages = new Map<string, string>();
    for (const page of Object.values(snapshot.plan.pages)) {
      const translation = await readTranslation(
        temporaryTranslations,
        page.mirrorPath,
      );
      validateTranslation(page, translation);
      const markdown = renderPage(page, translation);
      assertNotice(page.mirrorPath, markdown);
      const outputPath = resolveWithin(
        temporaryContent,
        join(temporaryContent, contentRelativePath(page.mirrorPath)),
        `content output for ${page.mirrorPath}`,
      );
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, markdown, "utf8");
      renderables.push({ page, translation });
      renderedPages.set(page.mirrorPath, markdown);
    }
    for (const mirrorPath of snapshot.plan.pendingRemoval) {
      const retainedTranslation = await readTranslation(
        temporaryTranslations,
        mirrorPath,
      );
      validateRetainedTranslation(
        snapshot.plan.nextManifest.pages[mirrorPath]!,
        retainedTranslation,
      );
      const markdown = await readFile(
        resolveWithin(
          temporaryContent,
          join(temporaryContent, contentRelativePath(mirrorPath)),
          `retained content for ${mirrorPath}`,
        ),
        "utf8",
      );
      assertNotice(mirrorPath, markdown);
      const expectedHash =
        snapshot.plan.nextManifest.pages[mirrorPath]!.renderedContentHash;
      if (expectedHash === null || sha256(markdown) !== expectedHash) {
        throw new Error(`Retained content hash mismatch for ${mirrorPath}`);
      }
      renderedPages.set(mirrorPath, markdown);
    }

    validateInternalLinks(renderedPages);
    await validateImageState(
      Object.values(snapshot.plan.nextManifest.pages),
      snapshot.robotsText,
      temporaryAssets,
    );
    await writeFile(
      temporarySidebar,
      `${JSON.stringify(buildSidebar(renderables), null, 2)}\n`,
      "utf8",
    );
    const promotedManifest = recordRenderedContentHashes(
      promoteManifest(
        currentManifest,
        snapshot.plan,
        (config.now ?? (() => new Date().toISOString()))(),
      ),
      renderedPages,
    );
    await writeFile(
      temporaryManifest,
      `${JSON.stringify(promotedManifest, null, 2)}\n`,
      "utf8",
    );

    const finalManifestIdentity = await readManifest(config.manifestPath);
    if (!manifestsMatch(finalManifestIdentity, currentManifest)) {
      throw new Error(
        "Source manifest changed during apply; no prepared paths were promoted",
      );
    }

    await replacePathsAtomically([
      { prepared: temporaryContent, target: config.contentRoot },
      { prepared: temporarySidebar, target: config.sidebarPath },
      { prepared: temporaryTranslations, target: config.translationRoot },
      { prepared: temporaryAssets, target: config.assetRoot },
      { prepared: temporaryManifest, target: config.manifestPath },
    ]);
  } catch (error) {
    await Promise.all(
      preparedPaths.map((path) =>
        rm(path, { recursive: true, force: true }).catch(() => undefined),
      ),
    );
    throw error;
  }

  const images = Object.values(snapshot.plan.pages).flatMap(
    (page) => page.images,
  );
  return {
    discovered: snapshot.discoveredUrls.length,
    added: snapshot.plan.add.length,
    updated: snapshot.plan.update.length,
    unchanged: snapshot.plan.unchanged.length,
    pendingRemoval: snapshot.plan.pendingRemoval.length,
    removed: snapshot.plan.remove.length,
    translatedSegments: snapshot.plan.translationSegmentIds.length,
    localImages: images.filter((image) => image.localPath !== null).length,
    remoteImages: images.filter((image) => image.robotsRemote).length,
  };
};

export const applyMirror = async (
  config: MirrorConfig,
): Promise<ApplyResult> => {
  await validateMirrorConfigPaths(config);
  return withWorkspaceLock(config.workspaceRoot, () => applyMirrorUnlocked(config));
};

const runCli = async () => {
  const result = await applyMirror(defaultMirrorConfig());
  process.stdout.write(`${JSON.stringify(summaryOnly(result))}\n`);
};

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (executedPath === fileURLToPath(import.meta.url)) {
  runCli().catch((error: unknown) => {
    process.stderr.write(`${messageFor(error)}\n`);
    process.exitCode = 1;
  });
}
