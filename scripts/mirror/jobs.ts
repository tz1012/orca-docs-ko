import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { normalizeText } from "./hash.js";
import {
  SourcePageSchema,
  SourceSegmentSchema,
  TranslationFileSchema,
  type SourcePage,
  type TranslationFile,
} from "./model.js";
import { restoreProtected } from "./protect.js";
import type { ChangePlan } from "./state.js";

const compareStrings = (left: string, right: string) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const HANGUL_PATTERN = /\p{Script=Hangul}/u;
const TRANSLATION_RULES = [
  "기술 문서의 의미를 유지하고 '~합니다' 문체의 자연스러운 한국어로 번역합니다.",
  "모든 ORCA_PROTECTED 토큰을 원문과 동일하게 정확히 한 번씩 유지합니다.",
  "코드, 명령어, 플래그, 파일 경로, URL, 제품명은 변경하지 않습니다.",
  "영문 UI 레이블은 인라인 코드로 보존하고 뒤에 한국어 설명을 괄호로 표시합니다.",
  "원문의 Markdown 구조와 코드 펜스 수를 유지합니다.",
] as const;

const TranslationRequestSchema = z.object({
  sourceUrl: SourcePageSchema.shape.sourceUrl,
  mirrorPath: SourcePageSchema.shape.mirrorPath,
  segments: z.array(SourceSegmentSchema).min(1),
});

export const TranslationJobSchema = z.strictObject({
  sourceUrl: SourcePageSchema.shape.sourceUrl,
  mirrorPath: SourcePageSchema.shape.mirrorPath,
  rules: z.array(z.string().min(1)).min(1),
  segments: z.array(SourceSegmentSchema).min(1),
});

export type TranslationJob = z.infer<typeof TranslationJobSchema>;
type TranslationRequest = Pick<
  SourcePage,
  "sourceUrl" | "mirrorPath" | "segments"
>;

export class KoreanCoverageError extends Error {
  readonly segmentId: string;

  constructor(segmentId: string) {
    super(`Translation for ${segmentId} must contain Korean characters`);
    this.name = "KoreanCoverageError";
    this.segmentId = segmentId;
  }
}

const pathSegmentsFor = (mirrorPath: string) => {
  const suffix = mirrorPath.slice("/docs/".length, -1);
  return suffix.length === 0 ? [] : suffix.split("/");
};

export const translationRelativePath = (mirrorPath: string) =>
  join(...pathSegmentsFor(mirrorPath), "index.json");

