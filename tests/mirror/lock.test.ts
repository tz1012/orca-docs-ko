import {
  mkdir,
  readFile,
  readdir,
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

test("does not reclaim an old lock whose owner cannot be parsed", async () => {
  const workspace = await fixtureWorkspace();
  const lockPath = join(workspace.root, ".mirror", "sync.lock");
  await mkdir(dirname(lockPath), { recursive: true });
  await writeFile(lockPath, "truncated owner record", "utf8");
  const old = new Date("2000-01-01T00:00:00.000Z");
  await utimes(lockPath, old, old);

  await expect(
    withWorkspaceLock(workspace.root, async () => "must not run"),
  ).rejects.toThrow(/unparseable.*cannot safely be reclaimed.*manually/i);
  await expect(readFile(lockPath, "utf8")).resolves.toBe(
    "truncated owner record",
  );
});

test("a release ownership mismatch preserves the successor and records a warning", async () => {
  const workspace = await fixtureWorkspace();
  const lockPath = join(workspace.root, ".mirror", "sync.lock");
  const successor = lockOwner(
    "successor-owner-token",
    process.pid,
    new Date().toISOString(),
  );

  const result = await withWorkspaceLock(workspace.root, async () => {
    await writeFile(lockPath, `${JSON.stringify(successor)}\n`, "utf8");
    return "committed";
  });

  expect(result).toBe("committed");
  expect(JSON.parse(await readFile(lockPath, "utf8"))).toEqual(successor);
  const warnings = (await readdir(join(workspace.root, ".mirror"))).filter(
    (name) => name.startsWith("sync-lock-release-warning-"),
  );
  expect(warnings).toHaveLength(1);
  const warning = JSON.parse(
    await readFile(join(workspace.root, ".mirror", warnings[0]!), "utf8"),
  ) as { lockPath: string; recovery: string };
  expect(warning).toMatchObject({ lockPath });
  expect(warning.recovery).toMatch(/successor.*preserved|manual/i);
  await rm(lockPath, { force: true });
});

test("two stale-lock contenders never run operations concurrently", async () => {
  const workspace = await fixtureWorkspace();
  const lockPath = join(workspace.root, ".mirror", "sync.lock");
  await mkdir(dirname(lockPath), { recursive: true });
  await writeFile(
    lockPath,
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
  expect(JSON.parse(await readFile(lockPath, "utf8"))).toMatchObject({
    pid: process.pid,
  });

  release();
  const settled = await Promise.all(tracked);
  expect(settled.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
  expect(settled.filter(({ status }) => status === "rejected")).toHaveLength(1);
});
