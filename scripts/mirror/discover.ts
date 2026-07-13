import { XMLParser } from "fast-xml-parser";
import robotsParser from "robots-parser";

import { MIRROR_USER_AGENT } from "./http.js";

const SOURCE_ORIGIN = "https://www.onorca.dev";

export type TextClient = {
  text(url: URL): Promise<string>;
};

export type DiscoveredPage = {
  url: URL;
  lastmod: string | null;
};

export type DiscoveryResult = {
  robotsText: string;
  pages: DiscoveredPage[];
};

type XmlRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is XmlRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecords = (value: unknown): XmlRecord[] => {
  if (Array.isArray(value)) return value.filter(isRecord);
  return isRecord(value) ? [value] : [];
};

const canonicalDocsUrl = (value: unknown): URL | null => {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value.trim());
    if (
      url.origin !== SOURCE_ORIGIN ||
      url.username !== "" ||
      url.password !== "" ||
      (url.pathname !== "/docs" && !url.pathname.startsWith("/docs/"))
    ) {
      return null;
    }

    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
};

const parseSitemap = (sitemapXml: string): DiscoveredPage[] => {
  const parsed = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    trimValues: true,
  }).parse(sitemapXml) as unknown;
  if (!isRecord(parsed) || !isRecord(parsed.urlset)) return [];

  const pages = new Map<string, DiscoveredPage>();
  for (const entry of asRecords(parsed.urlset.url)) {
    const url = canonicalDocsUrl(entry.loc);
    if (url === null || pages.has(url.href)) continue;

    pages.set(url.href, {
      url,
      lastmod:
        typeof entry.lastmod === "string" && entry.lastmod.length > 0
          ? entry.lastmod
          : null,
    });
  }

  return [...pages.values()].sort((left, right) => {
    if (left.url.pathname === "/docs") return -1;
    if (right.url.pathname === "/docs") return 1;
    if (left.url.href < right.url.href) return -1;
    if (left.url.href > right.url.href) return 1;
    return 0;
  });
};

export const discoverDocs = async (
  client: TextClient,
  origin = new URL(SOURCE_ORIGIN),
): Promise<DiscoveryResult> => {
  if (origin.origin !== SOURCE_ORIGIN) {
    throw new Error(`Discovery origin must be ${SOURCE_ORIGIN}`);
  }

  const robotsText = await client.text(new URL("/robots.txt", origin));
  const sitemapXml = await client.text(new URL("/sitemap.xml", origin));

  return { robotsText, pages: parseSitemap(sitemapXml) };
};

export const canMirrorAsset = (robotsText: string, url: URL) =>
  robotsParser(new URL("/robots.txt", url).href, robotsText).isAllowed(
    url.href,
    MIRROR_USER_AGENT,
  ) !== false;
