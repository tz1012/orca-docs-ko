import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import {
  buildSidebar,
  renderPage,
  type RenderablePage,
} from "../../scripts/mirror/render.js";
import {
  TranslationFileSchema,
  type SourcePage,
  type TranslationFile,
} from "../../scripts/mirror/model.js";
import { protectMarkdown } from "../../scripts/mirror/protect.js";
import {
  NOW,
  pageFixture,
  segmentFixture,
} from "../support/factories.js";

const translationFor = (
  page: SourcePage,
  translated: Readonly<Record<string, string>>,
): TranslationFile =>
  TranslationFileSchema.parse({
    sourceUrl: page.sourceUrl,
    mirrorPath: page.mirrorPath,
    entries: Object.fromEntries(
      page.segments.map((segment) => [
        segment.id,
        {
          sourceHash: segment.sourceHash,
          translated: translated[segment.id] ?? segment.source,
        },
      ]),
    ),
  });

const renderFixture = () => {
  const page = pageFixture({
    segments: [
      segmentFixture({ id: "install:h1:0", source: "Install" }),
      segmentFixture({
        id: "install:p:0",
        kind: "paragraph",
        source:
          "Continue to [your first session](ORCA_PROTECTED_0001), read [the guide](ORCA_PROTECTED_0002), or view [the changelog](ORCA_PROTECTED_0003).",
        protected: {
          ORCA_PROTECTED_0001:
            "https://www.onorca.dev/docs/first-session?mode=fast#start",
          ORCA_PROTECTED_0002: "https://example.com/docs/guide",
          ORCA_PROTECTED_0003: "https://www.onorca.dev/changelog",
        },
      }),
      segmentFixture({
        id: "install:image:0",
        kind: "image",
        source:
          "![Install](ORCA_PROTECTED_0001)\n\n![Remote](ORCA_PROTECTED_0002)",
        protected: {
          ORCA_PROTECTED_0001:
            "https://www.onorca.dev/docs/install.png",
          ORCA_PROTECTED_0002:
            "https://www.onorca.dev/docs/install-remote.gif",
        },
      }),
    ],
    images: [
      {
        sourceUrl: "https://www.onorca.dev/docs/install.png",
        localPath: `/assets/mirror/${"a".repeat(64)}.png`,
        contentHash: "a".repeat(64),
        robotsRemote: false,
      },
      {
        sourceUrl: "https://www.onorca.dev/docs/install-remote.gif",
        localPath: null,
        contentHash: null,
        robotsRemote: true,
      },
    ],
  });
  const translation = translationFor(page, {
    "install:h1:0": "설치",
    "install:p:0":
      "[첫 세션](ORCA_PROTECTED_0001)을 계속하고, [가이드](ORCA_PROTECTED_0002)를 읽거나 [변경 기록](ORCA_PROTECTED_0003)을 확인합니다.",
    "install:image:0":
      "![설치](ORCA_PROTECTED_0001)\n\n![원격](ORCA_PROTECTED_0002)",
  });

  return { page, translation };
};

const titledPage = (
  sourceUrl: string,
  mirrorPath: string,
  id: string,
  sourceTitle: string,
  translatedTitle: string,
  navigationGroups: SourcePage["navigationGroups"] = [],
): RenderablePage => {
  const page = pageFixture({
    sourceUrl,
    mirrorPath,
    titleSegmentId: id,
    segments: [segmentFixture({ id, source: sourceTitle })],
    navigationGroups,
    previousSourceUrl: null,
    nextSourceUrl: null,
  });
  return {
    page,
    translation: translationFor(page, { [id]: translatedTitle }),
  };
};

