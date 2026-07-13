import { randomUUID } from "node:crypto";
import { readFile, mkdir, open, rename, rm } from "node:fs/promises";
import { join } from "node:path";

import { canMirrorAsset } from "./discover.js";
import { sha256 } from "./hash.js";
import type { HttpClient } from "./http.js";
import { SourcePageSchema, type SourcePage } from "./model.js";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Map<string, string>([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/svg+xml", "svg"],
  ["image/webp", "webp"],
  ["image/vnd.microsoft.icon", "ico"],
  ["image/x-icon", "ico"],
]);

type ByteClient = Pick<HttpClient, "bytes">;

const extensionFor = (contentType: string | null) => {
  const mediaType = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  const extension = mediaType === undefined ? undefined : IMAGE_EXTENSIONS.get(mediaType);
  if (extension === undefined) {
    throw new Error(`Unsupported image Content-Type: ${contentType ?? "missing"}`);
  }
  return extension;
};

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

const existingFileMatches = async (path: string, hash: string) => {
  try {
    return sha256(new Uint8Array(await readFile(path))) === hash;
  } catch (error) {
    if (errorCode(error) === "ENOENT") return false;
    throw error;
  }
};

const writeAtomically = async (
  outputRoot: string,
  filename: string,
  body: Uint8Array,
  hash: string,
) => {
  await mkdir(outputRoot, { recursive: true });
  const target = join(outputRoot, filename);
  if (await existingFileMatches(target, hash)) return;

  try {
    await readFile(target);
    throw new Error(`Existing mirrored asset does not match its content hash: ${target}`);
  } catch (error) {
    if (errorCode(error) !== "ENOENT") throw error;
  }

  const temporary = join(outputRoot, `.${filename}.${randomUUID()}.tmp`);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(temporary, "wx");
    await handle.writeFile(body);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporary, target);
  } catch (error) {
    await handle?.close().catch(() => undefined);

    if (
      (errorCode(error) === "EEXIST" || errorCode(error) === "EPERM") &&
      (await existingFileMatches(target, hash))
    ) {
      return;
    }
    throw error;
  } finally {
    await rm(temporary, { force: true }).catch(() => undefined);
  }
};

export const mirrorAssets = async (
  page: SourcePage,
  robotsText: string,
  client: ByteClient,
  outputRoot: string,
): Promise<SourcePage> => {
  const images = [];

  for (const image of page.images) {
    const sourceUrl = new URL(image.sourceUrl);
    if (!canMirrorAsset(robotsText, sourceUrl)) {
      images.push({
        sourceUrl: image.sourceUrl,
        localPath: null,
        contentHash: null,
        robotsRemote: true,
      });
      continue;
    }

    const response = await client.bytes(sourceUrl);
    if (response.body.byteLength > MAX_IMAGE_BYTES) {
      throw new Error(`Image exceeds the 25 MiB body ceiling: ${image.sourceUrl}`);
    }

    const extension = extensionFor(response.contentType);
    const hash = sha256(response.body);
    const filename = `${hash}.${extension}`;
    await writeAtomically(outputRoot, filename, response.body, hash);
    images.push({
      sourceUrl: image.sourceUrl,
      localPath: `/assets/mirror/${filename}`,
      contentHash: hash,
      robotsRemote: false,
    });
  }

  return SourcePageSchema.parse({ ...page, images });
};
