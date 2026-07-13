import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  KoreanCoverageError,
  validateReady,
  validateTranslation,
  writeTranslationJobs,
} from "../../scripts/mirror/jobs.js";
import {
  TranslationFileSchema,
  type SourcePage,
  type TranslationFile,
} from "../../scripts/mirror/model.js";
import { planChanges } from "../../scripts/mirror/state.js";
import {
  NOW,
  manifestFixture,
  pageFixture,
  segmentFixture,
  translationFixture,
} from "../support/factories.js";

const translationFor = (
  page: SourcePage,
  translated: Record<string, string>,
): TranslationFile =>
  TranslationFileSchema.parse({
    sourceUrl: page.sourceUrl,
    mirrorPath: page.mirrorPath,
    entries: Object.fromEntries(
      page.segments
        .filter((segment) => translated[segment.id] !== undefined)
        .map((segment) => [
          segment.id,
          {
            sourceHash: segment.sourceHash,
            translated: translated[segment.id],
          },
        ]),
    ),
  });

test("writes deterministic Korean translation jobs with only selected segments", async () => {
  const root = await mkdtemp(join(tmpdir(), "orca-jobs-"));
  const page = pageFixture();
  const plan = planChanges(manifestFixture(), [page], NOW);
  plan.translationSegmentIds = ["install:p:0"];

  const paths = await writeTranslationJobs(plan, root);
  const jobPath = join(root, "install", "index.json");
  const job = JSON.parse(await readFile(jobPath, "utf8")) as {
    sourceUrl: string;
    mirrorPath: string;
    rules: string[];
    segments: Array<{ id: string }>;
  };

  expect(paths).toEqual([jobPath]);
  expect(job).toMatchObject({
    sourceUrl: page.sourceUrl,
    mirrorPath: page.mirrorPath,
  });
  expect(job.rules.join("\n")).toMatch(/[가-힣]/u);
  expect(job.segments.map(({ id }) => id)).toEqual(["install:p:0"]);
});

test("rejects a selected segment ID that is absent from the planned pages", async () => {
  const root = await mkdtemp(join(tmpdir(), "orca-jobs-"));
  const plan = planChanges(manifestFixture(), [pageFixture()], NOW);
  plan.translationSegmentIds = ["missing:p:0"];

  await expect(writeTranslationJobs(plan, root)).rejects.toThrow(
    /missing:p:0/,
  );
});

test("accepts a complete valid translation", () => {
  expect(validateTranslation(pageFixture(), translationFixture())).toEqual(
    translationFixture(),
  );
});

test.each([
  ["source URL", { sourceUrl: "https://www.onorca.dev/docs/other" }],
  ["mirror path", { mirrorPath: "/docs/other/" }],
])("rejects a mismatched %s", (_label, overrides) => {
  expect(() =>
    validateTranslation(
      pageFixture(),
      translationFixture(undefined, overrides),
    ),
  ).toThrow(/match/i);
});

test("rejects missing output and a stale source hash", () => {
  const page = pageFixture();
  const heading = translationFixture().entries["install:h1:0"]!;

  expect(() =>
    validateTranslation(
      page,
      translationFixture({ "install:h1:0": heading }),
    ),
  ).toThrow(/install:p:0/);

  expect(() =>
    validateTranslation(
      page,
      translationFixture({
        ...translationFixture().entries,
        "install:p:0": {
          ...translationFixture().entries["install:p:0"]!,
          sourceHash: "0".repeat(64),
        },
      }),
    ),
  ).toThrow(/hash/i);
});

test.each([
  ["missing", "실행합니다."],
  [
    "duplicate",
    "ORCA_PROTECTED_0001 ORCA_PROTECTED_0001 실행합니다.",
  ],
  [
    "unknown",
    "ORCA_PROTECTED_0001 ORCA_PROTECTED_9999 실행합니다.",
  ],
])("rejects a %s protected token", (_case, translated) => {
  const page = pageFixture({
    segments: [
      segmentFixture({
        id: "install:p:0",
        kind: "paragraph",
        source: "Run ORCA_PROTECTED_0001.",
        protected: { ORCA_PROTECTED_0001: "orca open" },
      }),
    ],
  });
  const file = translationFor(page, { "install:p:0": translated });

  expect(() => validateTranslation(page, file)).toThrow(/protected token/i);
});

