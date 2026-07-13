import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rm, stat } from "node:fs/promises";
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

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

const processIsAlive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (errorCode(error) === "ESRCH") return false;
    return true;
  }
};

const readOwner = async (path: string): Promise<LockOwner | null> => {
  try {
    return LockOwnerSchema.parse(JSON.parse(await readFile(path, "utf8")));
  } catch {
    return null;
  }
};

const removeIfSafelyStale = async (path: string) => {
  const metadata = await stat(path);
  const owner = await readOwner(path);
  const timestamp = owner?.createdAt === undefined
    ? metadata.mtimeMs
    : Date.parse(owner.createdAt);
  if (Date.now() - timestamp < LOCK_STALE_AFTER_MS) return false;
  if (owner !== null) {
    if (owner.hostname !== hostname() || processIsAlive(owner.pid)) return false;
    const currentOwner = await readOwner(path);
    if (currentOwner?.token !== owner.token) return false;
  }
  await rm(path, { force: true });
  return true;
};

const acquireWorkspaceLock = async (workspaceRoot: string) => {
  const path = join(resolve(workspaceRoot), ".mirror", "sync.lock");
  const owner: LockOwner = {
    schemaVersion: 1,
    token: randomUUID(),
    pid: process.pid,
    hostname: hostname(),
    createdAt: new Date().toISOString(),
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let handle;
    let created = false;
    try {
      await mkdir(dirname(path), { recursive: true });
      handle = await open(path, "wx", 0o600);
      created = true;
      await handle.writeFile(`${JSON.stringify(owner)}\n`, "utf8");
      await handle.sync();
      await handle.close();
      return { owner, path };
    } catch (error) {
      await handle?.close().catch(() => undefined);
      if (created) await rm(path, { force: true }).catch(() => undefined);
      if (errorCode(error) !== "EEXIST") {
        throw error;
      }
      if (attempt === 0 && await removeIfSafelyStale(path)) continue;
      throw new Error(
        `Workspace synchronization lock is held at ${path}; another mirror operation is in progress`,
        { cause: error },
      );
    }
  }
  throw new Error(`Unable to acquire workspace synchronization lock at ${path}`);
};

const releaseWorkspaceLock = async (lock: Awaited<ReturnType<typeof acquireWorkspaceLock>>) => {
  const current = await readOwner(lock.path);
  if (current?.token !== lock.owner.token) {
    throw new Error(
      `Workspace synchronization lock ownership changed before release: ${lock.path}`,
    );
  }
  await rm(lock.path, { force: true });
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
      if (operationError === undefined) throw releaseError;
    }
  }
};
