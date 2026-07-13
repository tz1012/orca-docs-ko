import { load, type CheerioAPI } from "cheerio";
import TurndownService from "turndown";
// turndown-plugin-gfm 1.0.2 does not publish TypeScript declarations.
// @ts-expect-error The CommonJS package exports a compatible Turndown plugin.
import { gfm } from "turndown-plugin-gfm";

import { normalizeText, sha256 } from "./hash.js";
import {
  SourcePageSchema,
  type NavigationGroup,
  type SourcePage,
  type SourceSegment,
} from "./model.js";
import { protectMarkdown } from "./protect.js";

export type ExtractPageInput = {
  html: string;
  sourceUrl: URL;
  checkedAt: string;
  sitemapLastmod: string | null;
};

const SEMANTIC_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "table",
  "pre",
  "blockquote",
  "aside",
  "figure",
  "img",
].join(",");

const GROUP_SELECTOR = [
  "[data-navigation-group]",
  "[data-nav-group]",
  "[data-sidebar-group]",
  "section",
].join(",");

const visibleText = (value: string) => value.replace(/\s+/g, " ").trim();

const mirrorPathFor = (sourceUrl: URL) => {
  const { pathname } = sourceUrl;
  if (pathname === "/docs" || pathname === "/docs/") return "/docs/";
  if (!pathname.startsWith("/docs/")) {
    throw new Error(`Source URL is outside /docs: ${sourceUrl.href}`);
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

const resolveUrl = (
  rawValue: string,
  sourceUrl: URL,
  allowedProtocols: ReadonlySet<string>,
  attribute: string,
) => {
  let resolved: URL;
  try {
    resolved = new URL(rawValue, sourceUrl);
  } catch {
    throw new Error(`Invalid ${attribute} URL: ${rawValue}`);
  }

  if (!allowedProtocols.has(resolved.protocol)) {
    throw new Error(
      `Unsupported ${attribute} URL protocol: ${resolved.protocol}`,
    );
  }
  return resolved;
};

const canonicalDocsUrl = (rawValue: string, sourceUrl: URL) => {
  let resolved: URL;
  try {
    resolved = new URL(rawValue, sourceUrl);
  } catch {
    return null;
  }
  if (
    resolved.origin !== sourceUrl.origin ||
    (resolved.pathname !== "/docs" && !resolved.pathname.startsWith("/docs/"))
  ) {
    return null;
  }
  resolved.search = "";
  resolved.hash = "";
  return resolved.href;
};

const extractNavigationGroups = (
  $: CheerioAPI,
  sourceUrl: URL,
): NavigationGroup[] => {
  const explicitSidebar = $(
    "[data-sidebar], [data-docs-sidebar], [data-navigation-sidebar]",
  ).first();
  const labelledSidebar = $("nav, [role='navigation']")
    .filter((_index, element) => {
      const label = visibleText(
        [
          $(element).attr("aria-label") ?? "",
          $(element).attr("data-label") ?? "",
          $(element).attr("class") ?? "",
        ].join(" "),
      );
      return /\b(documentation|docs|sidebar)\b/i.test(label);
    })
    .first();
  const sidebar =
    explicitSidebar.length > 0 ? explicitSidebar : labelledSidebar;
  if (sidebar.length === 0) return [];

  const groups: NavigationGroup[] = [];
  const addGroup = (sourceLabel: string, sourceUrls: string[]) => {
    const label = visibleText(sourceLabel);
    const urls = [...new Set(sourceUrls)];
    if (label.length > 0 && urls.length > 0) {
      groups.push({ sourceLabel: label, sourceUrls: urls });
    }
  };

  const groupElements = sidebar
    .find(GROUP_SELECTOR)
    .filter(
      (_index, element) =>
        $(element).parentsUntil(sidebar).filter(GROUP_SELECTOR).length === 0,
    );
  groupElements.each((_index, element) => {
    const group = $(element);
    const label =
      group.attr("data-label") ??
      group.attr("data-title") ??
      group
        .children("h1, h2, h3, h4, h5, h6, legend, summary, button")
        .first()
        .text();
    const sourceUrls: string[] = [];
    group.find("a[href]").each((_linkIndex, link) => {
      const href = $(link).attr("href");
      const url = href === undefined ? null : canonicalDocsUrl(href, sourceUrl);
      if (url !== null) sourceUrls.push(url);
    });
    addGroup(label, sourceUrls);
  });

  if (groups.length > 0) return groups;

  let currentLabel = "";
  let currentUrls: string[] = [];
  const flush = () => {
    addGroup(currentLabel, currentUrls);
    currentUrls = [];
  };
  sidebar.find("h1, h2, h3, h4, h5, h6, a[href]").each((_index, element) => {
    if (/^h[1-6]$/i.test(element.tagName)) {
      flush();
      currentLabel = $(element).text();
      return;
    }
    const href = $(element).attr("href");
    const url = href === undefined ? null : canonicalDocsUrl(href, sourceUrl);
    if (url !== null) currentUrls.push(url);
  });
  flush();

  if (groups.length === 0) {
    const sourceUrls: string[] = [];
    sidebar.find("a[href]").each((_index, link) => {
      const href = $(link).attr("href");
      const url = href === undefined ? null : canonicalDocsUrl(href, sourceUrl);
      if (url !== null) sourceUrls.push(url);
    });
    addGroup(
      sidebar.attr("aria-label") ??
        sidebar.attr("data-label") ??
        "Documentation",
      sourceUrls,
    );
  }

  return groups;
};

const extractAdjacentUrl = (
  $: CheerioAPI,
  sourceUrl: URL,
  relation: "previous" | "next",
) => {
  const aliases =
    relation === "previous" ? new Set(["prev", "previous"]) : new Set(["next"]);
  const anchors = $("a[href]");
  let result: string | null = null;

  anchors.each((_index, element) => {
    if (result !== null) return;
    const rel = ($(element).attr("rel") ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (!rel.some((value) => aliases.has(value))) return;
    const href = $(element).attr("href");
    if (href !== undefined) result = canonicalDocsUrl(href, sourceUrl);
  });
  if (result !== null) return result;

  const labelPattern =
    relation === "previous" ? /\b(previous|prev)\b/i : /\bnext\b/i;
  anchors.each((_index, element) => {
    if (result !== null) return;
    const anchor = $(element);
    const label = visibleText(
      [
        anchor.attr("aria-label") ?? "",
        anchor.attr("title") ?? "",
        anchor.text(),
      ].join(" "),
    );
    if (!labelPattern.test(label)) return;
    const href = anchor.attr("href");
    if (href !== undefined) result = canonicalDocsUrl(href, sourceUrl);
  });
  return result;
};

const anchorPart = (value: string) => {
  const normalized = visibleText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized.length > 0 ? normalized : "section";
};

const segmentKind = (tagName: string): SourceSegment["kind"] => {
  if (/^h[1-6]$/.test(tagName)) return "heading";
  if (tagName === "p") return "paragraph";
  if (tagName === "ul" || tagName === "ol") return "list";
  if (tagName === "pre") return "code";
  if (tagName === "img") return "image";
  if (
    tagName === "table" ||
    tagName === "blockquote" ||
    tagName === "aside" ||
    tagName === "figure"
  ) {
    return tagName;
  }
  throw new Error(`Unsupported semantic element: ${tagName}`);
};

export const extractPage = (input: ExtractPageInput): SourcePage => {
  const { html, sourceUrl, checkedAt, sitemapLastmod } = input;
  const mirrorPath = mirrorPathFor(sourceUrl);
  const $ = load(html);

  $("script, style, [hidden], [aria-hidden='true'], [inert]").remove();
  $("[style]").each((_index, element) => {
    const style = $(element).attr("style") ?? "";
    if (/\b(display\s*:\s*none|visibility\s*:\s*hidden)\b/i.test(style)) {
      $(element).remove();
    }
  });

  const navigationGroups = extractNavigationGroups($, sourceUrl);
  const previousSourceUrl = extractAdjacentUrl($, sourceUrl, "previous");
  const nextSourceUrl = extractAdjacentUrl($, sourceUrl, "next");

  const nestedArticle = $("main article").first();
  const standaloneArticle = $("article").first();
  const main = $("main").first();
  const article =
    nestedArticle.length > 0
      ? nestedArticle
      : standaloneArticle.length > 0
        ? standaloneArticle
        : main;
  if (article.length === 0) {
    throw new Error(`No documentation article found at ${sourceUrl.href}`);
  }

  article
    .find(
      "script, style, header, footer, [hidden], [aria-hidden='true'], [inert]",
    )
    .remove();
  if (article.find("h1").length === 0) {
    throw new Error(
      `Documentation article is missing an h1: ${sourceUrl.href}`,
    );
  }

  const linkProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
  article.find("a[href]").each((_index, element) => {
    const anchor = $(element);
    const href = anchor.attr("href");
    if (href === undefined) return;
    anchor.attr(
      "href",
      resolveUrl(href, sourceUrl, linkProtocols, "link").href,
    );
  });

  const imageProtocols = new Set(["http:", "https:"]);
  const imageUrls: string[] = [];
  article.find("img[src]").each((_index, element) => {
    const image = $(element);
    const src = image.attr("src");
    if (src === undefined) return;
    const resolved = resolveUrl(src, sourceUrl, imageProtocols, "image").href;
    image.attr("src", resolved);
    if (!imageUrls.includes(resolved)) imageUrls.push(resolved);
  });

  const turndown = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    fence: "```",
    headingStyle: "atx",
    strongDelimiter: "**",
  });
  turndown.use(gfm);

  const semanticElements = article
    .find(SEMANTIC_SELECTOR)
    .filter(
      (_index, element) =>
        $(element).parentsUntil(article).filter(SEMANTIC_SELECTOR).length === 0,
    )
    .toArray();
  const segments: SourceSegment[] = [];
  const ids = new Set<string>();
  const occurrences = new Map<string, number>();
  let currentAnchor = "page";
  let titleSegmentId: string | null = null;

  for (const element of semanticElements) {
    const tagName = element.tagName.toLowerCase();
    const kind = segmentKind(tagName);
    if (kind === "heading") {
      currentAnchor = anchorPart($(element).attr("id") ?? $(element).text());
    }
    const sourceAnchor = anchorPart($(element).attr("id") ?? currentAnchor);
    const occurrenceKey = `${kind}:${sourceAnchor}`;
    const occurrence = occurrences.get(occurrenceKey) ?? 0;
    occurrences.set(occurrenceKey, occurrence + 1);
    const id = `${mirrorPath}:${kind}:${sourceAnchor}:${occurrence}`;
    if (ids.has(id)) {
      throw new Error(`Duplicate extracted segment ID: ${id}`);
    }

    const markdown = turndown.turndown($.html(element)).trim();
    if (normalizeText(markdown).length === 0) continue;
    const protectedResult = protectMarkdown(markdown);
    const segment: SourceSegment = {
      id,
      kind,
      source: protectedResult.markdown,
      sourceHash: sha256(normalizeText(markdown)),
      protected: protectedResult.map,
    };
    ids.add(id);
    segments.push(segment);
    if (tagName === "h1" && titleSegmentId === null) titleSegmentId = id;
  }

  if (segments.length === 0) {
    throw new Error(
      `Documentation article produced empty output: ${sourceUrl.href}`,
    );
  }
  if (titleSegmentId === null) {
    throw new Error(
      `Documentation h1 produced empty output: ${sourceUrl.href}`,
    );
  }

  return SourcePageSchema.parse({
    sourceUrl: sourceUrl.href,
    mirrorPath,
    titleSegmentId,
    pageHash: sha256(segments.map((segment) => segment.sourceHash).join("\n")),
    checkedAt,
    sitemapLastmod,
    segments,
    images: imageUrls.map((imageUrl) => ({
      sourceUrl: imageUrl,
      localPath: null,
      contentHash: null,
      robotsRemote: false,
    })),
    navigationGroups,
    previousSourceUrl,
    nextSourceUrl,
  });
};
