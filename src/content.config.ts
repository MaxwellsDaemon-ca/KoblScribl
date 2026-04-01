import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const stories = defineCollection({
  loader: glob({ base: "./src/content/stories", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    storyTitle: z.string(),
    chapterNumber: z.number(),
    summary: z.string(),
    wordCount: z.number(),
    contentWarnings: z.string().optional(),
  }),
});

export const collections = {
  stories,
};