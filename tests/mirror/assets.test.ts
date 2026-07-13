import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, expect, test } from "vitest";

import { mirrorAssets } from "../../scripts/mirror/assets.js";
import { sha256 } from "../../scripts/mirror/hash.js";
import { HttpClient } from "../../scripts/mirror/http.js";
import { binaryClient, pageFixture } from "../support/factories.js";

const roots: string[] = [];
const MEBIBYTE = 1024 * 1024;
const MAX_IMAGE_BYTES = 25 * MEBIBYTE;

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

test("requests the exact 25 MiB ceiling from the byte client", async () => {
  const png = new Uint8Array(
    await readFile(new URL("../fixtures/image.png", import.meta.url)),
  );
  const outputRoot = await assetRoot();
  let requestedLimit: number | undefined;
  const client = {
    bytes: async (_url: URL, maxBytes?: number) => {
      requestedLimit = maxBytes;
      return { body: png, contentType: "image/png" };
    },
  };

  await mirrorAssets(
    pageFixture(),
    "User-agent: *\nAllow: /",
    client,
    outputRoot,
  );

  expect(requestedLimit).toBe(MAX_IMAGE_BYTES);
});

test("stores an allowed image above 10 MiB through the production HTTP client", async () => {
  const body = new Uint8Array(10 * MEBIBYTE + 1);
  body[0] = 137;
  body[body.byteLength - 1] = 42;
  const outputRoot = await assetRoot();
  const fetchImpl = (async () =>
    new Response(body, {
      headers: {
        "content-length": String(body.byteLength),
        "content-type": "image/png",
      },
    })) as typeof fetch;

  const result = await mirrorAssets(
    pageFixture(),
    "User-agent: *\nAllow: /",
    new HttpClient(fetchImpl),
    outputRoot,
  );

  const hash = sha256(body);
  const stored = new Uint8Array(await readFile(join(outputRoot, `${hash}.png`)));
  expect(result.images[0]?.contentHash).toBe(hash);
  expect(stored.byteLength).toBe(body.byteLength);
  expect(stored[0]).toBe(body[0]);
  expect(stored.at(-1)).toBe(body.at(-1));
  expect(sha256(stored)).toBe(hash);
});

test("rejects an image above 25 MiB through the production HTTP client", async () => {
  const body = new Uint8Array(MAX_IMAGE_BYTES + 1);
  const outputRoot = await assetRoot();
  const fetchImpl = (async () =>
    new Response(body, {
      headers: {
        "content-length": String(body.byteLength),
        "content-type": "image/png",
      },
    })) as typeof fetch;

  await expect(
    mirrorAssets(
      pageFixture(),
      "User-agent: *\nAllow: /",
      new HttpClient(fetchImpl),
      outputRoot,
    ),
  ).rejects.toThrow(/25 MiB/i);
  await expect(readdir(outputRoot)).resolves.toEqual([]);
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
  const oldTimestamp = new Date("2001-02-03T04:05:06.000Z");
  await utimes(target, oldTimestamp, oldTimestamp);
  const before = await stat(target);

  await mirrorAssets(
    pageFixture(),
    "User-agent: *\nAllow: /",
    binaryClient(png),
    outputRoot,
  );

  const after = await stat(target);
  expect(after.mtimeMs).toBe(before.mtimeMs);
  expect(new Uint8Array(await readFile(target))).toEqual(png);
  expect(await readdir(outputRoot)).toEqual([`${hash}.png`]);
});
