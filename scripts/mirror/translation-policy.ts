import { normalizeText } from "./hash.js";
import type { SourceSegment } from "./model.js";

export const HANGUL_PATTERN = /\p{Script=Hangul}/u;

export const countFences = (markdown: string) =>
  markdown
    .split(/\r?\n/u)
    .filter((line) =>
      /^[ \t]{0,3}(?:>[ \t]*)*(?:`{3,}|~{3,})(?:[^`~].*)?$/u.test(
        line,
      ),
    ).length;

export const requiresKoreanTranslation = (
  segment: Pick<SourceSegment, "kind" | "source">,
) =>
  segment.kind !== "code" &&
  segment.kind !== "image" &&
  normalizeText(segment.source).length > 20;
