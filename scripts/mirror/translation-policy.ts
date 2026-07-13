import { normalizeText } from "./hash.js";
import type { SourceSegment } from "./model.js";

export const HANGUL_PATTERN = /\p{Script=Hangul}/u;

export const requiresKoreanTranslation = (
  segment: Pick<SourceSegment, "kind" | "source">,
) =>
  segment.kind !== "code" &&
  segment.kind !== "image" &&
  normalizeText(segment.source).length > 20;
