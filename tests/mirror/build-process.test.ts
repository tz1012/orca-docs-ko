import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "vitest";

import * as checkModule from "../../scripts/mirror/check.js";

type WaitForBuildProcess = (
  child: ChildProcess,
) => Promise<void>;

type RunDefaultBuild = (workspaceRoot: string) => Promise<void>;

test("runs the default pnpm build on Windows without spawn EINVAL", async () => {
  const runDefaultBuild = (
    checkModule as unknown as { runDefaultBuild?: RunDefaultBuild }
  ).runDefaultBuild;
  expect(runDefaultBuild).toBeTypeOf("function");
  const root = await mkdtemp(join(tmpdir(), "orca-build-process-"));
  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify({ private: true, scripts: { build: "node -e \"process.stdout.write('Build complete')\"" } })}\n`,
    "utf8",
  );

  await expect(runDefaultBuild!(root)).resolves.toBeUndefined();
});

test("captures a build warning written after the parent process exits", async () => {
  const waitForBuildProcess = (
    checkModule as unknown as { waitForBuildProcess?: WaitForBuildProcess }
  ).waitForBuildProcess;
  expect(waitForBuildProcess).toBeTypeOf("function");

  const trailingWriter = `setTimeout(() => {
    process.stdout.write("[WARN] Entry docs/trailing was not found.\\n");
  }, 80);`;
  const parent = `const { spawn } = require("node:child_process");
    spawn(process.execPath, ["-e", ${JSON.stringify(trailingWriter)}], {
      stdio: ["ignore", "inherit", "inherit"]
    });`;
  const child = spawn(process.execPath, ["-e", parent], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  await expect(waitForBuildProcess!(child)).rejects.toThrow(
    /build warning.*trailing.*not found/i,
  );
});
