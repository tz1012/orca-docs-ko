import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import { extractPage } from "../../scripts/mirror/extract.js";
import {
  protectMarkdown,
  restoreProtected,
} from "../../scripts/mirror/protect.js";
import { SourcePageSchema } from "../../scripts/mirror/model.js";

const input = (html: string) => ({
  html,
  sourceUrl: new URL("https://www.onorca.dev/docs/install"),
  checkedAt: "2026-07-13T01:00:00.000Z",
  sitemapLastmod: "2026-07-12",
});

describe("Markdown protection", () => {
  test("protects code and URLs with deterministic tokens and restores losslessly", () => {
    const source = [
      "Run `orca open` and visit https://www.onorca.dev/docs/install.",
      "Read [the guide](https://www.onorca.dev/docs/first-session).",
      "",
      "```shell",
      "orca open --cwd /tmp/project",
      "```",
      "",
      "    orca status",
    ].join("\n");

    const result = protectMarkdown(source);

    expect(result.markdown).toContain("`ORCA_PROTECTED_0001`");
    expect(result.map).toEqual({
      ORCA_PROTECTED_0001: "orca open",
      ORCA_PROTECTED_0002: "https://www.onorca.dev/docs/install",
      ORCA_PROTECTED_0003: "https://www.onorca.dev/docs/first-session",
      ORCA_PROTECTED_0004: "orca open --cwd /tmp/project",
      ORCA_PROTECTED_0005: "orca status",
    });
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test("protects balanced URLs and inline code containing backticks as whole values", () => {
    const source =
      "Use `` orca `open` `` at https://www.onorca.dev/docs/a_(b).";

    const result = protectMarkdown(source);

    expect(Object.values(result.map)).toEqual([
      " orca `open` ",
      "https://www.onorca.dev/docs/a_(b)",
    ]);
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test("protects the reviewer prose probe as separate semantic literals", () => {
    const source = "Install ORCA with --cwd /tmp/project and ORCA_HOME.";

    const result = protectMarkdown(source);

    expect(Object.values(result.map)).toEqual([
      "ORCA",
      "--cwd",
      "/tmp/project",
      "ORCA_HOME",
    ]);
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test("protects ecosystem names, commands, flags, and cross-platform paths", () => {
    const source = [
      "Use Orca, Codex, Claude Code, Cursor CLI, OpenCode, and GitHub Copilot.",
      "Run orca open with --profile=release from C:\\Users\\orca\\project, ~/.config/orca, ./config/orca.json, ../shared, src/docs.md, and PATH.",
    ].join("\n");

    const result = protectMarkdown(source);

    expect(Object.values(result.map)).toEqual([
      "Orca",
      "Codex",
      "Claude Code",
      "Cursor CLI",
      "OpenCode",
      "GitHub Copilot",
      "orca open",
      "--profile=release",
      "C:\\Users\\orca\\project",
      "~/.config/orca",
      "./config/orca.json",
      "../shared",
      "src/docs.md",
      "PATH",
    ]);
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test("protects valid longer closing fences with independent indentation", () => {
    const source = [
      "   ````shell",
      "orca open",
      "  `````",
      "",
      "~~~text",
      "```",
      "a marker",
      " ~~~~",
    ].join("\n");

    const result = protectMarkdown(source);

    expect(Object.values(result.map)).toEqual(["orca open", "```\na marker"]);
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test("protects code indented by extra spaces and mixed tab whitespace", () => {
    const source = "      orca open\n\t  orca status";

    const result = protectMarkdown(source);

    expect(Object.values(result.map)).toEqual(["orca open", "orca status"]);
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test("protects bracketed IPv6 URLs without losing balanced parentheses", () => {
    const source = "Visit http://[::1]/docs and https://[2001:db8::1]/a_(b).";

    const result = protectMarkdown(source);

    expect(Object.values(result.map)).toEqual([
      "http://[::1]/docs",
      "https://[2001:db8::1]/a_(b)",
    ]);
    expect(restoreProtected(result.markdown, result.map)).toBe(source);
  });

  test.each([
    [
      "missing",
      "Translated without the token",
      { ORCA_PROTECTED_0001: "orca open" },
    ],
    [
      "duplicate",
      "ORCA_PROTECTED_0001 ORCA_PROTECTED_0001",
      { ORCA_PROTECTED_0001: "orca open" },
    ],
    ["unknown", "ORCA_PROTECTED_9999", {}],
  ])("rejects a %s protected token", (_case, markdown, map) => {
    expect(() => restoreProtected(markdown, map)).toThrow(/protected token/i);
  });
});

describe("semantic page extraction", () => {
  test("extracts protected semantic blocks, images, and ordered navigation", async () => {
    const html = await readFile(
      new URL("../fixtures/docs-page.html", import.meta.url),
      "utf8",
    );
    const page = extractPage(input(html));

    expect(SourcePageSchema.parse(page)).toEqual(page);
    expect(page.mirrorPath).toBe("/docs/install/");
    expect(page.segments.map((segment) => segment.kind)).toEqual([
      "heading",
      "paragraph",
      "list",
      "heading",
      "table",
      "code",
      "blockquote",
      "aside",
      "figure",
      "image",
    ]);
    expect(page.segments[0]?.source).toBe("# Install ORCA_PROTECTED_0001");
    expect(page.segments[0]?.protected).toEqual({
      ORCA_PROTECTED_0001: "ORCA",
    });
    expect(page.segments.map((segment) => segment.id)).toEqual(
      expect.arrayContaining([
        "/docs/install/:heading:install:0",
        "/docs/install/:table:requirements:0",
      ]),
    );
    expect(new Set(page.segments.map((segment) => segment.id)).size).toBe(
      page.segments.length,
    );
    expect(
      page.segments.flatMap((segment) => Object.values(segment.protected)),
    ).toContain("orca open");
    expect(
      page.segments.map((segment) => segment.source).join("\n"),
    ).not.toMatch(
      /Wrong fallback|hidden paragraph|Article chrome|Article footer/,
    );
    expect(page.images).toEqual([
      {
        sourceUrl: "https://www.onorca.dev/docs/install.png",
        localPath: null,
        contentHash: null,
        robotsRemote: false,
      },
      {
        sourceUrl: "https://www.onorca.dev/docs/install-success.png",
        localPath: null,
        contentHash: null,
        robotsRemote: false,
      },
    ]);
    expect(page.navigationGroups).toEqual([
      {
        sourceLabel: "Get started",
        sourceUrls: [
          "https://www.onorca.dev/docs/install",
          "https://www.onorca.dev/docs/first-session",
        ],
      },
      {
        sourceLabel: "Reference",
        sourceUrls: ["https://www.onorca.dev/docs/commands"],
      },
    ]);
    expect(page.previousSourceUrl).toBe(
      "https://www.onorca.dev/docs/introduction",
    );
    expect(page.nextSourceUrl).toBe(
      "https://www.onorca.dev/docs/first-session",
    );
  });

  test("uses article and main fallbacks in priority order", () => {
    const article = extractPage(
      input("<article><h1>Article fallback</h1><p>Text.</p></article>"),
    );
    const main = extractPage(
      input("<main><h1>Main fallback</h1><p>Text.</p></main>"),
    );

    expect(article.segments[0]?.source).toBe("# Article fallback");
    expect(main.segments[0]?.source).toBe("# Main fallback");
  });

  test("changes the segment hash when only protected command content changes", () => {
    const first = extractPage(
      input("<main><h1>Commands</h1><pre><code>orca open</code></pre></main>"),
    );
    const second = extractPage(
      input("<main><h1>Commands</h1><pre><code>orca close</code></pre></main>"),
    );
    const firstCode = first.segments.find((segment) => segment.kind === "code");
    const secondCode = second.segments.find(
      (segment) => segment.kind === "code",
    );

    expect(firstCode?.source).toBe(secondCode?.source);
    expect(firstCode?.sourceHash).not.toBe(secondCode?.sourceHash);
    expect(first.pageHash).not.toBe(second.pageHash);
  });

  test("ignores Next.js prose and uses an exact pagination control label", () => {
    const page = extractPage(
      input(`
        <main><h1>Install</h1><p><a href="/docs/nextjs">Next.js guide</a></p></main>
        <nav aria-label="Pagination">
          <a href="/docs/framework">Next.js guide</a>
          <a href="/docs/first-session">Next: First session →</a>
        </nav>
      `),
    );

    expect(page.nextSourceUrl).toBe(
      "https://www.onorca.dev/docs/first-session",
    );
  });

  test("accepts destination-and-arrow labels in ARIA pagination regions", () => {
    const page = extractPage(
      input(`
        <main><h1>Install</h1></main>
        <div aria-label="Pagination">
          <a href="/docs/first-session">First session →</a>
        </div>
      `),
    );

    expect(page.nextSourceUrl).toBe(
      "https://www.onorca.dev/docs/first-session",
    );
  });

  test("rejects missing articles, missing h1 headings, and empty output", () => {
    expect(() => extractPage(input("<div><h1>Detached</h1></div>"))).toThrow(
      /article/i,
    );
    expect(() => extractPage(input("<main><p>No title.</p></main>"))).toThrow(
      /h1/i,
    );
    expect(() =>
      extractPage(
        input(
          '<main><h1 id="empty"><span aria-hidden="true">Hidden</span></h1></main>',
        ),
      ),
    ).toThrow(/empty/i);
  });
});
