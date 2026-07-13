import { expect, test } from "vitest";

import { normalizeText, sha256 } from "../../scripts/mirror/hash.js";
import {
  SourceManifestSchema,
  SourcePageSchema,
  SourceSegmentSchema,
  TranslationFileSchema,
} from "../../scripts/mirror/model.js";
import {
  manifestFixture,
  pageFixture,
  translationFixture,
} from "../support/factories.js";

test("normalizes before hashing", () => {
  expect(sha256(normalizeText("A\r\n  B"))).toBe(sha256("A\n B"));
});

test("requires a SHA-256 source hash", () => {
  expect(() =>
    SourceSegmentSchema.parse({
      id: "install:p:0",
      kind: "paragraph",
      source: "Install.",
      protected: {},
    }),
  ).toThrow();
});

test("provides schema-valid mirror fixtures", () => {
  expect(SourcePageSchema.parse(pageFixture())).toEqual(pageFixture());
  expect(SourceManifestSchema.parse(manifestFixture())).toEqual(manifestFixture());
  expect(TranslationFileSchema.parse(translationFixture())).toEqual(
    translationFixture(),
  );
});
