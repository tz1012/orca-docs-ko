import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { normalizeText, sha256 } from "../../scripts/mirror/hash.js";
import {
  ManifestPageSchema,
  SourceManifestSchema,
  SourcePageSchema,
  SourceSegmentSchema,
  TranslationFileSchema,
  type ManifestPage,
  type SourceManifest,
  type SourcePage,
  type SourceSegment,
  type TranslationFile,
} from "../../scripts/mirror/model.js";

export const NOW = "2026-07-13T01:00:00.000Z";
export const NEXT_DAY = "2026-07-14T01:00:00.000Z";

export const PNG = new Uint8Array(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
);

export const segmentFixture = (
  overrides: Partial<SourceSegment> = {},
): SourceSegment => {
  const source = overrides.source ?? "Install";

  return SourceSegmentSchema.parse({
    id: "install:h1:0",
    kind: "heading",
    source,
    sourceHash: overrides.sourceHash ?? sha256(normalizeText(source)),
    protected: {},
    ...overrides,
  });
};

export const pageFixture = (
  overrides: Partial<SourcePage> = {},
): SourcePage => {
  const {
    segments: overriddenSegments,
    pageHash: overriddenPageHash,
    ...pageOverrides
  } = overrides;
  const segments = overriddenSegments ?? [
    segmentFixture(),
    segmentFixture({
      id: "install:p:0",
      kind: "paragraph",
      source:
        "Continue to [your first session](ORCA_PROTECTED_0001).",
      protected: {
        ORCA_PROTECTED_0001:
          "https://www.onorca.dev/docs/first-session",
      },
    }),
  ];

  return SourcePageSchema.parse({
    sourceUrl: "https://www.onorca.dev/docs/install",
    mirrorPath: "/docs/install/",
    titleSegmentId: segments[0]?.id ?? "install:h1:0",
    checkedAt: NOW,
    sitemapLastmod: "2026-07-12",
    images: [
      {
        sourceUrl: "https://www.onorca.dev/docs/install.png",
        localPath: null,
        contentHash: null,
        robotsRemote: false,
      },
    ],
    navigationGroups: [
      {
        sourceLabel: "Get started",
        sourceUrls: [
          "https://www.onorca.dev/docs/install",
          "https://www.onorca.dev/docs/first-session",
        ],
      },
    ],
    previousSourceUrl: null,
    nextSourceUrl: "https://www.onorca.dev/docs/first-session",
    ...pageOverrides,
    pageHash:
      overriddenPageHash ??
      sha256(segments.map((segment) => segment.sourceHash).join("\n")),
    segments,
  });
};

const manifestPageFixture = (
  mirrorPath: string,
  overrides: Partial<ManifestPage>,
): ManifestPage => {
  const sourcePath = mirrorPath === "/docs/" ? "/docs" : mirrorPath.slice(0, -1);
  const titleSegmentId = `${mirrorPath.split("/").filter(Boolean).at(-1) ?? "docs"}:h1:0`;

  return ManifestPageSchema.parse({
    sourceUrl: new URL(sourcePath, "https://www.onorca.dev").href,
    mirrorPath,
    titleSegmentId,
    pageHash: sha256(mirrorPath),
    checkedAt: NOW,
    sitemapLastmod: "2026-07-12",
    translatedAt: NOW,
    missingRuns: 0,
    status: "active",
    redirectTo: null,
    segmentHashes: { [titleSegmentId]: sha256("Install") },
    images: [],
    ...overrides,
  });
};

export const manifestFixture = (
  pages: Record<string, Partial<ManifestPage>> = {},
): SourceManifest =>
  SourceManifestSchema.parse({
    schemaVersion: 1,
    generatedAt: NOW,
    pages: Object.fromEntries(
      Object.entries(pages).map(([mirrorPath, overrides]) => [
        mirrorPath,
        manifestPageFixture(mirrorPath, overrides),
      ]),
    ),
  });

export const translationFixture = (
  entries?: TranslationFile["entries"],
  overrides: Partial<Omit<TranslationFile, "entries">> = {},
): TranslationFile => {
  const page = pageFixture();
  const defaultEntries = {
    "install:h1:0": {
      sourceHash: page.segments[0]!.sourceHash,
      translated: "설치",
    },
    "install:p:0": {
      sourceHash: page.segments[1]!.sourceHash,
      translated:
        "계속해서 [첫 세션](ORCA_PROTECTED_0001)을 진행합니다.",
    },
  };

  return TranslationFileSchema.parse({
    sourceUrl: page.sourceUrl,
    mirrorPath: page.mirrorPath,
    ...overrides,
    entries: entries ?? defaultEntries,
  });
};

export const binaryClient = (
  body: Uint8Array,
  contentType = "image/png",
) => ({
  bytes: async (_url: URL) => ({
    body: new Uint8Array(body),
    contentType,
  }),
});

const fixturePage = (title: string) => `<!doctype html>
<html><body><main><article><h1>${title}</h1><p>Read the documentation.</p></article></main></body></html>`;

export const fixtureWorkspace = async () => {
  const root = await mkdtemp(join(tmpdir(), "orca-docs-ko-"));
  const manifestPath = join(root, "mirror", "source-manifest.json");
  const originalManifest = manifestFixture();

  await mkdir(join(root, "mirror"), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(originalManifest, null, 2)}\n`);

  const sitemap = `<?xml version="1.0"?><urlset>
    <url><loc>https://www.onorca.dev/docs</loc></url>
    <url><loc>https://www.onorca.dev/docs/install</loc></url>
  </urlset>`;
  const client = {
    text: async (url: URL) => {
      if (url.pathname === "/robots.txt") return "User-agent: *\nAllow: /";
      if (url.pathname === "/sitemap.xml") return sitemap;
      if (url.pathname === "/docs") return fixturePage("Documentation");
      if (url.pathname === "/docs/install") return fixturePage("Install");
      throw new Error(`Unexpected fixture URL: ${url.href}`);
    },
    ...binaryClient(PNG),
  };
  const config = {
    origin: new URL("https://www.onorca.dev"),
    workspaceRoot: root,
    manifestPath,
    translationRoot: join(root, "mirror", "translations"),
    jobRoot: join(root, ".mirror", "jobs"),
    stagingRoot: join(root, ".mirror", "staging"),
    contentRoot: join(root, "src", "content", "docs"),
    sidebarPath: join(root, "mirror", "sidebar.json"),
    assetRoot: join(root, "public", "assets", "mirror"),
    client,
  };

  return {
    root,
    config,
    originalManifest,
    readManifest: async () =>
      SourceManifestSchema.parse(
        JSON.parse(await readFile(manifestPath, "utf8")),
      ),
  };
};
