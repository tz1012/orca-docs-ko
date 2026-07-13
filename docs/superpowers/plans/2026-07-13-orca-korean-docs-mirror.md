# ORCA Korean Documentation Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox - [ ] syntax for tracking.

**Goal:** Build and publish a complete unofficial Korean mirror of https://www.onorca.dev/docs that incrementally synchronizes on weekdays at 10:00 Asia/Seoul.

**Architecture:** A TypeScript pipeline discovers source pages from the sitemap, extracts stable translatable segments, mirrors allowed images, and creates translation jobs for the local Codex agent. Validated Korean translations render into an Astro Starlight site; GitHub Actions deploys verified main-branch commits to GitHub Pages.

**Tech Stack:** Node.js 24, pnpm 11, TypeScript 6, Astro 7, Starlight 0.41, Cheerio, Turndown GFM, fast-xml-parser, robots-parser, Zod 4, Vitest 4, GitHub Actions, GitHub Pages, Codex local automations.

## Global Constraints

- Source scope is every sitemap URL whose pathname is /docs or starts with /docs/.
- Schedule is Monday through Friday at 10:00 in Asia/Seoul.
- Public repository is tz1012/orca-docs-ko; main is the default and deployment branch.
- Verified changes push directly to main; failed and no-change runs do not commit.
- Korean prose uses the 합니다 style.
- Product names, code, commands, flags, paths, environment variables, and URLs remain unchanged.
- English UI labels retain the literal label as inline code followed by a Korean explanation.
- Image bytes are never edited; robots-disallowed GIFs remain remote.
- Every page shows the unofficial notice, source URL, checked time, and upstream attribution.
- Source HTML, credentials, and tokens are never committed.

## File Map

- package.json, astro.config.mjs, src/content.config.ts: application and Starlight configuration.
- scripts/mirror/model.ts, hash.ts: schemas, types, normalization, and hashing.
- scripts/mirror/http.ts, discover.ts: bounded HTTP, robots, and sitemap discovery.
- scripts/mirror/protect.ts, extract.ts: semantic extraction and immutable token protection.
- scripts/mirror/state.ts, assets.ts: incremental state, safe removals, and image mirroring.
- scripts/mirror/jobs.ts, render.ts: translation jobs, validation, and Korean Markdown output.
- scripts/mirror/prepare.ts, apply.ts, check.ts: three command-line workflow phases.
- mirror/source-manifest.json, mirror/translations/, mirror/sidebar.json: committed mirror state.
- src/content/docs/, public/assets/mirror/: generated site content.
- tests/fixtures/, tests/mirror/: deterministic fixtures and Vitest coverage.
- .github/workflows/test.yml, deploy.yml: validation and GitHub Pages deployment.

---

### Task 1: Bootstrap the Tested Starlight Site

**Files:**
- Create: package.json
- Create: pnpm-workspace.yaml
- Create: tsconfig.json
- Create: astro.config.mjs
- Create: src/content.config.ts
- Create: src/content/docs/index.md
- Create: src/styles/custom.css
- Create: mirror/sidebar.json
- Create: tests/site-config.test.ts
- Create: .gitignore

**Interfaces:**
- Consumes: none.
- Produces: pnpm test, pnpm check, pnpm build, pnpm mirror:prepare, pnpm mirror:apply, and pnpm mirror:check.

- [ ] **Step 1: Write the failing configuration test**

~~~ts
import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("uses the Korean project Pages URL", async () => {
  const source = await readFile("astro.config.mjs", "utf8");
  expect(source).toContain("https://tz1012.github.io");
  expect(source).toContain('base: "/orca-docs-ko"');
  expect(source).toContain('lang: "ko"');
});
~~~

- [ ] **Step 2: Verify the test fails**

Run: pnpm exec vitest run tests/site-config.test.ts

Expected: FAIL because package.json and astro.config.mjs do not exist.

- [ ] **Step 3: Create package.json and site configuration**

