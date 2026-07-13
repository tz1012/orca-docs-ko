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

const LockOwnerSchema = z.strictObject({
  schemaVersion: z.literal(1),
  token: z.string().min(1),
  pid: z.number().int().positive(),
  hostname: z.string().min(1),
  createdAt: z.iso.datetime(),
});

type LockOwner = z.infer<typeof LockOwnerSchema>;

type WorkspaceLock = {
  owner: LockOwner;
  path: string;
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

const readOwner = async (path: string): Promise<LockOwner | null> => {
  try {
    return LockOwnerSchema.parse(JSON.parse(await readFile(path, "utf8")));
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

const createOwnerFile = async (path: string, owner: LockOwner) => {
  let handle;
  try {
    handle = await open(path, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(owner)}\n`, "utf8");
    await handle.sync();
    await handle.close();
  } catch (error) {
    await handle?.close().catch(() => undefined);
    throw error;
  }
};

const restoreQuarantinedLock = async (
  quarantinedPath: string,
  lockPath: string,
) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      await rename(quarantinedPath, lockPath);
      return;
    } catch (error) {
      if (errorCode(error) !== "EEXIST") throw error;
      await new Promise<void>((resolveTurn) => setImmediate(resolveTurn));
    }
  }
  throw new Error(
    `Cannot restore quarantined lock ${quarantinedPath} to ${lockPath}; preserve the transition directory for manual recovery`,
  );
};

const withdrawLockCreatedDuringTransition = async (lock: WorkspaceLock) => {
  const quarantine = `${lock.path}.withdrawn.${lock.owner.token}`;
  try {
    await rename(lock.path, quarantine);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return;
    throw error;
  }
  const claimed = await readOwner(quarantine);
  if (claimed?.token === lock.owner.token) {
    await rm(quarantine, { force: true });
    return;
  }
  await restoreQuarantinedLock(quarantine, lock.path);
};

const installOwner = async (lock: WorkspaceLock) => {
  if (await pathExists(lock.transitionPath)) {
    throw transitionError(lock.transitionPath);
  }
  await createOwnerFile(lock.path, lock.owner);
  if (await pathExists(lock.transitionPath)) {
    await withdrawLockCreatedDuringTransition(lock);
    throw transitionError(lock.transitionPath);
  }
};

const beginTransition = async (lock: WorkspaceLock) => {
  try {
    await mkdir(lock.transitionPath);
  } catch (error) {
    if (errorCode(error) === "EEXIST") {
      throw transitionError(lock.transitionPath);
    }
    throw error;
  }
  await writeFile(
    join(lock.transitionPath, "owner.json"),
    `${JSON.stringify(lock.owner)}\n`,
    "utf8",
  );
};

const reclaimStaleLock = async (lock: WorkspaceLock) => {
  await beginTransition(lock);
  let preserveTransition = false;
  try {
    const observed = await readOwner(lock.path);
    if (observed === null) {
      throw new Error(
        `Workspace lock at ${lock.path} has an unparseable owner and cannot safely be reclaimed; recover it manually`,
      );
    }
    if (!ownerIsSafelyStale(observed)) return false;

    const quarantinedPath = join(lock.transitionPath, "stale.lock");
    await rename(lock.path, quarantinedPath);
    const quarantinedOwner = await readOwner(quarantinedPath);
    if (
      quarantinedOwner?.token !== observed.token ||
      !ownerIsSafelyStale(quarantinedOwner)
    ) {
      try {
        await restoreQuarantinedLock(quarantinedPath, lock.path);
      } catch (error) {
        preserveTransition = true;
        throw error;
      }
      return false;
    }
    await rm(quarantinedPath, { force: true });
    return true;
  } finally {
    if (!preserveTransition) {
      await rm(lock.transitionPath, { recursive: true, force: true });
    }
  }
};

const acquireWorkspaceLock = async (workspaceRoot: string) => {
  const path = join(resolve(workspaceRoot), ".mirror", "sync.lock");
  const lock: WorkspaceLock = {
    path,
    transitionPath: `${path}.transition`,
    owner: {
      schemaVersion: 1,
      token: randomUUID(),
      pid: process.pid,
      hostname: hostname(),
      createdAt: new Date().toISOString(),
    },
  };
  await mkdir(dirname(path), { recursive: true });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await installOwner(lock);
      return lock;
    } catch (error) {
      if (errorCode(error) !== "EEXIST") throw error;
      if (attempt === 0 && await reclaimStaleLock(lock)) continue;
      throw new Error(
        `Workspace synchronization lock is held at ${path}; another mirror operation is in progress`,
        { cause: error },
      );
    }
  }
  throw new Error(`Unable to acquire workspace synchronization lock at ${path}`);
};

const releaseWorkspaceLock = async (lock: WorkspaceLock) => {
  await beginTransition(lock);
  const quarantinedPath = join(lock.transitionPath, "release.lock");
  let preserveTransition = false;
  try {
    await rename(lock.path, quarantinedPath);
    const current = await readOwner(quarantinedPath);
    if (current?.token !== lock.owner.token) {
      try {
        await restoreQuarantinedLock(quarantinedPath, lock.path);
      } catch (error) {
        preserveTransition = true;
        throw error;
      }
      throw new Error(
        `Workspace synchronization lock ownership changed before release: ${lock.path}; the successor lock was preserved`,
      );
    }
    await rm(quarantinedPath, { force: true });
  } finally {
    if (!preserveTransition) {
      await rm(lock.transitionPath, { recursive: true, force: true });
    }
  }
};

const recordReleaseWarning = async (lock: WorkspaceLock, error: unknown) => {
  const warningPath = join(
    dirname(lock.path),
    `sync-lock-release-warning-${Date.now()}-${lock.owner.token}.json`,
  );
  const warning = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    lockPath: lock.path,
    owner: lock.owner,
    error: messageFor(error),
    recovery:
      "The mirror operation completed successfully. Inspect the lock and transition paths; any successor lock was preserved. Remove only artifacts whose owner is confirmed dead.",
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
): Promise<Value> => {
  const lock = await acquireWorkspaceLock(workspaceRoot);
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
