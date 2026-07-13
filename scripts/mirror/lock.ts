import { randomUUID } from "node:crypto";
import {
  mkdir,
  open,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { hostname } from "node:os";
import { dirname, join, resolve } from "node:path";

import { z } from "zod";

const LOCK_STALE_AFTER_MS = 30 * 60 * 1000;
const OWNER_FILE = "owner.json";

const LockOwnerSchema = z.strictObject({
  schemaVersion: z.literal(1),
  token: z.string().min(1),
  pid: z.number().int().positive(),
  hostname: z.string().min(1),
  createdAt: z.iso.datetime(),
});

type LockOwner = z.infer<typeof LockOwnerSchema>;

interface LockOperations {
  initializeOwner(ownerPath: string, contents: string): Promise<void>;
  rename: typeof rename;
}

type WorkspaceLock = {
  activePath: string;
  namespacePath: string;
  operations: LockOperations;
  owner: LockOwner;
  transitionPath: string;
};

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

const messageFor = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const processIsAlive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (errorCode(error) === "ESRCH") return false;
    return true;
  }
};

const pathExists = async (path: string) => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (errorCode(error) === "ENOENT") return false;
    throw error;
  }
};

const readGenerationOwner = async (
  generationPath: string,
): Promise<LockOwner | null> => {
  try {
    return LockOwnerSchema.parse(
      JSON.parse(await readFile(join(generationPath, OWNER_FILE), "utf8")),
    );
  } catch {
    return null;
  }
};

const ownerIsSafelyStale = (owner: LockOwner) =>
  Date.now() - Date.parse(owner.createdAt) >= LOCK_STALE_AFTER_MS &&
  owner.hostname === hostname() &&
  !processIsAlive(owner.pid);

const transitionError = (path: string) =>
  new Error(
    `Workspace lock transition exists at ${path}; inspect it and recover manually before retrying`,
  );

const initializeOwner = async (ownerPath: string, contents: string) => {
  let handle;
  try {
    handle = await open(ownerPath, "wx", 0o600);
    await handle.writeFile(contents, "utf8");
    await handle.sync();
    await handle.close();
  } catch (error) {
    await handle?.close().catch(() => undefined);
    throw error;
  }
};

const DEFAULT_OPERATIONS: LockOperations = {
  initializeOwner,
  rename,
};

const ensureNamespace = async (namespacePath: string) => {
  await mkdir(dirname(namespacePath), { recursive: true });
  try {
    await mkdir(namespacePath);
  } catch (error) {
    if (errorCode(error) !== "EEXIST") throw error;
    const metadata = await stat(namespacePath);
    if (!metadata.isDirectory()) {
      throw new Error(
        `Workspace lock namespace ${namespacePath} is a legacy or malformed file; recover it manually`,
        { cause: error },
      );
    }
  }
};

const createInitializedGeneration = async (
  lock: WorkspaceLock,
  prefix: string,
) => {
  const generationPath = join(
    lock.namespacePath,
    `${prefix}-${lock.owner.token}-${randomUUID()}`,
  );
  await mkdir(generationPath);
  try {
    await lock.operations.initializeOwner(
      join(generationPath, OWNER_FILE),
      `${JSON.stringify(lock.owner)}\n`,
    );
    return generationPath;
  } catch (error) {
    await rm(generationPath, { recursive: true, force: true });
    throw error;
  }
};

const destinationIsOccupied = async (error: unknown, target: string) =>
  ["EEXIST", "ENOTEMPTY"].includes(errorCode(error) ?? "") ||
  await pathExists(target);

const restoreGenerationNoClobber = async (
  lock: WorkspaceLock,
  generationPath: string,
) => {
  try {
    // Both paths are non-empty directories. A valid active generation cannot
    // be replaced by directory rename on either POSIX or Windows.
    await lock.operations.rename(generationPath, lock.activePath);
  } catch (error) {
    if (await pathExists(lock.activePath)) {
      throw new Error(
        `Cannot restore quarantined generation ${generationPath}; a new active owner at ${lock.activePath} was preserved`,
        { cause: error },
      );
    }
    throw error;
  }
};

const withdrawGenerationCreatedDuringTransition = async (
  lock: WorkspaceLock,
) => {
  const quarantine = join(
    lock.namespacePath,
    `withdrawn-${lock.owner.token}-${randomUUID()}`,
  );
  try {
    await lock.operations.rename(lock.activePath, quarantine);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return;
    throw error;
  }
  const claimed = await readGenerationOwner(quarantine);
  if (claimed?.token === lock.owner.token) {
    await rm(quarantine, { recursive: true, force: true });
    return;
  }
  await restoreGenerationNoClobber(lock, quarantine);
};

const installOwner = async (lock: WorkspaceLock) => {
  const candidate = await createInitializedGeneration(lock, "candidate");
  if (await pathExists(lock.transitionPath)) {
    await rm(candidate, { recursive: true, force: true });
    throw transitionError(lock.transitionPath);
  }
  try {
    await lock.operations.rename(candidate, lock.activePath);
  } catch (error) {
    await rm(candidate, { recursive: true, force: true });
    throw error;
  }
  if (await pathExists(lock.transitionPath)) {
    await withdrawGenerationCreatedDuringTransition(lock);
    throw transitionError(lock.transitionPath);
  }
};

