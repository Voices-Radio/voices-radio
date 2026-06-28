import "server-only";

import {
  VOICES_API_BASE_URL,
  VOICES_DEFAULT_FEATURED_LIMIT,
  VOICES_DEFAULT_INDEX_LIMIT,
} from "./config";
import {
  getArtistIdFromShow,
  isPublicMatchedShow,
  matchesStationOrLocation,
  normalizeArtist,
  normalizeShow,
} from "./normalizers";
import type {
  VoicesArtist,
  VoicesArtistRaw,
  VoicesListResponse,
  VoicesStation,
  VoicesShow,
  VoicesShowRaw,
  VoicesWebsiteRail,
  VoicesWebsiteRailRaw,
} from "./types";

type SearchParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function voicesUrl(path: string, searchParams: SearchParams = {}) {
  const url = new URL(path, VOICES_API_BASE_URL);

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function voicesFetch<T>(path: string, searchParams?: SearchParams) {
  const response = await fetch(voicesUrl(path, searchParams), {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Voices API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function unwrapList<T>(payload: T[] | VoicesListResponse<T>) {
  return Array.isArray(payload) ? payload : payload.items;
}

async function joinArtistsForShows(rawShows: VoicesShowRaw[]) {
  const artistIds = Array.from(
    new Set(rawShows.map(getArtistIdFromShow).filter(Boolean)),
  ) as string[];

  const artists = await Promise.all(
    artistIds.map(async (artistId) => {
      try {
        return await getArtist(artistId);
      } catch {
        return null;
      }
    }),
  );

  return new Map(
    artists
      .filter((artist): artist is VoicesArtist => Boolean(artist))
      .map((artist) => [artist.id, artist]),
  );
}

export async function getArtists({
  optimized = true,
}: {
  optimized?: boolean;
} = {}) {
  const payload = await voicesFetch<
    VoicesArtistRaw[] | VoicesListResponse<VoicesArtistRaw>
  >(optimized ? "/api/artists/optimized" : "/api/artists");

  return unwrapList(payload).map(normalizeArtist);
}

export async function getArtist(id: string) {
  const artist = await voicesFetch<VoicesArtistRaw>(`/api/artists/${id}`);
  return normalizeArtist(artist);
}

export async function getShows({
  artistId,
  featured,
  station,
  location,
  limit = VOICES_DEFAULT_INDEX_LIMIT,
  skip = 0,
  includeArtistFallbacks = true,
}: {
  artistId?: string;
  featured?: boolean;
  station?: VoicesStation;
  location?: string;
  limit?: number;
  skip?: number;
  includeArtistFallbacks?: boolean;
} = {}) {
  const fetchLimit = Math.min(Math.max(limit * 3, limit), 100);
  const rawShows = await voicesFetch<VoicesShowRaw[]>("/api/shows", {
    artist: artistId,
    featured,
    station,
    location,
    limit: fetchLimit,
    skip,
  });
  const publicShows = rawShows.filter(isPublicMatchedShow);
  const artistsById = includeArtistFallbacks
    ? await joinArtistsForShows(publicShows)
    : new Map<string, VoicesArtist>();

  return publicShows
    .slice(0, limit)
    .map((show) =>
      normalizeShow(show, artistsById.get(getArtistIdFromShow(show) ?? "")),
    )
    .filter((show) => matchesStationOrLocation(show, station ?? location));
}

export async function getFeaturedShows({
  limit = VOICES_DEFAULT_FEATURED_LIMIT,
}: {
  limit?: number;
} = {}) {
  const rawShows = await voicesFetch<VoicesShowRaw[]>(
    "/api/artists/featured/shows",
    { limit },
  );

  return rawShows
    .filter(isPublicMatchedShow)
    .map((show) => normalizeShow(show));
}

export async function getShow(id: string) {
  const rawShow = await voicesFetch<VoicesShowRaw>(`/api/shows/${id}`);

  if (!isPublicMatchedShow(rawShow)) {
    return null;
  }

  const artistId = getArtistIdFromShow(rawShow);
  const artist = artistId ? await getArtist(artistId).catch(() => null) : null;

  return normalizeShow(rawShow, artist ?? undefined);
}

export async function getShowForCuration(id: string) {
  const rawShow = await voicesFetch<VoicesShowRaw>(`/api/shows/${id}`);
  const artistId = getArtistIdFromShow(rawShow);
  const artist = artistId ? await getArtist(artistId).catch(() => null) : null;

  return normalizeShow(rawShow, artist ?? undefined);
}

export async function getShowsForArtist(
  artistId: string,
  { limit = VOICES_DEFAULT_FEATURED_LIMIT }: { limit?: number } = {},
) {
  return getShows({ artistId, limit, includeArtistFallbacks: false });
}

function normalizeWebsiteRail(
  rawRail: VoicesWebsiteRailRaw,
): VoicesWebsiteRail {
  return {
    key: rawRail.key,
    title: rawRail.title,
    description: rawRail.description ?? "",
    station: rawRail.station ?? "unknown",
    pagePlacement: rawRail.pagePlacement ?? [],
    shows: (rawRail.items ?? [])
      .filter(
        (item): item is VoicesShowRaw =>
          typeof item === "object" && item !== null && "_id" in item,
      )
      .filter(isPublicMatchedShow)
      .map((show) => normalizeShow(show)),
  };
}

function fallbackRail(
  key: string,
  title: string,
  description: string,
  shows: VoicesShow[],
  start: number,
): VoicesWebsiteRail {
  return {
    key,
    title,
    description,
    station: "unknown",
    pagePlacement: ["home", "explore"],
    shows: shows.slice(start, start + VOICES_DEFAULT_FEATURED_LIMIT),
  };
}

export async function getWebsiteRails() {
  try {
    const payload = await voicesFetch<
      VoicesWebsiteRailRaw[] | VoicesListResponse<VoicesWebsiteRailRaw>
    >("/api/website/rails");

    const rails = unwrapList(payload)
      .filter((rail) => rail.published !== false)
      .map(normalizeWebsiteRail);

    if (rails.length) return rails;
  } catch {
    // The website rails endpoint is planned but not required for local preview.
  }

  const shows = await getShows({ limit: 40 });
  const defaultDescription =
    "The Voices team has picked notable shows from the recent weeks ranging from exciting guests to curious mixes. List updated regularly.";

  return [
    fallbackRail("latest_kx", "Latest on KX", defaultDescription, shows, 0),
    fallbackRail("latest_east", "Latest on EAST", defaultDescription, shows, 5),
    fallbackRail("featured", "Featured", defaultDescription, shows, 0),
    fallbackRail(
      "producer_picks",
      "Producer Picks",
      "A list of highlights from the recent weeks picked by our team of producers.",
      shows,
      10,
    ),
    fallbackRail(
      "monthly_highlights",
      "May Highlights",
      defaultDescription,
      shows,
      15,
    ),
    fallbackRail(
      "independent_label_market",
      "Independent Label Market",
      "Shows that aired as part of the annual event at the Coal Drops Yard",
      shows,
      20,
    ),
    fallbackRail(
      "voices_global_community",
      "Voices Global Community",
      "Shows from our hosts around the world.",
      shows,
      25,
    ),
  ];
}