~~~json
{
  "name": "orca-docs-ko",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.7.0",
  "engines": { "node": ">=24.0.0", "pnpm": ">=11.0.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "check": "astro check && tsc --noEmit",
    "test": "vitest run",
    "mirror:prepare": "tsx scripts/mirror/prepare.ts",
    "mirror:apply": "tsx scripts/mirror/apply.ts",
    "mirror:check": "tsx scripts/mirror/check.ts"
  },
  "dependencies": {
    "@astrojs/starlight": "0.41.3",
    "astro": "7.0.7",
    "cheerio": "1.2.0",
    "fast-xml-parser": "5.10.0",
    "robots-parser": "3.0.1",
    "turndown": "7.2.4",
    "turndown-plugin-gfm": "1.0.2",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.9",
    "@types/node": "24.13.3",
    "@types/turndown": "5.0.6",
    "tsx": "4.23.0",
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  }
}
~~~

~~~js
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sidebar from "./mirror/sidebar.json" with { type: "json" };

export default defineConfig({
  site: "https://tz1012.github.io",
  base: "/orca-docs-ko",
  integrations: [starlight({
    title: "ORCA 한국어 문서",
    defaultLocale: "ko",
    locales: { ko: { label: "한국어", lang: "ko" } },
    sidebar,
    customCss: ["./src/styles/custom.css"]
  })]
});
~~~

Create the Starlight content loader in src/content.config.ts, an empty JSON array in mirror/sidebar.json, a Korean landing page with the approved notice, strict Astro TypeScript config, an empty pnpm workspace, and ignores for node_modules, dist, .astro, .mirror, and coverage.

- [ ] **Step 4: Install, test, and build**

Run: pnpm install && pnpm test && pnpm check && pnpm build

Expected: all commands exit 0 and dist/ contains the static site.

- [ ] **Step 5: Commit**

~~~powershell
git add package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json astro.config.mjs src mirror/sidebar.json tests/site-config.test.ts .gitignore
git commit -m "feat: bootstrap Korean ORCA docs site"
~~~

### Task 2: Define Contracts and Stable Hashes

**Files:**
- Create: scripts/mirror/model.ts
- Create: scripts/mirror/hash.ts
- Create: tests/mirror/model.test.ts
- Create: tests/support/factories.ts
- Create: mirror/source-manifest.json
- Create: mirror/translations/.gitkeep

**Interfaces:**
- Consumes: Node crypto and Zod.
- Produces: normalizeText(value), sha256(value), SourceSegmentSchema, SourcePageSchema, SourceManifestSchema, TranslationFileSchema, and their inferred types.

- [ ] **Step 1: Write failing contract tests**

~~~ts
import { expect, test } from "vitest";
import { normalizeText, sha256 } from "../../scripts/mirror/hash.js";
import { SourceSegmentSchema } from "../../scripts/mirror/model.js";

test("normalizes before hashing", () => {
  expect(sha256(normalizeText("A\\r\\n  B"))).toBe(sha256("A\\n B"));
});

test("requires a SHA-256 source hash", () => {
  expect(() => SourceSegmentSchema.parse({
    id: "install:p:0", kind: "paragraph", source: "Install.", protected: {}
  })).toThrow();
});
~~~

- [ ] **Step 2: Verify the tests fail**

Run: pnpm exec vitest run tests/mirror/model.test.ts

Expected: FAIL with module-not-found errors.

- [ ] **Step 3: Implement canonical hashing and schemas**

~~~ts
// scripts/mirror/hash.ts
import { createHash } from "node:crypto";
export const normalizeText = (value: string) =>
  value.replace(/\\r\\n?/g, "\\n").replace(/[ \\t]+/g, " ").trim();
export const sha256 = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
~~~

In model.ts define:

