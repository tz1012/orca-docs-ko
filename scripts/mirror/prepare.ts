import { randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { z } from "zod";

import { mirrorAssets } from "./assets.js";
import { discoverDocs } from "./discover.js";
import { extractPage } from "./extract.js";
import { HttpClient } from "./http.js";
import { writeTranslationJobs } from "./jobs.js";
import { withWorkspaceLock } from "./lock.js";
import {
  SourceManifestSchema,
  SourcePageSchema,
  type SourceManifest,
  type SourcePage,
} from "./model.js";
import { planChanges, type ChangePlan } from "./state.js";

export const SUMMARY_KEYS = [
  "discovered",
  "added",
  "updated",
  "unchanged",
  "pendingRemoval",
  "removed",
  "translatedSegments",
  "localImages",
  "remoteImages",
] as const;

export type MirrorSummary = Record<(typeof SUMMARY_KEYS)[number], number>;

export type MirrorClient = {
  text(url: URL): Promise<string>;
  bytes(
    url: URL,
    maxBytes?: number,
  ): Promise<{ body: Uint8Array; contentType: string | null }>;
};

export interface MirrorConfig {
  origin: URL;
  workspaceRoot: string;
  manifestPath: string;
  translationRoot: string;
  jobRoot: string;
  stagingRoot: string;
  contentRoot: string;
  sidebarPath: string;
  assetRoot: string;
  client: MirrorClient;
  now?: () => string;
  runBuild?: () => Promise<void>;
}

export interface PreparedSnapshot {
  schemaVersion: 1;
  robotsText: string;
  discoveredUrls: string[];
  failures: Array<{ sourceUrl: string; error: string }>;
  baseManifest: SourceManifest;
  plan: ChangePlan;
}

export interface PrepareResult extends MirrorSummary {
  jobs: string[];
}

type Replacement = {
  prepared: string;
  target: string;
};

export interface FileTransactionOperations {
  mkdir: typeof mkdir;
  rename: typeof rename;
  rm: typeof rm;
  stat: typeof stat;
}

export interface TransactionCleanupFailure {
  path: string;
  error: string;
}

type RollbackFailure = {
  action: "remove-new" | "restore-backup";
  target: string;
  backup: string;
  error: string;
};

export class AtomicRollbackError extends Error {
  readonly rollbackFailures: readonly RollbackFailure[];

  constructor(cause: unknown, rollbackFailures: readonly RollbackFailure[]) {
    const original = cause instanceof Error ? cause.message : String(cause);
    const recovery = rollbackFailures
      .map((failure) =>
        failure.action === "restore-backup"
          ? `restore ${failure.target} from backup ${failure.backup} failed: ${failure.error}`
          : `remove new target ${failure.target} before restoring backup ${failure.backup} failed: ${failure.error}`,
      )
      .join("; ");
    super(
      `Atomic promotion failed (${original}) and rollback is incomplete: ${recovery}. Preserve the listed backups and recover these paths manually.`,
      { cause },
    );
    this.name = "AtomicRollbackError";
    this.rollbackFailures = rollbackFailures;
  }
}

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

const existsWith = async (
  operations: Pick<FileTransactionOperations, "stat">,
  path: string,
) => {
  try {
    await operations.stat(path);
    return true;
  } catch (error) {
    if (errorCode(error) === "ENOENT") return false;
    throw error;
  }
};

export const replacePathsAtomically = async (
  replacements: readonly Replacement[],
  operations: FileTransactionOperations = { mkdir, rename, rm, stat },
) => {
  const transaction = randomUUID();
  const records: Array<{
    backup: string;
    installed: boolean;
    movedOriginal: boolean;
    prepared: string;
    target: string;
  }> = [];

  try {
    for (const replacement of replacements) {
      await operations.mkdir(dirname(replacement.target), { recursive: true });
      const backup = join(
        dirname(replacement.target),
        `.${basename(replacement.target)}.${transaction}.backup`,
      );
      const record = {
        ...replacement,
        backup,
        installed: false,
        movedOriginal: false,
      };
      records.push(record);

      if (await existsWith(operations, replacement.target)) {
        await operations.rename(replacement.target, backup);
        record.movedOriginal = true;
      }
      await operations.rename(replacement.prepared, replacement.target);
      record.installed = true;
    }
  } catch (error) {
    const rollbackFailures: RollbackFailure[] = [];
    for (const record of [...records].reverse()) {
      let canRestore = true;
      if (record.installed) {
        try {
          await operations.rm(record.target, { recursive: true, force: true });
        } catch (rollbackError) {
          canRestore = false;
          rollbackFailures.push({
            action: "remove-new",
            target: record.target,
            backup: record.backup,
            error: messageFor(rollbackError),
          });
        }
      }
      if (record.movedOriginal && canRestore) {
        try {
          await operations.rename(record.backup, record.target);
        } catch (rollbackError) {
          rollbackFailures.push({
            action: "restore-backup",
            target: record.target,
            backup: record.backup,
            error: messageFor(rollbackError),
          });
        }
      }
    }
    if (rollbackFailures.length > 0) {
      throw new AtomicRollbackError(error, rollbackFailures);
    }
    throw error;
  }

  const cleanupFailures: TransactionCleanupFailure[] = [];
  for (const { backup, movedOriginal } of records) {
    if (!movedOriginal) continue;
    try {
      await operations.rm(backup, { recursive: true, force: true });
    } catch (error) {
      cleanupFailures.push({ path: backup, error: messageFor(error) });
    }
  }
  return { cleanupFailures };
};

const messageFor = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const summaryFor = (
  discovered: number,
  plan: ChangePlan,
): MirrorSummary => {
  const images = Object.values(plan.pages).flatMap((page) => page.images);
  return {
    discovered,
    added: plan.add.length,
    updated: plan.update.length,
    unchanged: plan.unchanged.length,
    pendingRemoval: plan.pendingRemoval.length,
    removed: plan.remove.length,
    translatedSegments: plan.translationSegmentIds.length,
    localImages: images.filter((image) => image.localPath !== null).length,
    remoteImages: images.filter((image) => image.robotsRemote).length,
  };
};

export const summaryOnly = (value: MirrorSummary): MirrorSummary =>
  Object.fromEntries(SUMMARY_KEYS.map((key) => [key, value[key]])) as MirrorSummary;

const readManifest = async (path: string): Promise<SourceManifest> =>
  SourceManifestSchema.parse(JSON.parse(await readFile(path, "utf8")));

const CONFIG_PATHS = [
  "manifestPath",
  "translationRoot",
  "jobRoot",
  "stagingRoot",
  "contentRoot",
  "sidebarPath",
  "assetRoot",
] as const satisfies readonly (keyof MirrorConfig)[];

const FILE_CONFIG_PATHS = new Set<keyof MirrorConfig>([
  "manifestPath",
  "sidebarPath",
]);

const pathIsWithin = (
  root: string,
  candidate: string,
  allowEqual: boolean,
) => {
  const pathFromRoot = relative(resolve(root), resolve(candidate));
  if (pathFromRoot.length === 0) return allowEqual;
  return !(
    pathFromRoot === ".." ||
    pathFromRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromRoot)
  );
};

