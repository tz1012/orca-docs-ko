import {
  SourcePageSchema,
  type SourcePage,
  type TranslationFile,
} from "./model.js";
import { validateTranslation } from "./jobs.js";
import { restoreProtected } from "./protect.js";

const MIRROR_ORIGIN = "https://www.onorca.dev";
const MIRROR_BASE = "/orca-docs-ko";

export const TRANSLATION_NOTICE = {
  title: "비공식 한국어 번역",
  message:
    "이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다.",
  rights:
    "원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다.",
} as const;

const KOREAN_NAVIGATION_LABELS: Readonly<Record<string, string>> = {
  "Get started": "시작하기",
  "Get Started": "시작하기",
  "Getting Started": "시작하기",
  Introduction: "소개",
  Overview: "개요",
  Reference: "참조",
  "Core Workflows": "핵심 워크플로",
  "Mental Model": "핵심 개념",
  "Working with Agents": "에이전트 활용",
  "Reviewing & Shipping Code": "코드 검토 및 배포",
  "Editing in Orca": "Orca에서 편집하기",
  "Browser & Design Mode": "브라우저 및 디자인 모드",
  Terminal: "터미널",
  "Remote & SSH": "원격 및 SSH",
  "CLI & Automation": "CLI 및 자동화",
  "Orca CLI & Skills": "Orca CLI 및 스킬",
  Mobile: "모바일",
  "Notifications & Inbox": "알림 및 받은 편지함",
  Recipes: "레시피",
  "Settings Reference": "설정 참조",
  "Privacy & Telemetry": "개인정보 보호 및 원격 측정",
  "Troubleshooting & FAQ": "문제 해결 및 FAQ",
};

export type RenderablePage = {
  page: SourcePage;
  translation: TranslationFile;
};

export type SidebarLink = {
  label: string;
  slug: string;
};

export type SidebarGroup = {
  label: string;
  items: SidebarLink[];
};

const yamlString = (value: string) => JSON.stringify(value);

const canonicalSourceKey = (value: string) => {
  const url = new URL(value);
  const pathname =
    url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/u, "");
  return `${url.origin}${pathname}`;
};

const mirrorHref = (value: string) => {
  let url: URL;
  try {
    url = new URL(value, MIRROR_ORIGIN);
  } catch {
    return value;
  }

  if (url.origin !== MIRROR_ORIGIN) return value;
  if (url.pathname !== "/docs" && !url.pathname.startsWith("/docs/")) {
    return value;
  }

  const pathname =
    url.pathname === "/docs" || url.pathname === "/docs/"
      ? "/docs/"
      : `${url.pathname.replace(/\/+$/u, "")}/`;
  return `${MIRROR_BASE}${pathname}${url.search}${url.hash}`;
};

const localAssetHref = (localPath: string) =>
  localPath.startsWith(`${MIRROR_BASE}/`)
    ? localPath
    : `${MIRROR_BASE}/${localPath.replace(/^\/+/, "")}`;

const imageReplacements = (page: SourcePage) => {
  const replacements = new Map<string, string>();
  for (const image of page.images) {
    const replacement =
      image.localPath === null
        ? image.sourceUrl
        : localAssetHref(image.localPath);
    const previous = replacements.get(image.sourceUrl);
    if (previous !== undefined && previous !== replacement) {
      throw new Error(`Conflicting image state for ${image.sourceUrl}`);
    }
    replacements.set(image.sourceUrl, replacement);
  }
  return replacements;
};

type MarkdownDestination = "link" | "image" | null;