- SourceSegment: id, kind, source, 64-character sourceHash, and protected string map.
- NavigationGroup: source English label plus the ordered source URLs contained in that group.
- SourcePage: sourceUrl, mirrorPath, titleSegmentId, pageHash, checkedAt, sitemapLastmod, segments, images, navigationGroups, previousSourceUrl, and nextSourceUrl.
- ManifestPage: the same identity fields plus translatedAt, missingRuns, active/pending-removal/redirect status, redirectTo, segment hash map, and image state.
- SourceManifest: schemaVersion 1, generatedAt, and pages keyed by mirror path.
- TranslationFile: sourceUrl, mirrorPath, and entries keyed by segment ID with sourceHash and non-empty translated text.

Use z.url(), z.iso.datetime(), literal schemaVersion 1, and strict enums. Initialize source-manifest.json with the Unix epoch and no pages. tests/support/factories.ts must export NOW, NEXT_DAY, PNG, manifestFixture, pageFixture, segmentFixture, translationFixture, binaryClient, and fixtureWorkspace. Each factory returns schema-valid defaults and accepts the explicit overrides used by later tests.

- [ ] **Step 4: Run tests and type checking**

Run: pnpm exec vitest run tests/mirror/model.test.ts && pnpm check

Expected: PASS.

- [ ] **Step 5: Commit**

~~~powershell
git add scripts/mirror/model.ts scripts/mirror/hash.ts tests mirror/source-manifest.json mirror/translations
git commit -m "feat: define mirror data contracts"
~~~

### Task 3: Discover Docs and Enforce Robots Policy

**Files:**
- Create: scripts/mirror/http.ts
- Create: scripts/mirror/discover.ts
- Create: tests/mirror/discover.test.ts
- Create: tests/fixtures/sitemap.xml
- Create: tests/fixtures/robots.txt

**Interfaces:**
- Consumes: Fetch API.
- Produces: HttpClient.text(url), HttpClient.bytes(url), discoverDocs(client, origin), and canMirrorAsset(robotsText, url).

- [ ] **Step 1: Write failing discovery tests**

~~~ts
import { expect, test } from "vitest";
import { canMirrorAsset, discoverDocs } from "../../scripts/mirror/discover.js";

const sitemap = "<?xml version=\\"1.0\\"?><urlset>" +
  "<url><loc>https://www.onorca.dev/docs</loc></url>" +
  "<url><loc>https://www.onorca.dev/docs/install</loc></url>" +
  "<url><loc>https://www.onorca.dev/changelog</loc></url></urlset>";

test("keeps canonical docs URLs only", async () => {
  const client = { text: async (url: URL) =>
    url.pathname === "/robots.txt" ? "User-agent: *\\nDisallow: /docs/*.gif" : sitemap };
  const result = await discoverDocs(client);
  expect(result.pages.map((item) => item.url.pathname)).toEqual(["/docs", "/docs/install"]);
});

test("does not mirror disallowed GIFs", () => {
  const robots = "User-agent: *\\nDisallow: /docs/*.gif";
  expect(canMirrorAsset(robots, new URL("https://www.onorca.dev/docs/demo.gif"))).toBe(false);
});
~~~

- [ ] **Step 2: Verify the tests fail**

Run: pnpm exec vitest run tests/mirror/discover.test.ts

Expected: FAIL because discover.ts is absent.

- [ ] **Step 3: Implement bounded network access**

Production requests use user-agent orca-docs-ko-mirror/1.0, a 20-second AbortSignal timeout, at most three attempts for 408/429/5xx, waits of 500 ms then 1500 ms, a 10 MiB body ceiling, and hard failure for non-2xx status. discoverDocs parses sitemap XML, strips queries/fragments, restricts host to www.onorca.dev, keeps /docs and /docs/ descendants, preserves lastmod, deduplicates, and sorts /docs first. canMirrorAsset uses robots-parser with the mirror user-agent and returns false only for an explicit denial.

- [ ] **Step 4: Test and commit**

Run: pnpm exec vitest run tests/mirror/discover.test.ts

Expected: PASS.

