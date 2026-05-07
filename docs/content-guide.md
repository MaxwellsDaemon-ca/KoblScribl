# KoblScribl Content Guide

This guide explains the frontmatter metadata used by KoblScribl story and chapter files.

Story content lives in:

```text
src/content/works/
```

The `works` collection is loaded from all Markdown files under that folder:

```text
src/content/works/**/*.md
```

Each Markdown file represents either a one-shot or one chapter of a series.

## Full metadata reference

```yaml
title: "Chapter page title"
category: "fanfiction"
fandoms: ["Pokemon"]
fandomSlug: ["pokemon"]
workType: "series"
storyGroup: "main"
seriesTitle: "Redolence"
seriesSlug: "redolence"
seriesSummary: "A short summary for the whole series."
chapterNumber: 1
chapterTitle: "Hidden Ability"
summary: "A short summary for this chapter or one-shot."
wordCount: 6000
contentWarnings: "optional warning text"
authorsNote: "optional author's note"
tags:
  - type: "species"
    label: "Salandit"
    slug: "salandit"
  - type: "genre"
    label: "Slice of Life"
    slug: "slice-of-life"
  - type: "relationship"
    label: "Slow Burn"
    slug: "slow-burn"
status: "published"
published: true
nsfw: false
publishedDate: 2026-05-07
updatedDate: 2026-05-07
```

## Required fields

Every work entry needs these fields:

```yaml
title: "Page title"
category: "fanfiction"
fandoms: ["Pokemon"]
fandomSlug: ["pokemon"]
workType: "series"
summary: "Short summary."
wordCount: 6000
```

## Optional fields

These fields can be omitted unless the entry needs them:

```yaml
storyGroup: "main"
seriesTitle: "Series Title"
seriesSlug: "series-slug"
seriesSummary: "Series-wide summary."
chapterNumber: 1
chapterTitle: "Chapter Title"
contentWarnings: "warning text"
authorsNote: "author's note"
tags: []
status: "published"
published: true
nsfw: false
publishedDate: 2026-05-07
updatedDate: 2026-05-07
```

If `tags` is omitted, it defaults to an empty array.

## Categories

`category` controls which major archive section the work belongs to.

Allowed values:

```yaml
category: "fanfiction"
category: "crossover"
category: "original"
```

Use `fanfiction` for a work attached to one fandom area, `crossover` for works intentionally involving multiple fandoms, and `original` for original settings or stories.

## Fandom fields

Use `fandoms` for the human-readable fandom names:

```yaml
fandoms: ["Pokemon"]
```

Use `fandomSlug` for the matching URL-safe slugs:

```yaml
fandomSlug: ["pokemon"]
```

For crossovers, include multiple values in the same order:

```yaml
fandoms: ["Pokemon", "Digimon"]
fandomSlug: ["pokemon", "digimon"]
```

## Work type

`workType` controls whether the file is part of a series or a standalone one-shot.

Allowed values:

```yaml
workType: "series"
workType: "oneshot"
```

## Series entries

For a normal chaptered work, use:

```yaml
title: "Redolence - Chapter 1"
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
status: "published"
published: true
nsfw: false
publishedDate: 2026-05-07
updatedDate: 2026-05-07
```

`seriesTitle` is the display name. `seriesSlug` is the URL-safe version used for routing.

`chapterNumber` should be a number, not a quoted string:

```yaml
chapterNumber: 1
```

Do not use:

```yaml
chapterNumber: "1"
```

## One-shots

For a one-shot, use `workType: "oneshot"` and omit the series/chapter fields unless you specifically need them.

```yaml
title: "Standalone Story Title"
category: "fanfiction"
fandoms: ["Pokemon"]
fandomSlug: ["pokemon"]
workType: "oneshot"
summary: "A standalone story summary."
wordCount: 4500
status: "published"
published: true
nsfw: false
publishedDate: 2026-05-07
```

## Story group

`storyGroup` is optional and mostly matters for series organization.

Allowed values:

```yaml
storyGroup: "main"
storyGroup: "side"
```

Use `main` for primary chapters and `side` for side stories, bonus scenes, extras, or non-mainline entries.

## Tags

Tags are tiered by `type`, so they can be grouped and color-coded in the UI.

Use this shape:

```yaml
tags:
  - type: "species"
    label: "Salandit"
    slug: "salandit"
  - type: "genre"
    label: "Slice of Life"
    slug: "slice-of-life"
  - type: "relationship"
    label: "Slow Burn"
    slug: "slow-burn"
```

`type` controls the tag tier. `label` is what readers see. `slug` is optional for now, but recommended because it will make future tag archive pages easier.

Allowed tag types:

```yaml
type: "species"
type: "genre"
type: "relationship"
type: "character"
type: "setting"
type: "theme"
type: "trope"
type: "content"
type: "format"
type: "mood"
type: "rating"
type: "general"
```

Suggested use:

- `species` – Pokemon species, furry species, fantasy ancestries, creature types.
- `genre` – romance, fantasy, sci-fi, horror, mystery, slice of life.
- `relationship` – slow burn, established relationship, found family, rivals, friendship.
- `character` – major characters or POV characters when useful for archive browsing.
- `setting` – region, city, world, canon era, AU setting, or campaign location.
- `theme` – grief, identity, ambition, recovery, faith, duty, belonging.
- `trope` – isekai, fake dating, time loop, chosen one, secret identity.
- `content` – non-warning content notes such as tabletop gaming, food, travel, politics, combat.
- `format` – texting, epistolary, vignette, side story, interlude, prologue.
- `mood` – cozy, bittersweet, tense, comedic, melancholy.
- `rating` – general audience, mature, explicit, teen, or whatever rating language you settle on.
- `general` – catch-all for anything that does not deserve its own tier yet.

Keep `contentWarnings` separate from tags. A tag can describe what a story is about; `contentWarnings` should warn about material a reader may want to avoid.

## Publication state

The archive uses both `status` and `published`.

```yaml
status: "published"
published: true
```

`published` controls whether the work should appear publicly in archive listings.

```yaml
published: false
```

Use `published: false` for drafts, placeholders, unfinished metadata tests, or entries you want Astro to know about but not list publicly.

`status` is more descriptive and can be shown to readers.

Allowed values:

```yaml
status: "draft"
status: "published"
status: "complete"
status: "hiatus"
```

## NSFW works

Use:

```yaml
nsfw: true
```

This allows archive pages to show warning text and trigger the shared NSFW modal before a reader opens the page.

## Date fields

The schema uses:

```ts
publishedDate: z.coerce.date().optional()
updatedDate: z.coerce.date().optional()
```

Use ISO-style dates in frontmatter:

```yaml
publishedDate: 2026-05-07
updatedDate: 2026-05-07
```

You may also use a full ISO date-time:

```yaml
publishedDate: 2026-05-07T14:30:00-06:00
updatedDate: 2026-05-07T14:30:00-06:00
```

Because the schema uses `z.coerce.date()`, quoted ISO date strings are also accepted:

```yaml
publishedDate: "2026-05-07"
updatedDate: "2026-05-07"
```