export const resolveWithin = (
  root: string,
  candidate: string,
  label: string,
) => {
  const resolvedRoot = resolve(root);
  const resolvedCandidate = resolve(candidate);
  if (!pathIsWithin(resolvedRoot, resolvedCandidate, true)) {
    throw new Error(`${label} resolves outside workspace root: ${resolvedCandidate}`);
  }
  return resolvedCandidate;
};

const realTargetFor = async (target: string) => {
  const resolvedTarget = resolve(target);
  let existingAncestor = resolvedTarget;
  while (true) {
    try {
      const realAncestor = await realpath(existingAncestor);
      return resolve(realAncestor, relative(existingAncestor, resolvedTarget));
    } catch (error) {
      if (errorCode(error) !== "ENOENT") throw error;
      const parent = dirname(existingAncestor);
      if (parent === existingAncestor) throw error;
      existingAncestor = parent;
    }
  }
};

export const validateMirrorConfigPaths = async (config: MirrorConfig) => {
  const workspaceRoot = resolve(config.workspaceRoot);
  const realWorkspaceRoot = await realpath(workspaceRoot);
  const targets = CONFIG_PATHS.map((key) => ({
    key,
    path: resolve(String(config[key])),
    realPath: null as string | null,
  }));

  for (const target of targets) {
    const { key, path } = target;
    if (!pathIsWithin(workspaceRoot, path, false)) {
      throw new Error(
        `${key} must be a strict descendant and cannot be equal to or outside workspace root: ${path}`,
      );
    }
    const realTarget = await realTargetFor(path);
    target.realPath = realTarget;
    if (!pathIsWithin(realWorkspaceRoot, realTarget, false)) {
      throw new Error(
        `${key} real path resolves outside workspace root: ${realTarget}`,
      );
    }

    try {
      const metadata = await stat(path);
      const expectsFile = FILE_CONFIG_PATHS.has(key);
      if (expectsFile && !metadata.isFile()) {
        throw new Error(`${key} must be a file: ${path}`);
      }
      if (!expectsFile && !metadata.isDirectory()) {
        throw new Error(`${key} must be a directory: ${path}`);
      }
    } catch (error) {
      if (errorCode(error) !== "ENOENT") throw error;
    }
  }

  const lockPath = join(workspaceRoot, ".mirror", "sync.lock");
  const realLockPath = await realTargetFor(lockPath);
  for (const { key, path, realPath } of targets) {
    if (
      pathIsWithin(path, lockPath, true) ||
      pathIsWithin(lockPath, path, true) ||
      pathIsWithin(realPath!, realLockPath, true) ||
      pathIsWithin(realLockPath, realPath!, true)
    ) {
      throw new Error(`${key} and workspace lock path overlap: ${path}`);
    }
  }

  for (let leftIndex = 0; leftIndex < targets.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < targets.length; rightIndex += 1) {
      const left = targets[leftIndex]!;
      const right = targets[rightIndex]!;
      const lexicalOverlap =
        pathIsWithin(left.path, right.path, true) ||
        pathIsWithin(right.path, left.path, true);
      const realOverlap =
        pathIsWithin(left.realPath!, right.realPath!, true) ||
        pathIsWithin(right.realPath!, left.realPath!, true);
      if (lexicalOverlap || realOverlap) {
        const leftContainsRight = pathIsWithin(left.path, right.path, true);
        const container = leftContainsRight ? left : right;
        const contained = leftContainsRight ? right : left;
        if (!lexicalOverlap) {
          throw new Error(
            `Configured paths ${left.key} and ${right.key} real paths overlap: ${left.realPath}; ${right.realPath}`,
          );
        }
        throw new Error(
          `Configured paths ${container.key} and ${contained.key} overlap: ${container.path}; ${contained.path}`,
        );
      }
    }
  }

  for (const key of CONFIG_PATHS) {
    resolveWithin(workspaceRoot, String(config[key]), key);
  }
};

