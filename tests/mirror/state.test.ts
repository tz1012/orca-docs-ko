import { expect, test } from "vitest";

import {
  planChanges,
  promoteManifest,
} from "../../scripts/mirror/state.js";
import { sha256 } from "../../scripts/mirror/hash.js";
import type {
  ManifestPage,
  SourcePage,
} from "../../scripts/mirror/model.js";
import {
  NEXT_DAY,
  NOW,
  manifestFixture,
  pageFixture,
  segmentFixture,
} from "../support/factories.js";

const manifestPageFor = (
  page: SourcePage,
  overrides: Partial<ManifestPage> = {},
) => ({
  sourceUrl: page.sourceUrl,
  mirrorPath: page.mirrorPath,
  titleSegmentId: page.titleSegmentId,
  pageHash: page.pageHash,
  checkedAt: page.checkedAt,
  sitemapLastmod: page.sitemapLastmod,
  translatedAt: NOW,
  missingRuns: 0,
  status: "active" as const,
  redirectTo: null,
  segmentHashes: Object.fromEntries(
    page.segments.map((segment) => [segment.id, segment.sourceHash]),
  ),
  images: page.images,
  ...overrides,
});

test("removes only after two consecutive missing runs", () => {
  const first = planChanges(
    manifestFixture({ "/docs/old/": { missingRuns: 0 } }),
    [],
    NOW,
  );

  expect(first.pendingRemoval).toEqual(["/docs/old/"]);
  expect(first.remove).toEqual([]);
  expect(first.nextManifest.pages["/docs/old/"]).toMatchObject({
    missingRuns: 1,
    status: "pending-removal",
  });

  const second = planChanges(first.nextManifest, [], NEXT_DAY);

  expect(second.pendingRemoval).toEqual([]);
  expect(second.remove).toEqual(["/docs/old/"]);
  expect(second.nextManifest.pages["/docs/old/"]).toBeUndefined();
});

test("resets missing state when a page is observed again", () => {
  const page = pageFixture();
  const manifest = manifestFixture({
    [page.mirrorPath]: manifestPageFor(page, {
      missingRuns: 1,
      status: "pending-removal",
    }),
  });

  const plan = planChanges(manifest, [page], NEXT_DAY);

  expect(plan.unchanged).toEqual([page.mirrorPath]);
  expect(plan.pendingRemoval).toEqual([]);
  expect(plan.nextManifest.pages[page.mirrorPath]).toMatchObject({
    missingRuns: 0,
    status: "active",
  });
});

