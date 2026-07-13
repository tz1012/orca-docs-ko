import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { expect, test } from "vitest";

import { validateMirrorConfigPaths } from "../../scripts/mirror/prepare.js";
import { fixtureWorkspace } from "../support/factories.js";

const validate = async (
  config: Awaited<ReturnType<typeof fixtureWorkspace>>["config"],
) => {
  await validateMirrorConfigPaths(config);
};

test("requires every configured path to be a strict workspace descendant", async () => {
  const workspace = await fixtureWorkspace();

  await expect(
    validate({ ...workspace.config, contentRoot: workspace.root }),
  ).rejects.toThrow(/contentRoot.*strict descendant/i);
});

test("rejects duplicate and nested configured targets", async () => {
  const duplicateWorkspace = await fixtureWorkspace();
  await expect(
    validate({
      ...duplicateWorkspace.config,
      translationRoot: duplicateWorkspace.config.jobRoot,
    }),
  ).rejects.toThrow(/translationRoot.*jobRoot.*overlap|duplicate/i);

  const nestedWorkspace = await fixtureWorkspace();
  await expect(
    validate({
      ...nestedWorkspace.config,
      contentRoot: join(nestedWorkspace.root, "mirror"),
    }),
  ).rejects.toThrow(/contentRoot.*(?:manifestPath|translationRoot|sidebarPath).*overlap/i);
});

test("rejects a configured target that contains the workspace lock", async () => {
  const workspace = await fixtureWorkspace();

  await expect(
    validate({ ...workspace.config, jobRoot: join(workspace.root, ".mirror") }),
  ).rejects.toThrow(/jobRoot.*lock namespace.*overlap/i);
});

test("reserves every path inside the workspace lock namespace", async () => {
  const workspace = await fixtureWorkspace();

  await expect(
    validate({
      ...workspace.config,
      jobRoot: join(
        workspace.root,
        ".mirror",
        "sync.lock",
        "transition",
        "recovery",
      ),
    }),
  ).rejects.toThrow(/jobRoot.*lock namespace.*overlap/i);
});

test("rejects a lock namespace escaping through the .mirror junction", async () => {
  const workspace = await fixtureWorkspace();
  const outside = resolve(
    workspace.root,
    "..",
    `${basename(workspace.root)}-lock-outside`,
  );
  await mkdir(outside, { recursive: true });
  await symlink(
    outside,
    join(workspace.root, ".mirror"),
    process.platform === "win32" ? "junction" : "dir",
  );

  try {
    await expect(
      validate({
        ...workspace.config,
        jobRoot: join(workspace.root, "lock-safe-jobs"),
        stagingRoot: join(workspace.root, "lock-safe-staging"),
      }),
    ).rejects.toThrow(/lock namespace.*real path.*outside workspace/i);
  } finally {
    await rm(outside, { recursive: true, force: true });
  }
});

test("enforces configured file and directory roles", async () => {
  const fileWorkspace = await fixtureWorkspace();
  await mkdir(dirname(fileWorkspace.config.assetRoot), { recursive: true });
  await writeFile(fileWorkspace.config.assetRoot, "not a directory", "utf8");
  await expect(validate(fileWorkspace.config)).rejects.toThrow(
    /assetRoot.*must be a directory/i,
  );

  const directoryWorkspace = await fixtureWorkspace();
  await mkdir(directoryWorkspace.config.sidebarPath, { recursive: true });
  await expect(validate(directoryWorkspace.config)).rejects.toThrow(
    /sidebarPath.*must be a file/i,
  );
});

test("rejects a target escaping through a symlink or junction ancestor", async () => {
  const workspace = await fixtureWorkspace();
  const outside = resolve(
    workspace.root,
    "..",
    `${basename(workspace.root)}-outside`,
  );
  const linked = join(workspace.root, "linked-outside");
  await mkdir(outside, { recursive: true });
  await symlink(
    outside,
    linked,
    process.platform === "win32" ? "junction" : "dir",
  );

  await expect(
    validate({ ...workspace.config, assetRoot: join(linked, "assets") }),
  ).rejects.toThrow(/assetRoot.*real path.*outside workspace/i);
  await rm(outside, { recursive: true, force: true });
});

test("rejects configured targets that alias the same real directory", async () => {
  const workspace = await fixtureWorkspace();
  const shared = join(workspace.root, "shared-target");
  const firstAlias = join(workspace.root, "first-alias");
  const secondAlias = join(workspace.root, "second-alias");
  await mkdir(shared, { recursive: true });
  const linkType = process.platform === "win32" ? "junction" : "dir";
  await symlink(shared, firstAlias, linkType);
  await symlink(shared, secondAlias, linkType);

  await expect(
    validate({
      ...workspace.config,
      contentRoot: firstAlias,
      assetRoot: secondAlias,
    }),
  ).rejects.toThrow(/contentRoot.*assetRoot.*real paths overlap/i);
});
