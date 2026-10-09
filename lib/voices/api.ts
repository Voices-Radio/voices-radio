import "server-only";

import {
  VOICES_API_BASE_URL,
  VOICES_ARTISTS_PAGE_SIZE,
  VOICES_DEFAULT_FEATURED_LIMIT,
  VOICES_DEFAULT_INDEX_LIMIT,
} from "./config";
import {
  getArtistIdFromShow,
  getPopulatedArtistFromShow,
  isPublicMatchedShow,
  matchesStationOrLocation,
  normalizeArtist,
  normalizeShow,
} from "./normalizers";
import { getGenreRegexPatterns } from "./genre-taxonomy";
import type {
  VoicesArtist,
  VoicesArtistRaw,
  VoicesListResponse,
  VoicesStation,
  VoicesShow,
  VoicesShowRaw,
} from "./types";

type SearchParamValue = string | number | boolean;
type SearchParams = Record<
  string,
  SearchParamValue | SearchParamValue[] | null | undefined
>;

function voicesUrl(path: string, searchParams: SearchParams = {}) {
  const url = new URL(path, VOICES_API_BASE_URL);

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== "") {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((item) => url.searchParams.append(key, String(item)));
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
    throw new VoicesApiError(response.status);
  }

  return response.json() as Promise<T>;
}

/** Carries the upstream status so callers can tell "no such record" from "backend down". */
export class VoicesApiError extends Error {
  constructor(readonly status: number) {
    super(`Voices API request failed: ${status}`);
  }
}

/**
 * 400 (malformed id) and 404 mean the record does not exist; anything else is
 * a fault. Detail pages are cached (ISR), so treating a 5xx as "not found"
 * would pin a 404 on a perfectly good page for the whole revalidate window.
 */
function isMissingRecord(error: unknown) {
  return (
    error instanceof VoicesApiError &&
    (error.status === 404 || error.status === 400)
  );
}

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

/**
 * Ids are Mongo ObjectIds. The backend answers a malformed one with a 500
 * (a cast error), which would read as an outage — so reject it here as
 * "no such record" before spending a request.
 */
async function nullIfMissing<T>(
  id: string,
  request: () => Promise<T>,
): Promise<T | null> {
  if (!OBJECT_ID_PATTERN.test(id)) return null;

  try {
    return await request();
  } catch (error) {
    if (isMissingRecord(error)) return null;
    throw error;
  }
}

function unwrapList<T>(payload: T[] | VoicesListResponse<T>) {
  return Array.isArray(payload) ? payload : payload.items;
}

async function joinArtistsForShows(rawShows: VoicesShowRaw[]) {
  // Only shows whose artist the backend did NOT embed need a follow-up fetch.
  // The list endpoints now embed name/avatar/banner, which previously cost one
  // GET /api/artists/:id per distinct artist on every list render.
  const artistIds = Array.from(
    new Set(
      rawShows
        .filter((show) => !getPopulatedArtistFromShow(show))
        .map(getArtistIdFromShow)
        .filter(Boolean),
    ),
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
  // The endpoint is paginated (default 20 per page), so page through every
  // result — a single request silently capped the site at 20 artists.
  const path = optimized ? "/api/artists/optimized" : "/api/artists";
  const fetchPage = (page: number) =>
    voicesFetch<VoicesArtistRaw[] | VoicesListResponse<VoicesArtistRaw>>(path, {
      page,
      limit: VOICES_ARTISTS_PAGE_SIZE,
    });

  const firstPage = await fetchPage(1);
  const totalPages = Array.isArray(firstPage)
    ? 1
    : (firstPage.pagination?.pages ?? 1);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
      fetchPage(i + 2),
    ),
  );

  return [firstPage, ...remainingPages]
    .flatMap((payload) => unwrapList(payload))
    .map(normalizeArtist);
}

export async function getArtist(id: string) {
  const artist = await nullIfMissing(id, () =>
    voicesFetch<VoicesArtistRaw>(`/api/artists/${id}`),
  );
  return artist ? normalizeArtist(artist) : null;
}

export async function getShows({
  artistId,
  featured,
  genres,
  station,
  location,
  limit = VOICES_DEFAULT_INDEX_LIMIT,
  skip = 0,
  includeArtistFallbacks = true,
}: {
  artistId?: string;
  featured?: boolean;
  genres?: string[];
  station?: VoicesStation;
  location?: string;
  limit?: number;
  skip?: number;
  includeArtistFallbacks?: boolean;
} = {}) {
  const fetchLimit = Math.min(Math.max(limit * 3, limit), 100);
  const genrePatterns = getGenreRegexPatterns(genres ?? []);
  const rawShows = genrePatterns.length
    ? unwrapList(
        await voicesFetch<VoicesListResponse<VoicesShowRaw>>(
          "/api/shows/optimized",
          {
            artistId,
            featured,
            genres: genrePatterns,
            page: Math.floor(skip / fetchLimit) + 1,
            limit: fetchLimit,
          },
        ),
      )
    : await voicesFetch<VoicesShowRaw[]>("/api/shows", {
        artistId,
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

/** Embedded artist when the backend sent one, else a single follow-up fetch. */
async function resolveShowArtist(rawShow: VoicesShowRaw) {
  if (getPopulatedArtistFromShow(rawShow)) return undefined;

  const artistId = getArtistIdFromShow(rawShow);
  if (!artistId) return undefined;

  return (await getArtist(artistId).catch(() => null)) ?? undefined;
}

export async function getShow(id: string) {
  const rawShow = await nullIfMissing(id, () =>
    voicesFetch<VoicesShowRaw>(`/api/shows/${id}`),
  );

  if (!rawShow || !isPublicMatchedShow(rawShow)) {
    return null;
  }

  return normalizeShow(rawShow, await resolveShowArtist(rawShow));
}

export async function getShowForCuration(id: string) {
  const rawShow = await voicesFetch<VoicesShowRaw>(`/api/shows/${id}`);
  return normalizeShow(rawShow, await resolveShowArtist(rawShow));
}

/**
 * Curated shows by id in ONE request (backend `?ids=`), replacing a
 * GET /api/shows/:id (+ artist) per show on the homepage.
 *
 * Returns a map of the shows it could resolve. Defensive about an older
 * backend that ignores `ids` and returns the latest shows instead: results are
 * filtered to the ids asked for, and the caller falls back to per-id fetches
 * for anything missing.
 */
export async function getShowsForCuration(ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const found = new Map<string, VoicesShow>();
  if (unique.length === 0) return found;

  const wanted = new Set(unique);
  const raws = await voicesFetch<VoicesShowRaw[]>("/api/shows", {
    ids: unique.join(","),
    limit: unique.length,
  });

  const matched = raws.filter((raw) => wanted.has(raw._id));
  const artistsById = await joinArtistsForShows(matched);

  for (const raw of matched) {
    found.set(
      raw._id,
      normalizeShow(raw, artistsById.get(getArtistIdFromShow(raw) ?? "")),
    );
  }

  return found;
}

export async function getShowsForArtist(
  artistId: string,
  { limit = VOICES_DEFAULT_FEATURED_LIMIT }: { limit?: number } = {},
) {
  return getShows({ artistId, limit, includeArtistFallbacks: false });
}
