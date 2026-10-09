export type SearchResult = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  subtitle?: string;
  station?: string;
  tags?: string[];
};

export type SearchCategories = {
  shows: SearchResult[];
  artists: SearchResult[];
  mainBlog: SearchResult[];
  podcastBlog: SearchResult[];
};

export type SearchResponse = {
  categories?: Partial<SearchCategories>;
  message?: string;
};

export type SearchSection = {
  key: keyof SearchCategories;
  label: string;
};

export const searchSections: SearchSection[] = [
  { key: "shows", label: "Shows" },
  { key: "artists", label: "Artists" },
  { key: "mainBlog", label: "Main blog" },
  { key: "podcastBlog", label: "Podcast blog" },
];

export function getFirstSearchResult(categories: SearchCategories | null) {
  for (const section of searchSections) {
    const result = categories?.[section.key]?.[0];
    if (result) return result;
  }

  return null;
}

export function hasSearchResults(categories: SearchCategories | null) {
  return searchSections.some((section) =>
    Boolean(categories?.[section.key]?.length),
  );
}