test("rejects whitespace-only output even when called with unparsed data", () => {
  const file = {
    ...translationFixture(),
    entries: {
      ...translationFixture().entries,
      "install:h1:0": {
        ...translationFixture().entries["install:h1:0"]!,
        translated: " \t\n",
      },
    },
  } as TranslationFile;

  expect(() => validateTranslation(pageFixture(), file)).toThrow(/empty/i);
});

test("rejects changed fenced-code counts", () => {
  const segment = segmentFixture({
    id: "install:p:0",
    kind: "paragraph",
    source: "Before the example.\n\n```text\nvalue\n```\n\nAfter it.",
  });
  const page = pageFixture({ segments: [segment] });
  const file = translationFor(page, {
    "install:p:0": "예제 전입니다.\n\n```text\nvalue\n\n예제 후입니다.",
  });

  expect(() => validateTranslation(page, file)).toThrow(/fence/i);
});

test("requires Korean characters in long prose", () => {
  const segment = segmentFixture({
    id: "install:p:0",
    kind: "paragraph",
    source: "This prose source is definitely longer than twenty characters.",
  });
  const page = pageFixture({ segments: [segment] });
  const file = translationFor(page, {
    "install:p:0": "This output remains entirely in English.",
  });

  expect(() => validateTranslation(page, file)).toThrow(
    KoreanCoverageError,
  );
});

test("exempts code-only and image-only segments from Korean coverage", () => {
  const code = segmentFixture({
    id: "install:code:0",
    kind: "code",
    source: "```text\nORCA_PROTECTED_0001\n```",
    protected: { ORCA_PROTECTED_0001: "a long code-only value" },
  });
  const image = segmentFixture({
    id: "install:image:0",
    kind: "image",
    source: "![An English image description](ORCA_PROTECTED_0001)",
    protected: { ORCA_PROTECTED_0001: "/docs/image.png" },
  });
  const page = pageFixture({ segments: [code, image] });
  const file = translationFor(page, {
    "install:code:0": code.source,
    "install:image:0": image.source,
  });

  expect(() => validateTranslation(page, file)).not.toThrow();
});

describe("validate-ready", () => {
  test("reports missing jobs separately without failing", async () => {
    const root = await mkdtemp(join(tmpdir(), "orca-ready-"));
    const jobRoot = join(root, ".mirror", "jobs");
    const translationRoot = join(root, "mirror", "translations");
    const page = pageFixture({
      segments: [
        segmentFixture({
          id: "install:p:0",
          kind: "paragraph",
          source: "A source sentence that is longer than twenty characters.",
        }),
      ],
    });
    const plan = planChanges(manifestFixture(), [page], NOW);
    await writeTranslationJobs(plan, jobRoot);

    const result = await validateReady(jobRoot, translationRoot);

    expect(result).toEqual({
      validated: [],
      remaining: [join("install", "index.json")],
      invalid: [],
    });
  });

  test("validates present output and reports malformed completed output", async () => {
    const root = await mkdtemp(join(tmpdir(), "orca-ready-"));
    const jobRoot = join(root, ".mirror", "jobs");
    const translationRoot = join(root, "mirror", "translations");
    const page = pageFixture({
      segments: [
        segmentFixture({
          id: "install:p:0",
          kind: "paragraph",
          source: "A source sentence that is longer than twenty characters.",
        }),
      ],
    });
    await writeTranslationJobs(
      planChanges(manifestFixture(), [page], NOW),
      jobRoot,
    );
    const translationPath = join(
      translationRoot,
      "install",
      "index.json",
    );
    await mkdir(join(translationRoot, "install"), { recursive: true });
    await writeFile(
      translationPath,
      `${JSON.stringify(
        translationFor(page, {
          "install:p:0": "충분히 긴 한국어 번역 문장입니다.",
        }),
        null,
        2,
      )}\n`,
    );

    await expect(validateReady(jobRoot, translationRoot)).resolves.toEqual({
      validated: [join("install", "index.json")],
      remaining: [],
      invalid: [],
    });

    await writeFile(translationPath, "{ not valid JSON\n");
    const invalid = await validateReady(jobRoot, translationRoot);

    expect(invalid.validated).toEqual([]);
    expect(invalid.remaining).toEqual([]);
    expect(invalid.invalid).toHaveLength(1);
    expect(invalid.invalid[0]).toMatchObject({
      path: join("install", "index.json"),
    });
  });
});
