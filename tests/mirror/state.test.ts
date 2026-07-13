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

test("sorts changes and selects only added or changed segments", () => {
  const changed = pageFixture({
    segments: [
      segmentFixture({
        id: "install:h1:0",
        source: "Install Orca",
      }),
      segmentFixture({
        id: "install:p:0",
        kind: "paragraph",
        source: "Existing paragraph",
      }),
    ],
  });
  const unchanged = pageFixture({
    sourceUrl: "https://www.onorca.dev/docs/zulu",
    mirrorPath: "/docs/zulu/",
    segments: [segmentFixture({ id: "zulu:h1:0", source: "Zulu" })],
    titleSegmentId: "zulu:h1:0",
  });
  const added = pageFixture({
    sourceUrl: "https://www.onorca.dev/docs/alpha",
    mirrorPath: "/docs/alpha/",
    segments: [segmentFixture({ id: "alpha:h1:0", source: "Alpha" })],
    titleSegmentId: "alpha:h1:0",
  });
  const manifest = manifestFixture({
    [unchanged.mirrorPath]: manifestPageFor(unchanged),
    [changed.mirrorPath]: manifestPageFor(changed, {
      segmentHashes: {
        "install:h1:0": sha256("previous heading"),
        "install:p:0": changed.segments[1]!.sourceHash,
        "install:removed:0": sha256("removed paragraph"),
      },
    }),
  });

  const plan = planChanges(manifest, [unchanged, changed, added], NEXT_DAY);

  expect(plan.add).toEqual(["/docs/alpha/"]);
  expect(plan.update).toEqual(["/docs/install/"]);
  expect(plan.unchanged).toEqual(["/docs/zulu/"]);
  expect(plan.translationSegmentIds).toEqual([
    "alpha:h1:0",
    "install:h1:0",
  ]);
  expect(Object.keys(plan.pages)).toEqual([
    "/docs/alpha/",
    "/docs/install/",
    "/docs/zulu/",
  ]);
  expect(Object.keys(plan.nextManifest.pages)).toEqual([
    "/docs/alpha/",
    "/docs/install/",
    "/docs/zulu/",
  ]);
});

test("rejects duplicate observed mirror paths", () => {
  const page = pageFixture();

  expect(() => planChanges(manifestFixture(), [page, page], NOW)).toThrow(
    /duplicate.*mirror path/i,
  );
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