const isEscaped = (markdown: string, index: number) => {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && markdown[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
};

const labelOpeningAt = (markdown: string, closingBracket: number) => {
  let nestedBrackets = 0;
  for (let cursor = closingBracket - 1; cursor >= 0; cursor -= 1) {
    if (isEscaped(markdown, cursor)) continue;
    if (markdown[cursor] === "]") {
      nestedBrackets += 1;
    } else if (markdown[cursor] === "[") {
      if (nestedBrackets === 0) return cursor;
      nestedBrackets -= 1;
    }
  }
  return -1;
};

const markdownDestinationFor = (
  markdown: string,
  token: string,
): MarkdownDestination => {
  const match = new RegExp(`\\b${token}\\b`, "u").exec(markdown);
  if (match === null) return null;

  let cursor = match.index;
  while (cursor > 0 && /[ \t]/u.test(markdown[cursor - 1]!)) cursor -= 1;
  if (markdown[cursor - 1] === "<") {
    cursor -= 1;
    while (cursor > 0 && /[ \t]/u.test(markdown[cursor - 1]!)) cursor -= 1;
  }
  if (markdown[cursor - 1] !== "(" || markdown[cursor - 2] !== "]") {
    return null;
  }

  const labelOpening = labelOpeningAt(markdown, cursor - 2);
  if (labelOpening < 0 || isEscaped(markdown, labelOpening)) return null;
  return labelOpening > 0 &&
    markdown[labelOpening - 1] === "!" &&
    !isEscaped(markdown, labelOpening - 1)
    ? "image"
    : "link";
};

const restoredSegment = (
  segment: SourcePage["segments"][number],
  translated: string,
  images: ReadonlyMap<string, string>,
) =>
  restoreProtected(
    translated,
    Object.fromEntries(
      Object.entries(segment.protected).map(([token, value]) => {
        const destination = markdownDestinationFor(translated, token);
        const replacement =
          destination === "link"
            ? mirrorHref(value)
            : destination === "image"
              ? (images.get(value) ?? value)
              : value;
        return [token, replacement];
      }),
    ),
  );

const frontmatterLink = (sourceUrl: string | null) =>
  sourceUrl === null ? "false" : mirrorHref(sourceUrl);

export const renderPage = (
  inputPage: SourcePage,
  inputTranslation: TranslationFile,
) => {
  const page = SourcePageSchema.parse(inputPage);
  const translation = validateTranslation(page, inputTranslation);
  const images = imageReplacements(page);
  const titleSegment = page.segments.find(
    (segment) => segment.id === page.titleSegmentId,
  );
  if (titleSegment === undefined) {
    throw new Error(`Missing title segment ${page.titleSegmentId}`);
  }

  const titleEntry = translation.entries[page.titleSegmentId];
  if (titleEntry === undefined) {
    throw new Error(`Missing translation output for ${page.titleSegmentId}`);
  }
  const title = restoredSegment(
    titleSegment,
    titleEntry.translated,
    images,
  ).replace(/^#[ \t]+/u, "");

  const body = page.segments
    .filter((segment) => segment.id !== page.titleSegmentId)
    .map((segment) => {
      const entry = translation.entries[segment.id];
      if (entry === undefined) {
        throw new Error(`Missing translation output for ${segment.id}`);
      }
      return restoredSegment(segment, entry.translated, images);
    })
    .join("\n\n");

  const frontmatter = [
    "---",
    `title: ${yamlString(title)}`,
    `sourceUrl: ${page.sourceUrl}`,
    `checkedAt: ${yamlString(page.checkedAt)}`,
    "editUrl: false",
    `prev: ${frontmatterLink(page.previousSourceUrl)}`,
    `next: ${frontmatterLink(page.nextSourceUrl)}`,
    "translationNotice:",
    `  title: ${yamlString(TRANSLATION_NOTICE.title)}`,
    `  message: ${yamlString(TRANSLATION_NOTICE.message)}`,
    `  rights: ${yamlString(TRANSLATION_NOTICE.rights)}`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${body}${body.length === 0 ? "" : "\n"}`;
};

const titleFor = ({ page, translation }: RenderablePage) => {
  const validatedPage = SourcePageSchema.parse(page);
  const validatedTranslation = validateTranslation(
    validatedPage,
    translation,
  );
  const segment = validatedPage.segments.find(
    (candidate) => candidate.id === validatedPage.titleSegmentId,
  );
  const entry = validatedTranslation.entries[validatedPage.titleSegmentId];
  if (segment === undefined || entry === undefined) {
    throw new Error(`Missing title translation for ${validatedPage.mirrorPath}`);
  }
  return restoreProtected(entry.translated, segment.protected).replace(
    /^#[ \t]+/u,
    "",
  );
};

const sidebarSlug = (mirrorPath: string) => mirrorPath.slice(1, -1);

export const buildSidebar = (
  inputs: readonly RenderablePage[],
  navigationLabels: Readonly<Record<string, string>> =
    KOREAN_NAVIGATION_LABELS,
): SidebarGroup[] => {
  if (inputs.length === 0) return [];

  const records = inputs
    .map((input) => ({
      page: SourcePageSchema.parse(input.page),
      title: titleFor(input),
    }))
    .sort((left, right) => left.page.mirrorPath.localeCompare(right.page.mirrorPath));
  const bySourceUrl = new Map<string, (typeof records)[number]>();
  for (const record of records) {
    const key = canonicalSourceKey(record.page.sourceUrl);
    if (bySourceUrl.has(key)) {
      throw new Error(`Duplicate page source URL: ${record.page.sourceUrl}`);
    }
    bySourceUrl.set(key, record);
  }

  const navigationPage =
    records.find(({ page }) => page.mirrorPath === "/docs/") ??
    records.find(({ page }) => page.navigationGroups.length > 0);
  const navigationGroups = navigationPage?.page.navigationGroups ?? [];
  const categorized = new Set<string>();
  const sidebar: SidebarGroup[] = [];

  for (const group of navigationGroups) {
    const label =
      navigationLabels[group.sourceLabel] ??
      (/\p{Script=Hangul}/u.test(group.sourceLabel)
        ? group.sourceLabel
        : undefined);
    if (label === undefined) {
      throw new Error(
        `Missing Korean navigation label for ${group.sourceLabel}`,
      );
    }

    const items: SidebarLink[] = [];
    for (const sourceUrl of group.sourceUrls) {
      const record = bySourceUrl.get(canonicalSourceKey(sourceUrl));
      if (record === undefined || categorized.has(record.page.mirrorPath)) {
        continue;
      }
      categorized.add(record.page.mirrorPath);
      items.push({
        label: record.title,
        slug: sidebarSlug(record.page.mirrorPath),
      });
    }
    if (items.length > 0) sidebar.push({ label, items });
  }

  const uncategorized = records
    .filter(({ page }) => !categorized.has(page.mirrorPath))
    .map(({ page, title }) => ({
      label: title,
      slug: sidebarSlug(page.mirrorPath),
    }));
  if (uncategorized.length > 0) {
    sidebar.push({ label: "분류되지 않음", items: uncategorized });
  }

  return sidebar;
};