describe("Korean page rendering", () => {
  test("renders exact notice metadata and rewrites only mirror-owned links and images", () => {
    const { page, translation } = renderFixture();

    const markdown = renderPage(page, translation);

    expect(markdown).toContain('title: "설치"');
    expect(markdown).toContain(
      "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다.",
    );
    expect(markdown).toContain("sourceUrl: https://www.onorca.dev/docs/install");
    expect(markdown).toContain(`checkedAt: "${NOW}"`);
    expect(markdown).toContain("editUrl: false");
    expect(markdown).toContain("prev: false");
    expect(markdown).toContain(
      "next: /orca-docs-ko/docs/first-session/",
    );
    expect(markdown).toContain(
      "/orca-docs-ko/docs/first-session/?mode=fast#start",
    );
    expect(markdown).toContain("https://example.com/docs/guide");
    expect(markdown).toContain("https://www.onorca.dev/changelog");
    expect(markdown).toContain(
      `/orca-docs-ko/assets/mirror/${"a".repeat(64)}.png`,
    );
    expect(markdown).toContain(
      "https://www.onorca.dev/docs/install-remote.gif",
    );
    expect(markdown).toContain("Lovecast Inc. 및 각 권리자");
    expect(markdown).not.toContain("# 설치");
    expect(renderPage(page, translation)).toBe(markdown);
  });

  test("validates the complete translation before restoring protected values", () => {
    const { page, translation } = renderFixture();
    const invalid = TranslationFileSchema.parse({
      ...translation,
      entries: {
        ...translation.entries,
        [page.titleSegmentId]: {
          ...translation.entries[page.titleSegmentId]!,
          sourceHash: "f".repeat(64),
        },
        "install:p:0": {
          ...translation.entries["install:p:0"]!,
          translated: "잘못된 ORCA_PROTECTED_9999 토큰입니다.",
        },
      },
    });

    expect(() => renderPage(page, invalid)).toThrow(/source hash/i);
  });

  test("rewrites only Markdown destinations and preserves protected URL literals", () => {
    const protectedContent = protectMarkdown(
      [
        "Use `https://www.onorca.dev/docs/inline-code`.",
        "Visit https://www.onorca.dev/docs/bare.",
        "Image source: https://www.onorca.dev/docs/install.png.",
        "[Internal docs](https://www.onorca.dev/docs/linked)",
        "![Allowed image](https://www.onorca.dev/docs/install.png)",
        "![Remote image](https://www.onorca.dev/docs/remote.gif)",
        "```text",
        "https://www.onorca.dev/docs/fenced-code",
        "```",
      ].join("\n\n"),
    );
    const page = pageFixture({
      segments: [
        segmentFixture({ id: "install:h1:0", source: "Install" }),
        segmentFixture({
          id: "install:p:destinations",
          kind: "paragraph",
          source: protectedContent.markdown,
          protected: protectedContent.map,
        }),
      ],
      images: [
        {
          sourceUrl: "https://www.onorca.dev/docs/install.png",
          localPath: `/assets/mirror/${"b".repeat(64)}.png`,
          contentHash: "b".repeat(64),
          robotsRemote: false,
        },
        {
          sourceUrl: "https://www.onorca.dev/docs/remote.gif",
          localPath: null,
          contentHash: null,
          robotsRemote: true,
        },
      ],
    });
    const translation = translationFor(page, {
      "install:h1:0": "설치",
      "install:p:destinations": `한국어 안내입니다.\n\n${protectedContent.markdown}`,
    });

    const markdown = renderPage(page, translation);

    expect(markdown).toContain(
      "`https://www.onorca.dev/docs/inline-code`",
    );
    expect(markdown).toContain(
      "Visit https://www.onorca.dev/docs/bare.",
    );
    expect(markdown).toContain(
      "Image source: https://www.onorca.dev/docs/install.png.",
    );
    expect(markdown).toContain(
      "[Internal docs](/orca-docs-ko/docs/linked/)",
    );
    expect(markdown).toContain(
      `![Allowed image](/orca-docs-ko/assets/mirror/${"b".repeat(64)}.png)`,
    );
    expect(markdown).toContain(
      "![Remote image](https://www.onorca.dev/docs/remote.gif)",
    );
    expect(markdown).toContain(
      "```text\n\nhttps://www.onorca.dev/docs/fenced-code\n\n```",
    );
  });

  test("renders the accessible exact notice component", async () => {
    const source = await readFile(
      "src/components/TranslationNotice.astro",
      "utf8",
    );

    expect(source).toContain('aria-label="번역 안내"');
    expect(source).toContain("비공식 한국어 번역");
    expect(source).toContain("원문 보기");
    expect(source).toContain("<time datetime={checkedAt}>{checkedAt}</time>");
    expect(source).toContain(
      "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다.",
    );
  });
});

describe("Korean sidebar rendering", () => {
  test("follows source navigation order and appends only uncategorized pages", () => {
    const navigationGroups = [
      {
        sourceLabel: "Reference",
        sourceUrls: ["https://www.onorca.dev/docs/commands"],
      },
      {
        sourceLabel: "Get started",
        sourceUrls: [
          "https://www.onorca.dev/docs",
          "https://www.onorca.dev/docs/install",
        ],
      },
    ];
    const root = titledPage(
      "https://www.onorca.dev/docs",
      "/docs/",
      "docs:h1:0",
      "Introduction",
      "소개",
      navigationGroups,
    );
    const install = titledPage(
      "https://www.onorca.dev/docs/install",
      "/docs/install/",
      "install:h1:0",
      "Install",
      "설치",
    );
    const commands = titledPage(
      "https://www.onorca.dev/docs/commands",
      "/docs/commands/",
      "commands:h1:0",
      "Commands",
      "명령어",
    );
    const extra = titledPage(
      "https://www.onorca.dev/docs/z-extra",
      "/docs/z-extra/",
      "extra:h1:0",
      "Extra",
      "추가 문서",
    );

    expect(buildSidebar([extra, install, commands, root])).toEqual([
      {
        label: "참조",
        items: [{ label: "명령어", slug: "docs/commands" }],
      },
      {
        label: "시작하기",
        items: [
          { label: "소개", slug: "docs" },
          { label: "설치", slug: "docs/install" },
        ],
      },
      {
        label: "분류되지 않음",
        items: [{ label: "추가 문서", slug: "docs/z-extra" }],
      },
    ]);
  });

  test("does not add an empty uncategorized group", () => {
    const navigationGroups = [
      {
        sourceLabel: "Get started",
        sourceUrls: ["https://www.onorca.dev/docs/install"],
      },
    ];
    const install = titledPage(
      "https://www.onorca.dev/docs/install",
      "/docs/install/",
      "install:h1:0",
      "Install",
      "설치",
      navigationGroups,
    );

    expect(buildSidebar([install])).toEqual([
      {
        label: "시작하기",
        items: [{ label: "설치", slug: "docs/install" }],
      },
    ]);
  });
});
