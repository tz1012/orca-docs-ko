import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, expect, test } from "vitest";

import { mirrorAssets } from "../../scripts/mirror/assets.js";
import { sha256 } from "../../scripts/mirror/hash.js";
import { binaryClient, pageFixture } from "../support/factories.js";

const roots: string[] = [];

const assetRoot = async () => {
  const root = await mkdtemp(join(tmpdir(), "orca-assets-"));
  roots.push(root);
  const outputRoot = join(root, "public", "assets", "mirror");
  await mkdir(outputRoot, { recursive: true });
  return outputRoot;
};

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

test("stores allowed images by content hash without changing their bytes", async () => {
  const png = new Uint8Array(
    await readFile(new URL("../fixtures/image.png", import.meta.url)),
  );
  const outputRoot = await assetRoot();

  const result = await mirrorAssets(
    pageFixture(),
    "User-agent: *\nAllow: /",
    binaryClient(png, "image/png; charset=binary"),
    outputRoot,
  );

  const hash = sha256(png);
  expect(result.images).toEqual([
    {
      sourceUrl: "https://www.onorca.dev/docs/install.png",
      localPath: `/assets/mirror/${hash}.png`,
      contentHash: hash,
      robotsRemote: false,
    },
  ]);
  expect(new Uint8Array(await readFile(join(outputRoot, `${hash}.png`)))).toEqual(
    png,
  );
});

test("keeps robots-denied images remote without downloading them", async () => {
  const outputRoot = await assetRoot();
  let requested = false;
  const client = {
    bytes: async (_url: URL) => {
      requested = true;
      throw new Error("denied image must not be downloaded");
    },
  };

  const result = await mirrorAssets(
    pageFixture(),
    "User-agent: *\nDisallow: /docs/install.png",
    client,
    outputRoot,
  );

  expect(requested).toBe(false);
  expect(result.images[0]).toEqual({
    sourceUrl: "https://www.onorca.dev/docs/install.png",
    localPath: null,
    contentHash: null,
    robotsRemote: true,
  });
});

test("rejects image bodies above 25 MiB", async () => {
  const outputRoot = await assetRoot();
  const oversized = new Uint8Array(25 * 1024 * 1024 + 1);

  await expect(
    mirrorAssets(
      pageFixture(),
      "User-agent: *\nAllow: /",
      binaryClient(oversized),
      outputRoot,
    ),
  ).rejects.toThrow(/25 MiB/i);
  await expect(readdir(outputRoot)).resolves.toEqual([]);
});

test("rejects missing or unsupported image content types", async () => {
  const outputRoot = await assetRoot();

  await expect(
    mirrorAssets(
      pageFixture(),
      "User-agent: *\nAllow: /",
      binaryClient(new Uint8Array([1, 2, 3]), "application/octet-stream"),
      outputRoot,
    ),
  ).rejects.toThrow(/content-type/i);
});

test("reuses an existing file whose content matches its hash", async () => {
  const png = new Uint8Array(
    await readFile(new URL("../fixtures/image.png", import.meta.url)),
  );
  const outputRoot = await assetRoot();
  const hash = sha256(png);
  const target = join(outputRoot, `${hash}.png`);
  await writeFile(target, png);
  const before = await stat(target);

  await mirrorAssets(
    pageFixture(),
    "User-agent: *\nAllow: /",
    binaryClient(png),
    outputRoot,
  );

  const after = await stat(target);
  expect(after.mtimeMs).toBe(before.mtimeMs);
  expect(await readdir(outputRoot)).toEqual([`${hash}.png`]);
});