~~~powershell
git add scripts/mirror/http.ts scripts/mirror/discover.ts tests/mirror/discover.test.ts tests/fixtures
git commit -m "feat: discover upstream documentation"
~~~

### Task 4: Extract and Protect Semantic Content

**Files:**
- Create: scripts/mirror/protect.ts
- Create: scripts/mirror/extract.ts
- Create: tests/mirror/extract.test.ts
- Create: tests/fixtures/docs-page.html

**Interfaces:**
- Consumes: SourcePage, SourceSegment, normalizeText, and sha256.
- Produces: protectMarkdown(markdown), restoreProtected(markdown, map), and extractPage(input).

- [ ] **Step 1: Write failing extraction tests**

~~~ts
import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { extractPage } from "../../scripts/mirror/extract.js";

test("extracts tables, commands, images, and navigation", async () => {
  const html = await readFile("tests/fixtures/docs-page.html", "utf8");
  const page = extractPage({
    html,
    sourceUrl: new URL("https://www.onorca.dev/docs/install"),
    checkedAt: "2026-07-13T01:00:00.000Z",
    sitemapLastmod: "2026-07-12"
  });
  expect(page.mirrorPath).toBe("/docs/install/");
  expect(page.segments.some((item) => item.kind === "table")).toBe(true);
  expect(page.segments.flatMap((item) => Object.values(item.protected))).toContain("orca open");
  expect(page.images[0]?.sourceUrl).toBe("https://www.onorca.dev/docs/install.png");
});
~~~

- [ ] **Step 2: Verify the tests fail**

Run: pnpm exec vitest run tests/mirror/extract.test.ts

Expected: FAIL because extract.ts is absent.

- [ ] **Step 3: Implement protection and extraction**

protectMarkdown replaces fenced code, inline code, link destinations, absolute URLs, and command blocks with deterministic tokens ORCA_PROTECTED_0001 onward. restoreProtected requires each expected token exactly once and rejects missing, duplicate, or unknown protected tokens.

extractPage selects main article, article, then main; removes scripts, styles, hidden nodes, headers, and footers; requires an h1; converts top-level headings, paragraphs, lists, tables, preformatted blocks, blockquotes, asides, figures, and standalone images with Turndown GFM. Each segment ID combines mirror path, kind, source anchor, and occurrence. Resolve links/images against sourceUrl, extract rel=previous/next with visible-label fallback, and capture ordered sidebar group labels and /docs URLs into navigationGroups. Throw on missing article, missing h1, duplicate IDs, or empty output.

- [ ] **Step 4: Test and commit**

Run: pnpm exec vitest run tests/mirror/extract.test.ts tests/mirror/model.test.ts

Expected: PASS.

~~~powershell
git add scripts/mirror/protect.ts scripts/mirror/extract.ts tests/mirror/extract.test.ts tests/fixtures/docs-page.html
git commit -m "feat: extract protected documentation segments"
~~~

### Task 5: Plan Incremental State and Mirror Images

**Files:**
- Create: scripts/mirror/state.ts
- Create: scripts/mirror/assets.ts
- Create: tests/mirror/state.test.ts
- Create: tests/mirror/assets.test.ts
- Create: tests/fixtures/image.png

**Interfaces:**
- Consumes: SourceManifest, SourcePage, HttpClient.bytes, canMirrorAsset, and sha256.
- Produces: planChanges(manifest, pages, now), promoteManifest(manifest, plan, translatedAt), and mirrorAssets(page, robotsText, client, outputRoot).

- [ ] **Step 1: Write failing state and asset tests**

~~~ts
test("removes only after two missing runs", () => {
  const first = planChanges(manifestFixture({ "/docs/old/": { missingRuns: 0 } }), [], NOW);
  expect(first.pendingRemoval).toEqual(["/docs/old/"]);
  const second = planChanges(first.nextManifest, [], NEXT_DAY);
  expect(second.remove).toEqual(["/docs/old/"]);
});

