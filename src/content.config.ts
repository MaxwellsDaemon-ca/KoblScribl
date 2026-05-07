import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { workSchema } from "./content/schemas/workSchema";

/**
 * Content collection registry for KoblScribl.
 *
 * All story Markdown files live under src/content/works and are validated by
 * the shared work schema before Astro exposes them to pages and components.
 */
const works = defineCollection({
  loader: glob({ base: "./src/content/works", pattern: "**/*.md" }),
  schema: workSchema,
});

export const collections = {
  works,
};
