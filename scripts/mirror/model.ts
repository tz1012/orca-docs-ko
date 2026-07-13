import { z } from "zod";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

const isCanonicalMirrorPath = (value: string) => {
  if (value === "/docs/") return true;
  if (
    !value.startsWith("/docs/") ||
    !value.endsWith("/") ||
    /[?#\\]/.test(value)
  ) {
    return false;
  }

  const segments = value.slice(1, -1).split("/");
  if (segments.some((segment) => segment.length === 0)) return false;

  return segments.every((segment) => {
    try {
      const decoded = decodeURIComponent(segment);
      return (
        decoded !== "." &&
        decoded !== ".." &&
        !decoded.includes("/") &&
        !decoded.includes("\\")
      );
    } catch {
      return false;
    }
  });
};

const MirrorPathSchema = z
  .string()
  .refine(isCanonicalMirrorPath, "Expected a canonical /docs/ mirror path");

export const SegmentKindSchema = z.enum([
  "heading",
  "paragraph",
  "list",
  "table",
  "code",
  "blockquote",
  "aside",
  "figure",
  "image",
]);

export const SourceSegmentSchema = z.strictObject({
  id: z.string().min(1),
  kind: SegmentKindSchema,
  source: z.string().min(1),
  sourceHash: Sha256Schema,
  protected: z.record(z.string(), z.string()),
});

export type SourceSegment = z.infer<typeof SourceSegmentSchema>;

export const NavigationGroupSchema = z.strictObject({
  sourceLabel: z.string().min(1),
  sourceUrls: z.array(z.url()),
});

export type NavigationGroup = z.infer<typeof NavigationGroupSchema>;

export const ImageStateSchema = z.strictObject({
  sourceUrl: z.url(),
  localPath: z.string().startsWith("/").nullable(),
  contentHash: Sha256Schema.nullable(),
  robotsRemote: z.boolean(),
});

export type ImageState = z.infer<typeof ImageStateSchema>;

export const SourcePageSchema = z.strictObject({
  sourceUrl: z.url(),
  mirrorPath: MirrorPathSchema,
  titleSegmentId: z.string().min(1),
  pageHash: Sha256Schema,
  checkedAt: z.iso.datetime(),
  sitemapLastmod: z.string().min(1).nullable(),
  segments: z.array(SourceSegmentSchema).min(1),
  images: z.array(ImageStateSchema),
  navigationGroups: z.array(NavigationGroupSchema),
  previousSourceUrl: z.url().nullable(),
  nextSourceUrl: z.url().nullable(),
});

export type SourcePage = z.infer<typeof SourcePageSchema>;

export const ManifestStatusSchema = z.enum([
  "active",
  "pending-removal",
  "redirect",
]);

export const SegmentValidationSchema = z.strictObject({
  kind: SegmentKindSchema,
  fencedCodeCount: z.number().int().nonnegative(),
  protectedTokens: z
    .array(z.string().regex(/^ORCA_PROTECTED_\d{4,}$/u))
    .refine(
      (tokens) => new Set(tokens).size === tokens.length,
      "Protected validation tokens must be unique",
    ),
  requiresKorean: z.boolean(),
});

export type SegmentValidation = z.infer<typeof SegmentValidationSchema>;

export const ManifestPageSchema = z.strictObject({
  sourceUrl: z.url(),
  mirrorPath: MirrorPathSchema,
  titleSegmentId: z.string().min(1),
  pageHash: Sha256Schema,
  checkedAt: z.iso.datetime(),
  sitemapLastmod: z.string().min(1).nullable(),
  translatedAt: z.iso.datetime().nullable(),
  missingRuns: z.number().int().nonnegative(),
  status: ManifestStatusSchema,
  redirectTo: MirrorPathSchema.nullable(),
  segmentHashes: z.record(z.string(), Sha256Schema),
  segmentValidation: z.record(z.string(), SegmentValidationSchema),
  renderedContentHash: Sha256Schema.nullable(),
  images: z.array(ImageStateSchema),
}).superRefine(({ segmentHashes, segmentValidation }, context) => {
  const hashIds = Object.keys(segmentHashes).sort();
  const validationIds = Object.keys(segmentValidation).sort();
  if (
    hashIds.length !== validationIds.length ||
    hashIds.some((id, index) => id !== validationIds[index])
  ) {
    context.addIssue({
      code: "custom",
      message: "Segment validation keys must match segment hash keys",
      path: ["segmentValidation"],
    });
  }
});

export type ManifestPage = z.infer<typeof ManifestPageSchema>;

export const SourceManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  generatedAt: z.iso.datetime(),
  pages: z.record(MirrorPathSchema, ManifestPageSchema),
}).superRefine(({ pages }, context) => {
  for (const [mirrorPath, page] of Object.entries(pages)) {
    if (mirrorPath !== page.mirrorPath) {
      context.addIssue({
        code: "custom",
        message: "Manifest page key must match page.mirrorPath",
        path: ["pages", mirrorPath, "mirrorPath"],
      });
    }
  }
});

export type SourceManifest = z.infer<typeof SourceManifestSchema>;

export const TranslationEntrySchema = z.strictObject({
  sourceHash: Sha256Schema,
  translated: z
    .string()
    .refine((value) => value.trim().length > 0, "Translation cannot be empty"),
});

export const TranslationFileSchema = z.strictObject({
  sourceUrl: z.url(),
  mirrorPath: MirrorPathSchema,
  entries: z.record(z.string().min(1), TranslationEntrySchema),
});

export type TranslationEntry = z.infer<typeof TranslationEntrySchema>;
export type TranslationFile = z.infer<typeof TranslationFileSchema>;
