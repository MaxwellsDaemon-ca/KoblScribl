import { z } from "astro/zod";

/** Top-level archive buckets used to decide which directory route owns a work. */
const workCategorySchema = z.enum(["fanfiction", "crossover", "original"]);

/** Whether the entry is a standalone work or one chapter within a series. */
const workTypeSchema = z.enum(["series", "oneshot"]);

/** Series chapters can be separated into main continuity and optional side material. */
const storyGroupSchema = z.enum(["main", "side"]);

const publicationStatusSchema = z.enum([
  "draft",
  "published",
  "complete",
  "hiatus",
]);

/** Tag categories mirrored by TagList.astro and tag-pills.css. */
export const tagTypeSchema = z.enum([
  "species",
  "genre",
  "relationship",
  "character",
  "setting",
  "theme",
  "trope",
  "content",
  "format",
  "mood",
  "rating",
  "general",
]);

export const tagSchema = z.object({
  type: tagTypeSchema,
  label: z.string(),
  slug: z.string().optional(),
});

/**
 * Fandom arrays are kept parallel so each fandom label has a matching URL slug.
 * Original works should generally use empty arrays for both fields.
 */
const fandomSchema = z.object({
  category: workCategorySchema,
  fandoms: z.array(z.string()),
  fandomSlug: z.array(z.string()),
});

/** Structural metadata controls series grouping, chapter ordering, and index pages. */
const structureSchema = z.object({
  workType: workTypeSchema,
  storyGroup: storyGroupSchema.optional(),
  seriesTitle: z.string().optional(),
  seriesSlug: z.string().optional(),
  seriesSummary: z.string().optional(),
  chapterNumber: z.number().optional(),
  chapterTitle: z.string().optional(),
});

/** Reader-facing metadata displayed on cards and chapter pages. */
const bodyMetadataSchema = z.object({
  title: z.string(),
  summary: z.string(),
  wordCount: z.number(),
  contentWarnings: z.string().optional(),
  authorsNote: z.string().optional(),
  tags: z.array(tagSchema).default([]),
});

/** Publication controls keep drafts out of static paths while preserving draft metadata. */
const publicationSchema = z.object({
  status: publicationStatusSchema.default("published"),
  published: z.boolean().default(true),
  nsfw: z.boolean().default(false),

  // Coercion lets both unquoted YAML dates and quoted ISO date strings validate cleanly.
  publishedDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
});

export const workSchema = fandomSchema
  .merge(structureSchema)
  .merge(bodyMetadataSchema)
  .merge(publicationSchema);

export type WorkCategory = z.infer<typeof workCategorySchema>;
export type WorkType = z.infer<typeof workTypeSchema>;
export type StoryGroup = z.infer<typeof storyGroupSchema>;
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export type TagType = z.infer<typeof tagTypeSchema>;
export type WorkTag = z.infer<typeof tagSchema>;
export type WorkData = z.infer<typeof workSchema>;
