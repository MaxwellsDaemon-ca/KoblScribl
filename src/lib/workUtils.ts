import type { CollectionEntry } from "astro:content";
import type { WorkTag } from "../content/schemas/workSchema";

export type WorkEntry = CollectionEntry<"works">;

export type SeriesCardData = {
  seriesTitle: string;
  seriesSlug?: string;
  entries: WorkEntry[];
  totalCount: number;
  mainCount: number;
  sideCount: number;
  summary: string;
  fandoms: string[];
  fandomSlugs: string[];
  containsNsfw: boolean;
};

export type FandomStats = {
  fandom: string;
  fandomSlug: string;
  works: WorkEntry[];
  totalWorks: number;
  seriesCount: number;
  oneShotCount: number;
};

/** Sorts story entries by chapter number, treating missing numbers as zero. */
export const sortByChapterNumber = (a: WorkEntry, b: WorkEntry) =>
  (a.data.chapterNumber ?? 0) - (b.data.chapterNumber ?? 0);

/** Sorts story entries alphabetically by their display title. */
export const sortByTitle = (a: WorkEntry, b: WorkEntry) =>
  a.data.title.localeCompare(b.data.title);

/** Keeps route-level queries readable by centralizing the published-work check. */
export const isPublished = (work: WorkEntry) => work.data.published;

/**
 * Formats series chapters consistently across index cards, chapter pages, and navigation.
 * Chapter zero is intentionally labeled as a prologue instead of "Chapter 0".
 */
export const chapterDisplayTitle = (work: WorkEntry | null | undefined) => {
  if (!work) return "";

  if (work.data.chapterNumber === 0) {
    return `Prologue: ${work.data.chapterTitle ?? work.data.title}`;
  }

  return `Chapter ${work.data.chapterNumber}: ${work.data.chapterTitle ?? work.data.title}`;
};

/** Groups chapter entries into series-card data used by fandom, crossover, and original indexes. */
export function buildSeriesCards(seriesWorks: WorkEntry[]): SeriesCardData[] {
  const seriesMap = new Map<string, WorkEntry[]>();

  for (const work of seriesWorks) {
    const seriesTitle = work.data.seriesTitle ?? "Untitled Series";
    const entries = seriesMap.get(seriesTitle) ?? [];

    entries.push(work);
    seriesMap.set(seriesTitle, entries);
  }

  return [...seriesMap.entries()]
    .map(([seriesTitle, entries]) => {
      const sortedEntries = [...entries].sort(sortByChapterNumber);

      return {
        seriesTitle,
        entries: sortedEntries,
        seriesSlug: sortedEntries[0]?.data.seriesSlug,
        totalCount: sortedEntries.length,
        mainCount: sortedEntries.filter((entry) => entry.data.storyGroup === "main").length,
        sideCount: sortedEntries.filter((entry) => entry.data.storyGroup === "side").length,
        summary: sortedEntries[0]?.data.seriesSummary ?? "",
        fandoms: [...new Set(sortedEntries.flatMap((entry) => entry.data.fandoms))],
        fandomSlugs: [...new Set(sortedEntries.flatMap((entry) => entry.data.fandomSlug))],
        containsNsfw: sortedEntries.some((entry) => entry.data.nsfw),
      };
    })
    .sort((a, b) => a.seriesTitle.localeCompare(b.seriesTitle));
}

/** Builds the fandom overview cards shown on the main works directory. */
export function buildFandomStats(works: WorkEntry[]): FandomStats[] {
  const fandomMap = new Map<string, WorkEntry[]>();

  for (const work of works) {
    for (const fandom of work.data.fandoms) {
      const entries = fandomMap.get(fandom) ?? [];

      entries.push(work);
      fandomMap.set(fandom, entries);
    }
  }

  return [...fandomMap.entries()]
    .map(([fandom, fandomWorks]) => {
      const seriesTitles = new Set(
        fandomWorks
          .filter((work) => work.data.workType === "series" && work.data.seriesTitle)
          .map((work) => work.data.seriesTitle!)
      );

      const oneShots = fandomWorks.filter((work) => work.data.workType === "oneshot");

      return {
        fandom,
        fandomSlug: fandomWorks[0]?.data.fandomSlug[0] ?? "",
        works: fandomWorks,
        totalWorks: fandomWorks.length,
        seriesCount: seriesTitles.size,
        oneShotCount: oneShots.length,
      };
    })
    .sort((a, b) => a.fandom.localeCompare(b.fandom));
}

/** Returns unique tags for a series, excluding side stories by default. */
export function collectSeriesTags(seriesWorks: WorkEntry[], includeSideStories = false) {
  const seriesTagsByKey = new Map<string, WorkTag>();
  const eligibleWorks = includeSideStories
    ? seriesWorks
    : seriesWorks.filter((work) => work.data.storyGroup !== "side");

  for (const work of eligibleWorks) {
    for (const tag of work.data.tags ?? []) {
      seriesTagsByKey.set(`${tag.type}:${tag.slug ?? tag.label}`, tag);
    }
  }

  return [...seriesTagsByKey.values()];
}

/** Limits previous/next navigation to the current work's own main-story series. */
export function getMainSeriesChapters(allWorks: WorkEntry[], currentWork: WorkEntry) {
  if (currentWork.data.workType !== "series" || !currentWork.data.seriesTitle) {
    return [];
  }

  return allWorks
    .filter(
      (entry) =>
        entry.data.published &&
        entry.data.category === currentWork.data.category &&
        entry.data.workType === "series" &&
        entry.data.storyGroup === "main" &&
        entry.data.seriesTitle === currentWork.data.seriesTitle &&
        entry.data.seriesSlug === currentWork.data.seriesSlug
    )
    .sort(sortByChapterNumber);
}
