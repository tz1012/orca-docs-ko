import {
  SourceManifestSchema,
  type ManifestPage,
  type SourceManifest,
  type SourcePage,
} from "./model.js";
import { requiresKoreanTranslation } from "./translation-policy.js";

export interface ChangePlan {
  add: string[];
  update: string[];
  unchanged: string[];
  pendingRemoval: string[];
  remove: string[];
  translationSegmentIds: string[];
  pages: Record<string, SourcePage>;
  nextManifest: SourceManifest;
}

const compareStrings = (left: string, right: string) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const sortedRecord = <Value>(entries: Iterable<readonly [string, Value]>) =>
  Object.fromEntries([...entries].sort(([left], [right]) => compareStrings(left, right))) as Record<
    string,
    Value
  >;

const segmentHashes = (page: SourcePage) =>
  sortedRecord(
    page.segments.map((segment) => [segment.id, segment.sourceHash] as const),
  );

const segmentValidation = (page: SourcePage) =>
  sortedRecord(
    page.segments.map((segment) => [
      segment.id,
      {
        kind: segment.kind,
        protectedTokens: Object.keys(segment.protected).sort(compareStrings),
        requiresKorean: requiresKoreanTranslation(segment),
      },
    ] as const),
  );

const hashesMatch = (
  left: Record<string, string>,
  right: Record<string, string>,
) => {
  const leftIds = Object.keys(left).sort(compareStrings);
  const rightIds = Object.keys(right).sort(compareStrings);

  return (
    leftIds.length === rightIds.length &&
    leftIds.every((id, index) => id === rightIds[index] && left[id] === right[id])
  );
};

const manifestPageFrom = (
  page: SourcePage,
  previous: ManifestPage | undefined,
): ManifestPage => ({
  sourceUrl: page.sourceUrl,
  mirrorPath: page.mirrorPath,
  titleSegmentId: page.titleSegmentId,
  pageHash: page.pageHash,
  checkedAt: page.checkedAt,
  sitemapLastmod: page.sitemapLastmod,
  translatedAt: previous?.translatedAt ?? null,
  missingRuns: 0,
  status: "active",
  redirectTo: null,
  segmentHashes: segmentHashes(page),
  segmentValidation: segmentValidation(page),
  images: page.images,
});

export const planChanges = (
  manifest: SourceManifest,
  observedPages: SourcePage[],
  now: string,
): ChangePlan => {
  const observed = new Map<string, SourcePage>();
  for (const page of observedPages) {
    if (observed.has(page.mirrorPath)) {
      throw new Error(`Duplicate observed mirror path: ${page.mirrorPath}`);
    }
    observed.set(page.mirrorPath, page);
  }

  const add: string[] = [];
  const update: string[] = [];
  const unchanged: string[] = [];
  const pendingRemoval: string[] = [];
  const remove: string[] = [];
  const translationIds = new Set<string>();
  const nextPages = new Map<string, ManifestPage>();

  for (const [mirrorPath, page] of observed) {
    const previous = manifest.pages[mirrorPath];
    const currentHashes = segmentHashes(page);
    nextPages.set(mirrorPath, manifestPageFrom(page, previous));

    if (previous === undefined) {
      add.push(mirrorPath);
      for (const segment of page.segments) translationIds.add(segment.id);
      continue;
    }

    if (hashesMatch(previous.segmentHashes, currentHashes)) {
      unchanged.push(mirrorPath);
      continue;
    }

    update.push(mirrorPath);
    for (const segment of page.segments) {
      if (previous.segmentHashes[segment.id] !== segment.sourceHash) {
        translationIds.add(segment.id);
      }
    }
  }

  for (const [mirrorPath, previous] of Object.entries(manifest.pages)) {
    if (observed.has(mirrorPath)) continue;

    const missingRuns = previous.missingRuns + 1;
    if (missingRuns >= 2) {
      remove.push(mirrorPath);
      continue;
    }

    pendingRemoval.push(mirrorPath);
    nextPages.set(mirrorPath, {
      ...previous,
      missingRuns,
      status: "pending-removal",
    });
  }

  const sort = (values: string[]) => values.sort(compareStrings);
  const pages = sortedRecord(observed.entries());
  const nextManifest = SourceManifestSchema.parse({
    schemaVersion: 1,
    generatedAt: now,
    pages: sortedRecord(nextPages.entries()),
  });

  return {
    add: sort(add),
    update: sort(update),
    unchanged: sort(unchanged),
    pendingRemoval: sort(pendingRemoval),
    remove: sort(remove),
    translationSegmentIds: sort([...translationIds]),
    pages,
    nextManifest,
  };
};

export const promoteManifest = (
  manifest: SourceManifest,
  plan: ChangePlan,
  translatedAt: string,
): SourceManifest => {
  const translatedPaths = new Set([...plan.add, ...plan.update]);
  const pages = Object.entries(plan.nextManifest.pages).map(
    ([mirrorPath, page]) => {
      if (translatedPaths.has(mirrorPath)) {
        return [mirrorPath, { ...page, translatedAt }] as const;
      }

      return [
        mirrorPath,
        {
          ...page,
          translatedAt:
            manifest.pages[mirrorPath]?.translatedAt ?? page.translatedAt,
        },
      ] as const;
    },
  );

  return SourceManifestSchema.parse({
    ...plan.nextManifest,
    pages: sortedRecord(pages),
  });
};