test("stores allowed images by content hash", async () => {
  const result = await mirrorAssets(pageFixture(), "User-agent: *\\nAllow: /", binaryClient(PNG), "public/assets/mirror");
  expect(result.images[0]?.localPath).toMatch(/^\\/assets\\/mirror\\/[a-f0-9]{64}\\.png$/);
});
~~~

- [ ] **Step 2: Verify the tests fail**

Run: pnpm exec vitest run tests/mirror/state.test.ts tests/mirror/assets.test.ts

Expected: FAIL because state.ts and assets.ts are absent.

- [ ] **Step 3: Implement deterministic changes and assets**

~~~ts
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
~~~

Compare segment hashes, reset observed missingRuns to zero, mark the first absence pending-removal, and remove on the second consecutive absence. Sort every list. Download allowed images without transformation, reject bodies above 25 MiB, derive the extension from validated content-type, write content-addressed files atomically, and reuse an existing matching hash. For denied assets set robotsRemote true, localPath null, and retain sourceUrl.

- [ ] **Step 4: Test and commit**

Run: pnpm exec vitest run tests/mirror/state.test.ts tests/mirror/assets.test.ts

Expected: PASS.

~~~powershell
git add scripts/mirror/state.ts scripts/mirror/assets.ts tests/mirror tests/fixtures/image.png
git commit -m "feat: track changes and mirror allowed images"
~~~

### Task 6: Create and Validate Translation Jobs

**Files:**
- Create: scripts/mirror/jobs.ts
- Create: tests/mirror/jobs.test.ts
- Create: mirror/translations/README.md

**Interfaces:**
- Consumes: ChangePlan, TranslationFileSchema, and restoreProtected.
- Produces: writeTranslationJobs(plan, jobRoot), validateTranslation(page, file), KoreanCoverageError, and the command pnpm exec tsx scripts/mirror/jobs.ts validate-ready.

- [ ] **Step 1: Write failing job-validation tests**

~~~ts
test("rejects changed or missing protected tokens", () => {
  const page = pageFixture({ segments: [segmentFixture({
    id: "install:p:0",
    source: "Run ORCA_PROTECTED_0001.",
    protected: { ORCA_PROTECTED_0001: "orca open" }
  })] });
  const file = translationFixture({ "install:p:0": {
    sourceHash: page.segments[0].sourceHash,
    translated: "실행합니다."
  }});
  expect(() => validateTranslation(page, file)).toThrow(/ORCA_PROTECTED_0001/);
});
~~~

- [ ] **Step 2: Verify the test fails**

Run: pnpm exec vitest run tests/mirror/jobs.test.ts

Expected: FAIL because jobs.ts is absent.

- [ ] **Step 3: Implement jobs and validation**

Each ignored job file contains sourceUrl, mirrorPath, translation rules in Korean, and only segments selected by ChangePlan. Validation requires matching sourceUrl/path/hash, one output per requested segment, exact protected-token multiplicity, no unknown token, non-empty output, preserved fenced-code count, and Korean characters in prose segments longer than 20 characters. Code-only and image-only segments are exempt from Korean coverage. The validate-ready CLI validates every translation file currently present for a live job, reports remaining job paths separately, and exits nonzero only for malformed completed translations.

mirror/translations/README.md documents the committed JSON shape and states that sourceHash invalidates stale translations.

- [ ] **Step 4: Test and commit**

Run: pnpm exec vitest run tests/mirror/jobs.test.ts

Expected: PASS.

~~~powershell
git add scripts/mirror/jobs.ts tests/mirror/jobs.test.ts mirror/translations/README.md
git commit -m "feat: generate validated translation jobs"
~~~

### Task 7: Render Korean Pages, Sidebar, and Notices

**Files:**
- Create: scripts/mirror/render.ts
- Create: src/components/TranslationNotice.astro
- Modify: astro.config.mjs
- Modify: src/styles/custom.css
- Create: tests/mirror/render.test.ts