const beginTransition = async (lock: WorkspaceLock) => {
  const candidate = await createInitializedGeneration(
    lock,
    "transition-candidate",
  );
  try {
    await lock.operations.rename(candidate, lock.transitionPath);
  } catch (error) {
    await rm(candidate, { recursive: true, force: true });
    if (await destinationIsOccupied(error, lock.transitionPath)) {
      throw transitionError(lock.transitionPath);
    }
    throw error;
  }
};

const reclaimStaleLock = async (lock: WorkspaceLock) => {
  await beginTransition(lock);
  let preserveTransition = false;
  try {
    const observed = await readGenerationOwner(lock.activePath);
    if (observed === null) {
      throw new Error(
        `Workspace lock at ${lock.activePath} has an unparseable owner and cannot safely be reclaimed; recover it manually`,
      );
    }
    if (!ownerIsSafelyStale(observed)) return false;

    const quarantinedPath = join(lock.transitionPath, "stale-generation");
    await lock.operations.rename(lock.activePath, quarantinedPath);
    const quarantinedOwner = await readGenerationOwner(quarantinedPath);
    if (
      quarantinedOwner?.token !== observed.token ||
      !ownerIsSafelyStale(quarantinedOwner)
    ) {
      try {
        await restoreGenerationNoClobber(lock, quarantinedPath);
      } catch (error) {
        preserveTransition = true;
        throw error;
      }
      return false;
    }
    await rm(quarantinedPath, { recursive: true, force: true });
    return true;
  } finally {
    if (!preserveTransition) {
      await rm(lock.transitionPath, { recursive: true, force: true });
    }
  }
};

const acquireWorkspaceLock = async (
  workspaceRoot: string,
  operationOverrides: Partial<LockOperations>,
) => {
  const namespacePath = join(resolve(workspaceRoot), ".mirror", "sync.lock");
  const lock: WorkspaceLock = {
    namespacePath,
    activePath: join(namespacePath, "active"),
    transitionPath: join(namespacePath, "transition"),
    operations: { ...DEFAULT_OPERATIONS, ...operationOverrides },
    owner: {
      schemaVersion: 1,
      token: randomUUID(),
      pid: process.pid,
      hostname: hostname(),
      createdAt: new Date().toISOString(),
    },
  };
  await ensureNamespace(namespacePath);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await installOwner(lock);
      return lock;
    } catch (error) {
      if (!await destinationIsOccupied(error, lock.activePath)) throw error;
      if (attempt === 0 && await reclaimStaleLock(lock)) continue;
      throw new Error(
        `Workspace synchronization lock is held at ${lock.activePath}; another mirror operation is in progress`,
        { cause: error },
      );
    }
  }
  throw new Error(
    `Unable to acquire workspace synchronization lock at ${lock.activePath}`,
  );
};

const releaseWorkspaceLock = async (lock: WorkspaceLock) => {
  await beginTransition(lock);
  const quarantinedPath = join(lock.transitionPath, "release-generation");
  let preserveTransition = false;
  try {
    await lock.operations.rename(lock.activePath, quarantinedPath);
    const current = await readGenerationOwner(quarantinedPath);
    if (current?.token !== lock.owner.token) {
      try {
        await restoreGenerationNoClobber(lock, quarantinedPath);
      } catch (error) {
        preserveTransition = true;
        throw error;
      }
      throw new Error(
        `Workspace synchronization lock ownership changed before release: ${lock.activePath}; the successor generation was preserved`,
      );
    }
    await rm(quarantinedPath, { recursive: true, force: true });
  } finally {
    if (!preserveTransition) {
      await rm(lock.transitionPath, { recursive: true, force: true });
    }
  }
};

const recordReleaseWarning = async (lock: WorkspaceLock, error: unknown) => {
  const warningPath = join(
    lock.namespacePath,
    `release-warning-${Date.now()}-${lock.owner.token}.json`,
  );
  const warning = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    lockPath: lock.namespacePath,
    activePath: lock.activePath,
    owner: lock.owner,
    error: messageFor(error),
    recovery:
      "The mirror operation completed successfully. Inspect the lock namespace; any successor generation was preserved. Remove only generations whose owner is confirmed dead.",
  };
  try {
    await writeFile(warningPath, `${JSON.stringify(warning, null, 2)}\n`, "utf8");
  } catch (warningError) {
    process.stderr.write(
      `Mirror operation completed, but lock release and warning persistence failed: ${messageFor(error)}; ${messageFor(warningError)}\n`,
    );
  }
};

export const withWorkspaceLock = async <Value>(
  workspaceRoot: string,
  operation: () => Promise<Value>,
  operationOverrides: Partial<LockOperations> = {},
): Promise<Value> => {
  const lock = await acquireWorkspaceLock(workspaceRoot, operationOverrides);
  let operationError: unknown;
  try {
    return await operation();
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    try {
      await releaseWorkspaceLock(lock);
    } catch (releaseError) {
      await recordReleaseWarning(lock, releaseError);
      if (operationError !== undefined) {
        process.stderr.write(
          `Mirror operation failed and its workspace lock also needs recovery: ${messageFor(releaseError)}\n`,
        );
      }
    }
  }
};
