import { lstat, readdir } from "node:fs/promises";
import { join, sep } from "node:path";

type InventoryKind =
  | "block-device"
  | "character-device"
  | "directory"
  | "fifo"
  | "file"
  | "socket"
  | "symbolic-link"
  | "unknown";

const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;

const portablePath = (path: string) => path.split(sep).join("/");

const inventoryKey = (kind: InventoryKind, path: string) =>
  `${kind}:${path}`;

const kindFor = (entry: {
  isBlockDevice(): boolean;
  isCharacterDevice(): boolean;
  isDirectory(): boolean;
  isFIFO(): boolean;
  isFile(): boolean;
  isSocket(): boolean;
  isSymbolicLink(): boolean;
}): InventoryKind => {
  if (entry.isFile()) return "file";
  if (entry.isDirectory()) return "directory";
  if (entry.isSymbolicLink()) return "symbolic-link";
  if (entry.isBlockDevice()) return "block-device";
  if (entry.isCharacterDevice()) return "character-device";
  if (entry.isFIFO()) return "fifo";
  if (entry.isSocket()) return "socket";
  return "unknown";
};

const actualInventory = async (root: string) => {
  let rootMetadata;
  try {
    rootMetadata = await lstat(root);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return [];
    throw error;
  }

  const rootKind = kindFor(rootMetadata);
  const entries = [inventoryKey(rootKind, ".")];
  if (rootKind !== "directory") return entries;

  const visit = async (directory: string, relativeRoot: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const relativePath = portablePath(
        relativeRoot.length === 0
          ? entry.name
          : join(relativeRoot, entry.name),
      );
      const kind = kindFor(entry);
      entries.push(inventoryKey(kind, relativePath));
      if (kind === "directory") await visit(path, relativePath);
    }
  };
  await visit(root, "");
  return entries.sort();
};

export const expectedFileInventory = (
  relativeFilePaths: ReadonlyArray<string>,
) => {
  const entries = new Set<string>([inventoryKey("directory", ".")]);
  for (const input of relativeFilePaths) {
    const path = portablePath(input);
    const segments = path.split("/");
    entries.add(inventoryKey("file", path));
    for (let length = 1; length < segments.length; length += 1) {
      entries.add(
        inventoryKey("directory", segments.slice(0, length).join("/")),
      );
    }
  }
  return [...entries].sort();
};

export const assertExactInventory = async (
  label: "Asset" | "Content" | "Translation",
  root: string,
  expected: ReadonlyArray<string>,
) => {
  const actual = await actualInventory(root);
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((entry) => !actualSet.has(entry));
  const unexpected = actual.filter((entry) => !expectedSet.has(entry));
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${label} inventory mismatch; missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}`,
    );
  }
};

export const assertNoUnexpectedInventory = async (
  label: "Asset" | "Content" | "Translation",
  root: string,
  expected: ReadonlyArray<string>,
) => {
  const actual = await actualInventory(root);
  const expectedSet = new Set(expected);
  const unexpected = actual.filter((entry) => !expectedSet.has(entry));
  if (unexpected.length > 0) {
    throw new Error(
      `${label} inventory mismatch; missing: unchecked; unexpected: ${unexpected.join(", ")}`,
    );
  }
};
