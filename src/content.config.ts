import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const works = defineCollection({
  loader: glob({ base: "./src/content/works", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),

    fandoms: z.array(z.string()),
    isCrossover: z.boolean().default(false),

    workType: z.enum(["series", "oneshot"]),
    storyGroup: z.enum(["main", "side"]).optional(),

    seriesTitle: z.string().optional(),
    chapterNumber: z.number().optional(),
    chapterTitle: z.string().optional(),

    summary: z.string(),
    wordCount: z.number(),
    contentWarnings: z.string().optional(),

    status: z.enum(["draft", "published", "complete", "hiatus"]).default("published"),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  works,
};