const makeTemporaryDirectory = async (target: string) => {
  await mkdir(dirname(target), { recursive: true });
  return mkdtemp(join(dirname(target), `.${basename(target)}.tmp-`));
};

export const snapshotPath = (stagingRoot: string) =>
  join(stagingRoot, "snapshot.json");

const ChangePlanSchema = z.strictObject({
  add: z.array(SourcePageSchema.shape.mirrorPath),
  update: z.array(SourcePageSchema.shape.mirrorPath),
  unchanged: z.array(SourcePageSchema.shape.mirrorPath),
  pendingRemoval: z.array(SourcePageSchema.shape.mirrorPath),
  remove: z.array(SourcePageSchema.shape.mirrorPath),
  translationSegmentIds: z.array(z.string().min(1)),
  pages: z.record(SourcePageSchema.shape.mirrorPath, SourcePageSchema),
  nextManifest: SourceManifestSchema,
});

const PreparedSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  robotsText: z.string(),
  discoveredUrls: z.array(z.url()),
  failures: z.array(
    z.strictObject({ sourceUrl: z.url(), error: z.string().min(1) }),
  ),
  baseManifest: SourceManifestSchema,
  plan: ChangePlanSchema,
});

export const readPreparedSnapshot = async (
  stagingRoot: string,
): Promise<PreparedSnapshot> => {
  let input: PreparedSnapshot;
  try {
    input = PreparedSnapshotSchema.parse(
      JSON.parse(await readFile(snapshotPath(stagingRoot), "utf8")),
    );
  } catch (error) {
    throw new Error(`Invalid prepared mirror snapshot: ${messageFor(error)}`, {
      cause: error,
    });
  }

  const unique = (values: readonly string[], label: string) => {
    if (new Set(values).size !== values.length) {
      throw new Error(`Prepared snapshot ${label} contains duplicates`);
    }
  };
  unique(input.discoveredUrls, "discoveredUrls");
  unique(
    input.failures.map(({ sourceUrl }) => sourceUrl),
    "failure source URLs",
  );

  const accountedUrls = [
    ...Object.values(input.plan.pages).map(({ sourceUrl }) => sourceUrl),
    ...input.failures.map(({ sourceUrl }) => sourceUrl),
  ].sort();
  const discoveredUrls = [...input.discoveredUrls].sort();
  if (!isDeepStrictEqual(accountedUrls, discoveredUrls)) {
    throw new Error(
      "Prepared snapshot discovered URLs are inconsistent with pages and failures",
    );
  }

  const expectedPlan = planChanges(
    input.baseManifest,
    Object.values(input.plan.pages),
    input.plan.nextManifest.generatedAt,
  );
  if (!isDeepStrictEqual(input.plan, expectedPlan)) {
    throw new Error("Prepared snapshot plan is inconsistent with its pages");
  }
  return input;
};