export const writeTranslationJobs = async (
  plan: ChangePlan,
  jobRoot: string,
) => {
  const requestedIds = new Set(plan.translationSegmentIds);
  if (requestedIds.size !== plan.translationSegmentIds.length) {
    throw new Error("Change plan contains duplicate translation segment IDs");
  }

  const foundIds = new Set<string>();
  const jobs: Array<{ path: string; job: TranslationJob }> = [];
  for (const [plannedPath, page] of Object.entries(plan.pages).sort(
    ([left], [right]) => compareStrings(left, right),
  )) {
    if (plannedPath !== page.mirrorPath) {
      throw new Error(
        `Planned page key ${plannedPath} does not match ${page.mirrorPath}`,
      );
    }

    const segments = page.segments.filter((segment) => {
      if (!requestedIds.has(segment.id)) return false;
      if (foundIds.has(segment.id)) {
        throw new Error(`Duplicate requested segment ID: ${segment.id}`);
      }
      foundIds.add(segment.id);
      return true;
    });
    if (segments.length === 0) continue;

    const job = TranslationJobSchema.parse({
      sourceUrl: page.sourceUrl,
      mirrorPath: page.mirrorPath,
      rules: [...TRANSLATION_RULES],
      segments,
    });
    jobs.push({
      path: join(jobRoot, translationRelativePath(page.mirrorPath)),
      job,
    });
  }

  const missingIds = plan.translationSegmentIds.filter(
    (id) => !foundIds.has(id),
  );
  if (missingIds.length > 0) {
    throw new Error(
      `Translation segment IDs are absent from planned pages: ${missingIds.join(", ")}`,
    );
  }

  const written: string[] = [];
  for (const { path, job } of jobs) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(job, null, 2)}\n`, "utf8");
    written.push(path);
  }
  return written;
};

const countFences = (markdown: string) =>
  markdown
    .split(/\r?\n/u)
    .filter((line) =>
      /^[ \t]{0,3}(?:>[ \t]*)*(?:`{3,}|~{3,})(?:[^`~].*)?$/u.test(
        line,
      ),
    ).length;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const validateTranslation = (
  page: TranslationRequest,
  file: TranslationFile,
) => {
  const request = TranslationRequestSchema.parse(page);
  const translation = TranslationFileSchema.parse(file);

  if (translation.sourceUrl !== request.sourceUrl) {
    throw new Error(
      `Translation source URL must match ${request.sourceUrl}; received ${translation.sourceUrl}`,
    );
  }
  if (translation.mirrorPath !== request.mirrorPath) {
    throw new Error(
      `Translation mirror path must match ${request.mirrorPath}; received ${translation.mirrorPath}`,
    );
  }

  const segmentIds = new Set<string>();
  for (const segment of request.segments) {
    if (segmentIds.has(segment.id)) {
      throw new Error(`Duplicate requested segment ID: ${segment.id}`);
    }
    segmentIds.add(segment.id);

    const entry = translation.entries[segment.id];
    if (entry === undefined) {
      throw new Error(`Missing translation output for ${segment.id}`);
    }
    if (entry.sourceHash !== segment.sourceHash) {
      throw new Error(
        `Translation source hash does not match ${segment.id}: expected ${segment.sourceHash}, received ${entry.sourceHash}`,
      );
    }

    try {
      restoreProtected(entry.translated, segment.protected);
    } catch (error) {
      throw new Error(
        `Invalid protected tokens for ${segment.id}: ${errorMessage(error)}`,
        { cause: error },
      );
    }

    if (countFences(entry.translated) !== countFences(segment.source)) {
      throw new Error(
        `Translation for ${segment.id} must preserve the fenced-code count`,
      );
    }

    const requiresKorean =
      segment.kind !== "code" &&
      segment.kind !== "image" &&
      normalizeText(segment.source).length > 20;
    if (requiresKorean && !HANGUL_PATTERN.test(entry.translated)) {
      throw new KoreanCoverageError(segment.id);
    }
  }

  return translation;
};

const isMissing = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  (error as NodeJS.ErrnoException).code === "ENOENT";

const listJsonFiles = async (root: string): Promise<string[]> => {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (isMissing(error)) return [];
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries.sort((left, right) =>
    compareStrings(left.name, right.name),
  )) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listJsonFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(path);
    }
  }
  return files;
};

export interface ReadyValidationResult {
  validated: string[];
  remaining: string[];
  invalid: Array<{ path: string; error: string }>;
}

export const validateReady = async (
  jobRoot: string,
  translationRoot: string,
): Promise<ReadyValidationResult> => {
  const result: ReadyValidationResult = {
    validated: [],
    remaining: [],
    invalid: [],
  };

  for (const jobPath of await listJsonFiles(jobRoot)) {
    const relativePath = relative(jobRoot, jobPath);
    const translationPath = join(translationRoot, relativePath);
    let job: TranslationJob;
    try {
      job = TranslationJobSchema.parse(
        JSON.parse(await readFile(jobPath, "utf8")),
      );
    } catch (error) {
      result.invalid.push({
        path: relativePath,
        error: `Invalid translation job: ${errorMessage(error)}`,
      });
      continue;
    }

    let contents: string;
    try {
      contents = await readFile(translationPath, "utf8");
    } catch (error) {
      if (isMissing(error)) {
        result.remaining.push(relativePath);
        continue;
      }
      result.invalid.push({ path: relativePath, error: errorMessage(error) });
      continue;
    }

    try {
      validateTranslation(job, JSON.parse(contents) as TranslationFile);
      result.validated.push(relativePath);
    } catch (error) {
      result.invalid.push({ path: relativePath, error: errorMessage(error) });
    }
  }

  return result;
};

const runCli = async () => {
  if (process.argv[2] !== "validate-ready") {
    throw new Error("Usage: tsx scripts/mirror/jobs.ts validate-ready");
  }

  const result = await validateReady(
    resolve(".mirror", "jobs"),
    resolve("mirror", "translations"),
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.invalid.length > 0) process.exitCode = 1;
};

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (executedPath === fileURLToPath(import.meta.url)) {
  runCli().catch((error: unknown) => {
    process.stderr.write(`${errorMessage(error)}\n`);
    process.exitCode = 1;
  });
}
