import { spawn, type ChildProcess } from "node:child_process";

import { expect, test } from "vitest";

import * as checkModule from "../../scripts/mirror/check.js";

type WaitForBuildProcess = (
  child: ChildProcess,
) => Promise<void>;

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