const prepareMirrorUnlocked = async (
  config: MirrorConfig,
): Promise<PrepareResult> => {
  const manifest = await readManifest(config.manifestPath);
  const discovery = await discoverDocs(config.client, config.origin);
  if (discovery.pages.length === 0) {
    throw new Error("Refusing to prepare an empty documentation sitemap");
  }

  const checkedAt = (config.now ?? (() => new Date().toISOString()))();
  const fetched = await Promise.allSettled(
    discovery.pages.map(async (entry) => ({
      entry,
      html: await config.client.text(entry.url),
    })),
  );
  const failures = fetched.flatMap((result, index) =>
    result.status === "rejected"
      ? [
          {
            sourceUrl: discovery.pages[index]!.url.href,
            error: messageFor(result.reason),
          },
        ]
      : [],
  );
  if (failures.length / discovery.pages.length > 0.2) {
    throw new Error(
      `Refusing partial preparation: ${failures.length} of ${discovery.pages.length} page fetches failed`,
    );
  }

  const temporaryStaging = await makeTemporaryDirectory(config.stagingRoot);
  const temporaryJobs = await makeTemporaryDirectory(config.jobRoot);
  try {
    const pages: SourcePage[] = [];
    for (const result of fetched) {
      if (result.status === "rejected") continue;
      const page = extractPage({
        html: result.value.html,
        sourceUrl: result.value.entry.url,
        checkedAt,
        sitemapLastmod: result.value.entry.lastmod,
      });
      pages.push(
        await mirrorAssets(
          page,
          discovery.robotsText,
          config.client,
          join(temporaryStaging, "assets"),
        ),
      );
    }

    const plan = planChanges(manifest, pages, checkedAt);
    const snapshot: PreparedSnapshot = {
      schemaVersion: 1,
      robotsText: discovery.robotsText,
      discoveredUrls: discovery.pages.map(({ url }) => url.href),
      failures,
      baseManifest: manifest,
      plan,
    };
    await writeFile(
      snapshotPath(temporaryStaging),
      `${JSON.stringify(snapshot, null, 2)}\n`,
      "utf8",
    );
    const temporaryJobPaths = await writeTranslationJobs(plan, temporaryJobs);

    await replacePathsAtomically([
      { prepared: temporaryStaging, target: config.stagingRoot },
      { prepared: temporaryJobs, target: config.jobRoot },
    ]);

    return {
      ...summaryFor(discovery.pages.length, plan),
      jobs: temporaryJobPaths.map((path) =>
        join(config.jobRoot, relative(temporaryJobs, path)),
      ),
    };
  } catch (error) {
    await Promise.all([
      rm(temporaryStaging, { recursive: true, force: true }),
      rm(temporaryJobs, { recursive: true, force: true }),
    ]);
    throw error;
  }
};

export const prepareMirror = async (
  config: MirrorConfig,
): Promise<PrepareResult> => {
  await validateMirrorConfigPaths(config);
  return withWorkspaceLock(config.workspaceRoot, () =>
    prepareMirrorUnlocked(config),
  );
};

export const defaultMirrorConfig = (): MirrorConfig => {
  const workspaceRoot = resolve(".");
  return {
    origin: new URL("https://www.onorca.dev"),
    workspaceRoot,
    manifestPath: resolve(workspaceRoot, "mirror", "source-manifest.json"),
    translationRoot: resolve(workspaceRoot, "mirror", "translations"),
    jobRoot: resolve(workspaceRoot, ".mirror", "jobs"),
    stagingRoot: resolve(workspaceRoot, ".mirror", "staging"),
    contentRoot: resolve(workspaceRoot, "src", "content", "docs"),
    sidebarPath: resolve(workspaceRoot, "mirror", "sidebar.json"),
    assetRoot: resolve(workspaceRoot, "public", "assets", "mirror"),
    client: new HttpClient(),
  };
};

const runCli = async () => {
  const result = await prepareMirror(defaultMirrorConfig());
  process.stdout.write(`${JSON.stringify(summaryOnly(result))}\n`);
};

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (executedPath === fileURLToPath(import.meta.url)) {
  runCli().catch((error: unknown) => {
    process.stderr.write(`${messageFor(error)}\n`);
    process.exitCode = 1;
  });
}