**Interfaces:**
- Consumes: active SourcePage records, validated TranslationFile records, restoreProtected, and mirrored image paths.
- Produces: renderPage(page, translation), buildSidebar(pages), and generated src/content/docs plus mirror/sidebar.json.

- [ ] **Step 1: Write the failing rendering test**

~~~ts
test("renders notice metadata and rewrites internal links", () => {
  const markdown = renderPage(pageFixture(), translationFixture());
  expect(markdown).toContain("비공식 한국어 번역");
  expect(markdown).toContain("sourceUrl: https://www.onorca.dev/docs/install");
  expect(markdown).toContain("/orca-docs-ko/docs/first-session/");
  expect(markdown).toContain("Lovecast Inc.");
});
~~~

- [ ] **Step 2: Verify the test fails**

Run: pnpm exec vitest run tests/mirror/render.test.ts

Expected: FAIL because render.ts is absent.

- [ ] **Step 3: Implement deterministic output**

Generate frontmatter with Korean title, sourceUrl, checkedAt, editUrl false, previous/next links, and TranslationNotice component data. Restore protected values only after translation validation. Rewrite onorca /docs links to base-aware mirror links; leave all other hosts unchanged. Replace allowed image URLs with local content-addressed paths and denied images with original URLs. buildSidebar follows the source navigation order extracted from /docs, uses translated group labels, and appends an uncategorized group only when a discovered page was absent from source navigation.

TranslationNotice.astro renders:

~~~astro
<aside class="translation-notice" aria-label="번역 안내">
  <strong>비공식 한국어 번역</strong>
  <p>이 문서는 ORCA 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 원문이 우선합니다.</p>
  <p><a href={sourceUrl}>원문 보기</a> · 마지막 확인: <time datetime={checkedAt}>{checkedAt}</time></p>
  <small>원본 문서와 이미지의 권리는 Lovecast Inc. 및 각 권리자에게 있습니다.</small>
</aside>
~~~

- [ ] **Step 4: Test, type-check, and commit**

Run: pnpm exec vitest run tests/mirror/render.test.ts && pnpm check

Expected: PASS.

~~~powershell
git add scripts/mirror/render.ts src astro.config.mjs tests/mirror/render.test.ts
git commit -m "feat: render attributed Korean documentation"
~~~

### Task 8: Orchestrate, Validate, and Test the Full Sync

**Files:**
- Create: scripts/mirror/prepare.ts
- Create: scripts/mirror/apply.ts
- Create: scripts/mirror/check.ts
- Create: tests/mirror/integration.test.ts
- Create: README.md

**Interfaces:**
- Consumes: every Task 2-7 interface.
- Produces: prepareMirror(config), applyMirror(config), checkMirror(config), and stable prepare/apply/check commands with JSON summaries and exit codes 0 for success/no-change and 1 for failure.

- [ ] **Step 1: Write the failing integration test**

~~~ts
test("does not promote partial or invalid output", async () => {
  const workspace = await fixtureWorkspace();
  const prepared = await prepareMirror(workspace.config);
  expect(prepared.jobs).toHaveLength(2);
  await expect(applyMirror(workspace.config)).rejects.toThrow(/translation/i);
  expect(await workspace.readManifest()).toEqual(workspace.originalManifest);
});
~~~

- [ ] **Step 2: Verify the integration test fails**

Run: pnpm exec vitest run tests/mirror/integration.test.ts

Expected: FAIL because orchestration modules are absent.

- [ ] **Step 3: Implement atomic workflow phases**

prepare fetches robots/sitemap/pages, rejects an empty sitemap or more than 20 percent page-fetch failure, extracts pages, mirrors images, computes state, and writes ignored staging/jobs atomically. apply validates every required translation, renders to a temporary site tree, runs completeness checks, then atomically promotes content, sidebar, translations, and manifest. check verifies active-page/current-sitemap equality plus separate pending removals, protected code hashes, all internal links, local assets, remote exception status, notice metadata, Korean coverage, and pnpm build.

