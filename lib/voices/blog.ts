/**
 * Pure helpers for the station blog. Both /blog and /blog/[slug] used to
 * carry their own copies of the date formatter, the category label
 * transform and the reading-time estimate; they live here instead.
 */

/**
 * The little of a PortableText block this module needs. Narrowed from
 * `unknown` rather than typed against Sanity's `PortableTextBlock`, whose
 * children are a union of spans and arbitrary custom objects — only spans
 * carry `text`, and anything else contributes no words.
 */
type ContentBlock = {
  _type?: string;
  children?: readonly unknown[];
};

function asContentBlock(value: unknown): ContentBlock | undefined {
  return typeof value === "object" && value !== null
    ? (value as ContentBlock)
    : undefined;
}

function childText(value: unknown): string {
  if (typeof value !== "object" || value === null) return "";

  const text = (value as { text?: unknown }).text;
  return typeof text === "string" ? text : "";
}

/** Matches `lib/voices/home.ts` — the rest of the site reads "12 Aug 2026",
 *  not "August 12, 2026". */
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatPostDate(date?: string): string {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return dateFormatter.format(parsed);
}

/** ISO date for `<time dateTime>` / JSON-LD. Empty when unparseable. */
export function toIsoDate(date?: string): string {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString();
}

/**
 * "behind-the-scenes" → "Behind The Scenes". Editors type categories freely
 * in Sanity (`layout: "tags"`), so this has to cope with any string rather
 * than a known list.
 */
export function formatCategoryLabel(category: string): string {
  return category
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(content?: readonly unknown[]): number {
  if (!content?.length) return 1;

  const words = content
    .map(asContentBlock)
    .filter((block) => block?._type === "block")
    .flatMap((block) => block?.children ?? [])
    .map(childText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/**
 * Posts without a featured image used to all fall back to the same
 * `/studio-1.jpg`, so an index of image-less posts rendered as a grid of
 * identical photos. They get a typographic tile instead — this picks which
 * of the three colourways from the document id, so the choice is stable
 * across renders and varied across the grid.
 */
export function pickFallbackTileVariant(id: string): 0 | 1 | 2 {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997;
  }

  return (hash % 3) as 0 | 1 | 2;
}

type CategorisedPost = { categories?: string[] };

/** Every category in use, de-duplicated, ordered by frequency then name. */
export function collectCategories(posts: CategorisedPost[]): string[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const category of post.categories ?? []) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(
      ([aName, aCount], [bName, bCount]) =>
        bCount - aCount || aName.localeCompare(bName),
    )
    .map(([name]) => name);
}

/** Posts carrying *every* selected category. Empty selection matches all. */
export function filterPostsByCategories<T extends CategorisedPost>(
  posts: T[],
  categories: string[],
): T[] {
  if (!categories.length) return posts;

  return posts.filter((post) =>
    categories.every((category) => post.categories?.includes(category)),
  );
}
