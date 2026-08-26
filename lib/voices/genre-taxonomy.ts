import genreTaxonomyJson from "@/docs/plans/genre-taxonomy.json";

type GenreTaxonomy = Record<string, Record<string, string[]>>;

export const genreTaxonomy = genreTaxonomyJson.taxonomy as GenreTaxonomy;

export const genrePrimaryOptions = Object.keys(genreTaxonomy);

export function getGenreKey(primary: string, subgenre: string) {
  return `${primary} > ${subgenre}`;
}

export function isGenreKey(value: string) {
  if (value in genreTaxonomy) return true;

  return Object.entries(genreTaxonomy).some(([primary, subgenres]) =>
    Object.keys(subgenres).some(
      (subgenre) => getGenreKey(primary, subgenre) === value,
    ),
  );
}

export function getGenreAliases(key: string) {
  const primarySubgenres = genreTaxonomy[key];
  if (primarySubgenres) {
    return Object.values(primarySubgenres).flat();
  }

  const separatorIndex = key.indexOf(" > ");
  if (separatorIndex === -1) return [];

  const primary = key.slice(0, separatorIndex);
  const subgenre = key.slice(separatorIndex + 3);
  return genreTaxonomy[primary]?.[subgenre] ?? [];
}

export function getGenreRegexPatterns(keys: string[]) {
  const aliases = new Set(keys.flatMap(getGenreAliases));

  return Array.from(
    aliases,
    (alias) => `^${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
  );
}

export function normalizeGenreValue(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchesGenreKeys(
  itemGenres: string[],
  selectedKeys: string[],
) {
  if (!selectedKeys.length) return true;

  const normalized = itemGenres.map(normalizeGenreValue).filter(Boolean);
  if (!normalized.length) return false;

  return selectedKeys.some((key) =>
    getGenreAliases(key)
      .map(normalizeGenreValue)
      .some((alias) => normalized.includes(alias)),
  );
}