Both commands print one JSON object with counts for discovered, added, updated, unchanged, pendingRemoval, removed, translatedSegments, localImages, and remoteImages. README includes purpose, unofficial status, source attribution, local commands, initial sync, weekday automation behavior, failure policy, Pages URL, and troubleshooting.

- [ ] **Step 4: Run the complete local quality gate**

Run: pnpm test && pnpm check && pnpm build

Expected: PASS with no warnings that indicate missing pages, links, or assets.

- [ ] **Step 5: Commit**

~~~powershell
git add scripts/mirror tests/mirror README.md
git commit -m "feat: orchestrate verified mirror synchronization"
~~~

### Task 9: Perform and Review the Initial Full Translation

**Files:**
- Create: mirror/translations/**/*.json
- Create: src/content/docs/**/*.md
- Modify: mirror/source-manifest.json
- Modify: mirror/sidebar.json
- Create: public/assets/mirror/*

**Interfaces:**
- Consumes: pnpm mirror:prepare, job JSON files, and pnpm mirror:apply.
- Produces: a complete verified Korean snapshot of every current /docs page.

- [ ] **Step 1: Prepare the live source snapshot**

Run: pnpm mirror:prepare

Expected: exit 0; JSON reports the current nonzero docs-page count and creates one or more .mirror/jobs files.

- [ ] **Step 2: Translate every generated job**

For each job, write the corresponding mirror/translations JSON. Translate all prose in 합니다 style, preserve every ORCA_PROTECTED token exactly once, retain product names, and render literal English UI labels as inline code followed by Korean in parentheses. Do not edit image bytes or code. Process jobs in lexical path order and run pnpm exec tsx scripts/mirror/jobs.ts validate-ready after each batch of at most ten pages so malformed completed output is detected before continuing.

- [ ] **Step 3: Apply and validate the complete snapshot**

Run: pnpm mirror:apply && pnpm mirror:check && pnpm test && pnpm check && pnpm build

Expected: all commands exit 0; active generated page count equals current sitemap /docs count; no required job remains.

- [ ] **Step 4: Visually inspect representative pages**

Run: pnpm dev --host 127.0.0.1

Inspect the landing page, a page with a table, a page with code, a page with an image, previous/next navigation, sidebar search, and a robots-remote GIF. Confirm Korean prose, unchanged code/images, base-aware links, notice, and mobile layout.

- [ ] **Step 5: Commit the initial mirror**

~~~powershell
git add mirror src/content/docs public/assets/mirror
git commit -m "content: publish initial Korean documentation mirror"
~~~

### Task 10: Add GitHub Validation and Pages Deployment

**Files:**
- Create: .github/workflows/test.yml
- Create: .github/workflows/deploy.yml

**Interfaces:**
- Consumes: pnpm lockfile and build commands.
- Produces: required validation on pushes/PRs and Pages deployment after a successful main build.

- [ ] **Step 1: Add the validation workflow**

Use actions/checkout@v7, pnpm/action-setup@v6 with version 11.7.0, and actions/setup-node@v6 with Node 24 and pnpm cache. Run pnpm install --frozen-lockfile, pnpm test, pnpm check, pnpm mirror:check, and pnpm build on pull requests and main pushes.

- [ ] **Step 2: Add the Pages workflow**

~~~yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
        with:
          node-version: 24
          package-manager: pnpm@11.7.0
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
~~~

- [ ] **Step 3: Validate workflow syntax and local build**

Run: pnpm test && pnpm check && pnpm build

Expected: PASS; both workflow files parse as YAML and reference pinned major action versions.

- [ ] **Step 4: Commit**

~~~powershell
git add .github/workflows
git commit -m "ci: validate and deploy documentation mirror"
~~~

### Task 11: Publish the Repository and Verify GitHub Pages

**Files:**
- Modify: Git remote configuration only.

**Interfaces:**
- Consumes: authenticated gh CLI account tz1012.
- Produces: public GitHub repository, main branch, workflow-based Pages configuration, and live site URL.

- [ ] **Step 1: Create and push the public repository**

Run: gh repo create tz1012/orca-docs-ko --public --source . --remote origin --push

Expected: repository URL is https://github.com/tz1012/orca-docs-ko and origin/main tracks main.

- [ ] **Step 2: Configure Pages for GitHub Actions**

Run: gh api repos/tz1012/orca-docs-ko/pages -X POST -f build_type=workflow

Expected: HTTP 201, or HTTP 409 only when Pages is already configured with build_type workflow.

- [ ] **Step 3: Wait for and inspect both workflows**

Run: gh run list --repo tz1012/orca-docs-ko --branch main --limit 5

Expected: validation and Pages deployment conclude successfully.

- [ ] **Step 4: Verify the published site**

Open https://tz1012.github.io/orca-docs-ko/ and verify HTTP 200, Korean title, sidebar, search assets, notice, representative links, and images.

### Task 12: Create the Weekday Codex Automation and Prove a No-Change Run

**Files:**
- No repository file changes unless the live source changed during the test.

**Interfaces:**
- Consumes: published local project and Codex app automation service.
- Produces: enabled local automation named ORCA 문서 한국어 미러 동기화 scheduled weekdays at 10:00 Asia/Seoul.

- [ ] **Step 1: Register or resolve the project**

Use the Codex app project list to resolve D:\AI\ORCA_translator after it is a Git repository. If absent, add this folder as the local project using the app-supported project workflow, then resolve its project ID.

- [ ] **Step 2: Create the automation with this exact prompt**

~~~text
tz1012/orca-docs-ko의 ORCA 한국어 문서 미러를 동기화한다.
1. main을 fast-forward로 갱신하고 작업 트리가 깨끗한지 확인한다.
2. pnpm install --frozen-lockfile 후 pnpm mirror:prepare를 실행한다.
3. .mirror/jobs의 모든 변경 세그먼트를 자연스러운 한국어 기술 문서형 합니다 문체로 번역해 mirror/translations에 반영한다.
4. ORCA_PROTECTED 토큰, 코드, 명령어, 플래그, 경로, URL, 제품명과 이미지 바이트를 변경하지 않는다. 영문 UI 라벨은 인라인 코드 원문 뒤에 한국어 설명을 괄호로 쓴다.
5. pnpm mirror:apply, pnpm mirror:check, pnpm test, pnpm check, pnpm build를 순서대로 실행한다.
6. 하나라도 실패하면 커밋하거나 푸시하지 말고 실패 원인과 URL을 실행 결과에 남긴다.
7. 변경이 없으면 커밋하지 않고 변경 없음으로 종료한다.
8. 변경이 있고 모든 검증이 성공하면 변경 요약과 페이지 수를 확인하고 main에 sync: update Korean ORCA docs YYYY-MM-DD 형식으로 커밋해 origin main으로 푸시한다.
~~~

Create it as a local recurring automation for Monday-Friday 10:00 Asia/Seoul, enabled, using the current default Codex model and local project environment. Do not store a GitHub or OpenAI token in the prompt.

- [ ] **Step 3: Run the automation manually**

Expected: the run succeeds; if upstream has not changed, it reports no change and creates no commit. If upstream changed, it translates only changed segments, passes all five gates, pushes one commit, and triggers Pages deployment.

- [ ] **Step 4: Verify schedule and repository state**

Confirm the automation is enabled for weekdays at 10:00 Asia/Seoul, git status is clean, no credential-like string exists in tracked files, and the latest Pages run is successful.

## Final Verification

Run:

~~~powershell
pnpm test
pnpm check
pnpm mirror:check
pnpm build
git status --short
gh run list --repo tz1012/orca-docs-ko --branch main --limit 5
~~~

Expected: all commands succeed, git status is empty, validation and deployment are green, and https://tz1012.github.io/orca-docs-ko/ serves the complete Korean mirror.
