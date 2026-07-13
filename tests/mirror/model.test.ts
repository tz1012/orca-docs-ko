import { expect, test } from "vitest";

import { normalizeText, sha256 } from "../../scripts/mirror/hash.js";
import {
  ManifestPageSchema,
  SourceManifestSchema,
  SourcePageSchema,
  SourceSegmentSchema,
  TranslationFileSchema,
} from "../../scripts/mirror/model.js";
import {
  NOW,
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

test.each([
  "/other/",
  "/docs",
  "docs/install/",
  "/docs/install?query=/",
  "/docs/install#fragment/",
  "/docs\\install/",
  "/docs//install/",
  "/docs/./install/",
  "/docs/../install/",
  "/docs/%2e/install/",
  "/docs/%2E%2e/install/",
])("rejects a non-canonical mirror path: %s", (mirrorPath) => {
  expect(() =>
    SourcePageSchema.parse({ ...pageFixture(), mirrorPath }),
  ).toThrow();
});

test("accepts the docs root and canonical descendants", () => {
  expect(
    SourcePageSchema.parse({ ...pageFixture(), mirrorPath: "/docs/" })
      .mirrorPath,
  ).toBe("/docs/");
  expect(SourcePageSchema.parse(pageFixture()).mirrorPath).toBe(
    "/docs/install/",
  );
});

test("uses canonical mirror paths in manifest, redirect, and translation contracts", () => {
  const manifestPage = manifestFixture({ "/docs/old/": {} }).pages[
    "/docs/old/"
  ]!;

  expect(() =>
    ManifestPageSchema.parse({ ...manifestPage, mirrorPath: "/other/" }),
  ).toThrow();
  expect(() =>
    ManifestPageSchema.parse({ ...manifestPage, redirectTo: "/other/" }),
  ).toThrow();
  expect(() =>
    TranslationFileSchema.parse({
      ...translationFixture(),
      mirrorPath: "/other/",
    }),
  ).toThrow();
});

test.each(["", "/other/", "/docs/new/"])(
  "rejects an invalid or mismatched manifest page key: %s",
  (key) => {
    const page = manifestFixture({ "/docs/old/": {} }).pages["/docs/old/"]!;

    expect(() =>
      SourceManifestSchema.parse({
        schemaVersion: 1,
        generatedAt: NOW,
        pages: { [key]: page },
      }),
    ).toThrow();
  },
);

test("rejects an empty translation segment ID", () => {
  const entry = translationFixture().entries["install:h1:0"]!;

  expect(() =>
    TranslationFileSchema.parse({
      ...translationFixture(),
      entries: { "": entry },
    }),
  ).toThrow();
});

test("preserves translated Markdown exactly", () => {
  const translated = "  **설치**  \n";
  const entry = translationFixture().entries["install:h1:0"]!;
  const parsed = TranslationFileSchema.parse({
    ...translationFixture(),
    entries: { "install:h1:0": { ...entry, translated } },
  });

  expect(parsed.entries["install:h1:0"]?.translated).toBe(translated);
});

test("rejects whitespace-only translated Markdown", () => {
  const entry = translationFixture().entries["install:h1:0"]!;

  expect(() =>
    TranslationFileSchema.parse({
      ...translationFixture(),
      entries: {
        "install:h1:0": { ...entry, translated: " \t\n" },
      },
    }),
  ).toThrow();
});
