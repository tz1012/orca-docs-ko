import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  utimes,
  writeFile,
} from "node:fs/promises";
import { hostname } from "node:os";
import { dirname, join } from "node:path";

import { expect, test } from "vitest";

import { withWorkspaceLock } from "../../scripts/mirror/lock.js";
import { fixtureWorkspace } from "../support/factories.js";

const lockOwner = (token: string, pid: number, createdAt: string) => ({
  schemaVersion: 1 as const,
  token,
  pid,
  hostname: hostname(),
  createdAt,
});

type LockOperationOverrides = {
  initializeOwner?: (ownerPath: string, contents: string) => Promise<void>;
  rename?: typeof rename;
};

const lockWithOperations = withWorkspaceLock as unknown as <Value>(
  workspaceRoot: string,
  operation: () => Promise<Value>,
  overrides?: LockOperationOverrides,
) => Promise<Value>;

test("does not reclaim an old lock whose owner cannot be parsed", async () => {
  const workspace = await fixtureWorkspace();
  const namespacePath = join(workspace.root, ".mirror", "sync.lock");
  const ownerPath = join(namespacePath, "active", "owner.json");
  await mkdir(dirname(ownerPath), { recursive: true });
  await writeFile(ownerPath, "truncated owner record", "utf8");
  const old = new Date("2000-01-01T00:00:00.000Z");
  await utimes(ownerPath, old, old);

  await expect(
    withWorkspaceLock(workspace.root, async () => "must not run"),
  ).rejects.toThrow(/unparseable.*cannot safely be reclaimed.*manually/i);
  await expect(readFile(ownerPath, "utf8")).resolves.toBe(
    "truncated owner record",
  );
});

test("a release ownership mismatch preserves the successor and records a warning", async () => {
  const workspace = await fixtureWorkspace();
  const namespacePath = join(workspace.root, ".mirror", "sync.lock");
  const ownerPath = join(namespacePath, "active", "owner.json");
  const successor = lockOwner(
    "successor-owner-token",
    process.pid,
    new Date().toISOString(),
  );

  const result = await withWorkspaceLock(workspace.root, async () => {
    await writeFile(ownerPath, `${JSON.stringify(successor)}\n`, "utf8");
    return "committed";
  });

  expect(result).toBe("committed");
  expect(JSON.parse(await readFile(ownerPath, "utf8"))).toEqual(successor);
  const warnings = (await readdir(namespacePath)).filter(
    (name) => name.startsWith("release-warning-"),
  );
  expect(warnings).toHaveLength(1);
  const warning = JSON.parse(
    await readFile(join(namespacePath, warnings[0]!), "utf8"),
  ) as { lockPath: string; recovery: string };
  expect(warning).toMatchObject({ lockPath: namespacePath });
  expect(warning.recovery).toMatch(/successor.*preserved|manual/i);
  await rm(join(namespacePath, "active"), { force: true, recursive: true });
});

test("two stale-lock contenders never run operations concurrently", async () => {
  const workspace = await fixtureWorkspace();
  const namespacePath = join(workspace.root, ".mirror", "sync.lock");
  const ownerPath = join(namespacePath, "active", "owner.json");
  await mkdir(dirname(ownerPath), { recursive: true });
  await writeFile(
    ownerPath,
    `${JSON.stringify(
      lockOwner(
        "dead-owner-token",
        2_147_483_647,
        "2000-01-01T00:00:00.000Z",
      ),
    )}\n`,
    "utf8",
  );

  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered: string[] = [];
  let enteredOnce!: () => void;
  let enteredTwice!: () => void;
  const firstEntry = new Promise<void>((resolve) => {
    enteredOnce = resolve;
  });
  const secondEntry = new Promise<void>((resolve) => {
    enteredTwice = resolve;
  });
  const run = (name: string) =>
    withWorkspaceLock(workspace.root, async () => {
      entered.push(name);
      if (entered.length === 1) enteredOnce();
      if (entered.length === 2) enteredTwice();
      await gate;
      return name;
    });
  const contenders = [run("first"), run("second")];
  const tracked = contenders.map((promise) =>
    promise.then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    ),
  );
  await firstEntry;

  const firstOutcome = await Promise.race([
    ...tracked.map((promise) => promise.then(({ status }) => status)),
    secondEntry.then(() => "both-entered" as const),
  ]);
  expect(firstOutcome).toBe("rejected");
  expect(entered).toHaveLength(1);
  expect(JSON.parse(await readFile(ownerPath, "utf8"))).toMatchObject({
    pid: process.pid,
  });

  release();
  const settled = await Promise.all(tracked);
  expect(settled.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
  expect(settled.filter(({ status }) => status === "rejected")).toHaveLength(1);
});

test("restore never clobbers a new active generation", async () => {
  const workspace = await fixtureWorkspace();
  const namespacePath = join(workspace.root, ".mirror", "sync.lock");
  const activePath = join(namespacePath, "active");
  const originalSuccessor = lockOwner(
    "quarantined-successor",
    process.pid,
    new Date().toISOString(),
  );
  const newSuccessor = lockOwner(
    "new-active-successor",
    process.pid,
    new Date().toISOString(),
  );

  const result = await lockWithOperations(
    workspace.root,
    async () => {
      await writeFile(
        join(activePath, "owner.json"),
        `${JSON.stringify(originalSuccessor)}\n`,
        "utf8",
      );
      return "committed";
    },
    {
      rename: async (source, target) => {
        if (
          String(target) === activePath &&
          String(source).includes("release-generation")
        ) {
          await mkdir(activePath);
          await writeFile(
            join(activePath, "owner.json"),
            `${JSON.stringify(newSuccessor)}\n`,
            "utf8",
          );
        }
        await rename(source, target);
      },
    },
  );

  expect(result).toBe("committed");
  const activeOwnerText = await readFile(
    join(activePath, "owner.json"),
    "utf8",
  ).catch(() => null);
  expect(activeOwnerText).not.toBeNull();
  expect(JSON.parse(activeOwnerText!)).toEqual(newSuccessor);
  const quarantinedOwnerText = await readFile(
    join(namespacePath, "transition", "release-generation", "owner.json"),
    "utf8",
  );
  expect(JSON.parse(quarantinedOwnerText)).toEqual(originalSuccessor);
});

test("failed owner initialization removes its incomplete generation", async () => {
  const workspace = await fixtureWorkspace();
  const namespacePath = join(workspace.root, ".mirror", "sync.lock");

  await expect(
    lockWithOperations(
      workspace.root,
      async () => "must not run",
      {
        initializeOwner: async (ownerPath) => {
          await writeFile(ownerPath, "partial owner", "utf8");
          throw new Error("simulated owner sync failure");
        },
      },
    ),
  ).rejects.toThrow(/simulated owner sync failure/i);

  const entries = await readdir(namespacePath).catch(() => []);
  expect(entries).not.toContain("active");
  expect(entries.filter((name) => name.startsWith("candidate-"))).toEqual([]);
});
