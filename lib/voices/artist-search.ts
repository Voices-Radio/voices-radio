import type { VoicesArtist } from "./types";

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Matches on name and aliases only; genres stay the job of the genre filter. */
export function matchesArtistQuery(artist: VoicesArtist, query: string) {
  const needle = normalise(query);
  if (!needle) return true;

  return [artist.name, ...(artist.aliases ?? [])].some((value) =>
    normalise(value).includes(needle),
  );
}

export function filterArtistsByQuery(artists: VoicesArtist[], query: string) {
  return artists.filter((artist) => matchesArtistQuery(artist, query));
}
