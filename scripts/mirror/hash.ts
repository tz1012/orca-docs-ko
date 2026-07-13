import { createHash } from "node:crypto";

export const normalizeText = (value: string) =>
  value.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();

export const sha256 = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