test("sorts every change category and selected segment ID deterministically", () => {
  const pageFor = (slug: string, segmentIds: string[]) => {
    const segments = segmentIds.map((id) =>
      segmentFixture({ id, source: `Source for ${id}` }),
    );
    return pageFixture({
      sourceUrl: `https://www.onorca.dev/docs/${slug}`,
      mirrorPath: `/docs/${slug}/`,
      segments,
      titleSegmentId: segments[0]!.id,
    });
  };
  const alpha = pageFor("alpha", ["alpha:z:0", "alpha:a:0"]);
  const bravo = pageFor("bravo", [
    "bravo:z:0",
    "bravo:keep:0",
    "bravo:a:0",
  ]);
  const charlie = pageFor("charlie", ["charlie:h1:0"]);
  const xray = pageFor("xray", [
    "xray:z:0",
    "xray:a:0",
    "xray:keep:0",
  ]);
  const yankee = pageFor("yankee", ["yankee:z:0", "yankee:a:0"]);
  const zulu = pageFor("zulu", ["zulu:h1:0"]);
  const staleHashesFor = (page: SourcePage) => ({
    ...Object.fromEntries(
      page.segments.map((segment) => [
        segment.id,
        segment.id.includes(":keep:")
          ? segment.sourceHash
          : sha256(`Previous source for ${segment.id}`),
      ]),
    ),
    [`${page.titleSegmentId}:removed`]: sha256("Removed source segment"),
  });
  const manifest = manifestFixture({
    [zulu.mirrorPath]: manifestPageFor(zulu),
    "/docs/victor/": { missingRuns: 1 },
    [xray.mirrorPath]: manifestPageFor(xray, {
      segmentHashes: staleHashesFor(xray),
    }),
    "/docs/whiskey/": { missingRuns: 0 },
    "/docs/echo/": { missingRuns: 1 },
    "/docs/delta/": { missingRuns: 0 },
    [charlie.mirrorPath]: manifestPageFor(charlie),
    [bravo.mirrorPath]: manifestPageFor(bravo, {
      segmentHashes: staleHashesFor(bravo),
    }),
  });

  const plan = planChanges(
    manifest,
    [zulu, yankee, xray, charlie, bravo, alpha],
    NEXT_DAY,
  );

  expect(plan.add).toEqual(["/docs/alpha/", "/docs/yankee/"]);
  expect(plan.update).toEqual(["/docs/bravo/", "/docs/xray/"]);
  expect(plan.unchanged).toEqual(["/docs/charlie/", "/docs/zulu/"]);
  expect(plan.pendingRemoval).toEqual(["/docs/delta/", "/docs/whiskey/"]);
  expect(plan.remove).toEqual(["/docs/echo/", "/docs/victor/"]);
  expect(plan.translationSegmentIds).toEqual([
    "alpha:a:0",
    "alpha:z:0",
    "bravo:a:0",
    "bravo:z:0",
    "xray:a:0",
    "xray:z:0",
    "yankee:a:0",
    "yankee:z:0",
  ]);
  expect(Object.keys(plan.pages)).toEqual([
    "/docs/alpha/",
    "/docs/bravo/",
    "/docs/charlie/",
    "/docs/xray/",
    "/docs/yankee/",
    "/docs/zulu/",
  ]);
  expect(Object.keys(plan.nextManifest.pages)).toEqual([
    "/docs/alpha/",
    "/docs/bravo/",
    "/docs/charlie/",
    "/docs/delta/",
    "/docs/whiskey/",
    "/docs/xray/",
    "/docs/yankee/",
    "/docs/zulu/",
  ]);
});

test("rejects duplicate observed mirror paths", () => {
  const page = pageFixture();

  expect(() => planChanges(manifestFixture(), [page, page], NOW)).toThrow(
    /duplicate.*mirror path/i,
  );
});

test("persists protected-token and Korean requirements in the manifest", () => {
  const page = pageFixture();
  const plan = planChanges(manifestFixture(), [page], NOW);

  expect(
    plan.nextManifest.pages[page.mirrorPath]?.segmentValidation[
      "install:p:0"
    ],
  ).toEqual({
    kind: "paragraph",
    protectedTokens: ["ORCA_PROTECTED_0001"],
    requiresKorean: true,
  });
});

test("promotes translated changes without changing prior translation dates", () => {
  const unchanged = pageFixture({
    sourceUrl: "https://www.onorca.dev/docs/zulu",
    mirrorPath: "/docs/zulu/",
    segments: [segmentFixture({ id: "zulu:h1:0", source: "Zulu" })],
    titleSegmentId: "zulu:h1:0",
  });
  const added = pageFixture();
  const manifest = manifestFixture({
    [unchanged.mirrorPath]: manifestPageFor(unchanged),
    "/docs/old/": { missingRuns: 1, status: "pending-removal" },
  });
  const plan = planChanges(manifest, [added, unchanged], NEXT_DAY);

  const promoted = promoteManifest(manifest, plan, NEXT_DAY);

  expect(promoted.generatedAt).toBe(NEXT_DAY);
  expect(promoted.pages[added.mirrorPath]?.translatedAt).toBe(NEXT_DAY);
  expect(promoted.pages[unchanged.mirrorPath]?.translatedAt).toBe(NOW);
  expect(promoted.pages["/docs/old/"]).toBeUndefined();
});
