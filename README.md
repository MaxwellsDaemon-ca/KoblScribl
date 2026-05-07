# KoblScribl

KoblScribl is a small Astro-powered story archive for fanfiction, crossovers, original fiction, side stories, and formatting experiments. It is built as a static site so the archive can stay lightweight, readable, and easy to host.

The project uses Astro content collections for story metadata, Markdown for story/chapter files, and a few custom styling systems for archive cards, fandom/category pages, chapter pages, text-message blocks, and other story-specific presentation needs.

## Project structure

```text
/
├── public/
│   └── ...static assets
├── src/
│   ├── components/
│   │   └── ...shared Astro components
│   ├── content/
│   │   └── works/
│   │       └── ...story and chapter Markdown files
│   ├── layouts/
│   │   └── ...page layouts
│   ├── pages/
│   │   └── ...site routes
│   ├── styles/
│   │   └── ...shared CSS files
│   └── utils/
│       └── ...shared helper logic, if added
├── astro.config.mjs
├── content.config.ts
├── package.json
└── README.md
```

Astro exposes files in `src/pages/` as routes. Story/chapter content lives in `src/content/works/` and is loaded through the `works` content collection.

## Local development

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

The local site usually runs at:

```text
http://localhost:4321/
```

Build the static production site:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

Run Astro commands directly:

```sh
npm run astro -- --help
```

## Content model

The main content collection is `works`, loaded from:

```text
src/content/works/**/*.md
```

Each Markdown file represents either a one-shot or a chapter within a series. Metadata is controlled by `content.config.ts`.

Common fields include:

```yaml
title: "Chapter page title"
category: "fanfiction"
fandoms: ["Pokemon"]
fandomSlug: ["pokemon"]
workType: "series"
storyGroup: "main"
seriesTitle: "Redolence"
seriesSlug: "redolence"
seriesSummary: "A slice-of-life story about tabletop games, friendships, and the quiet messiness of wanting more."
chapterNumber: 1
chapterTitle: "Hidden Ability"
summary: "Alexei prepares for another session with his usual party."
wordCount: 6000
contentWarnings: "awkward conversations, tabletop scheduling, salandit anxiety"
authorsNote: "Optional note shown around the chapter content."
status: "published"
published: true
nsfw: false
```

For a fuller explanation of the metadata schema and examples, see:

```text
docs/content-guide.md
```

## Major archive categories

KoblScribl currently organizes works into three top-level categories:

- `fanfiction` – works belonging to a single fandom area.
- `crossover` – works intentionally involving multiple fandoms.
- `original` – original stories and settings.

Works can also be either:

- `series` – a chaptered work, grouped by `seriesSlug`.
- `oneshot` – a standalone work.

## Shared styling

Shared archive styles should live in `src/styles/` instead of being repeated in individual route files.

Current shared style files may include:

```text
src/styles/shared-directory.css
src/styles/nsfw-modal.css
```

Use page-local `<style>` blocks only for layout or presentation that truly belongs to that one page.

## NSFW handling

NSFW works use the `nsfw` metadata field:

```yaml
nsfw: true
```

Pages can use the shared NSFW modal component instead of duplicating modal markup and scripts across routes:

```astro
---
import NsfwModal from "../components/NsfwModal.astro";
---

<NsfwModal />
```

Adjust the import path as needed based on the route file’s directory depth.

## Drafts and publication state

The archive uses two related fields:

```yaml
status: "published"
published: true
```

`published: false` should keep a work out of public archive listings. The `status` field is useful for human-facing story state, such as:

```yaml
status: "draft"
status: "published"
status: "complete"
status: "hiatus"
```

When in doubt, use both:

```yaml
status: "published"
published: true
```

## Drive/source hygiene

For Google Drive review copies, keep the uploaded folder close to the real source tree and avoid syncing generated or dependency folders.

Do include:

```text
src/
public/
astro.config.mjs
content.config.ts
package.json
package-lock.json
README.md
```

Do not include:

```text
node_modules/
.astro/
dist/
.env
.env.production
```

Those folders/files are either generated locally, installed by `npm install`, or environment-specific.

## Notes for future cleanup

Good future improvements for the project:

- Add `publishedDate`, `updatedDate`, and `tags` to the content schema.
- Move repeated sorting/grouping logic into `src/utils/works.ts`.
- Add a proper `src/pages/404.astro` page.
- Add a `/works/archive` page for all published works.
