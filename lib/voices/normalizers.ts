import { enhanceArtworkUrl, resolveShowArtwork } from "./artwork";
import type {
  VoicesArtist,
  VoicesArtistRaw,
  VoicesLocationTag,
  VoicesShow,
  VoicesShowRaw,
  VoicesStation,
} from "./types";

function cleanStrings(values: Array<string | null | undefined> = []) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function normalizeStation(station?: string | null): VoicesStation {
  if (station === "kx" || station === "east" || station === "both") {
    return station;
  }

  return "unknown";
}

function normalizeLocationTags(
  tags: Array<string | null | undefined> = [],
): VoicesLocationTag[] {
  return cleanStrings(tags).map((tag) => tag.toLowerCase());
}

function isMixcloudUrl(url?: string | null) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "mixcloud.com" ||
      parsed.hostname === "www.mixcloud.com"
    );
  } catch {
    return false;
  }
}

export function normalizeArtist(raw: VoicesArtistRaw): VoicesArtist {
  const imageUrl = enhanceArtworkUrl(
    raw.imageUrl ??
      raw.images?.large ??
      raw.images?.medium ??
      raw.images?.small ??
      raw.images?.thumbnail,
  );

  return {
    id: raw._id,
    name: raw.name,
    bio: raw.bio ?? "",
    imageUrl,
    bannerUrl: raw.bannerUrl ?? undefined,
    genres: cleanStrings(raw.genres),
    aliases: cleanStrings(raw.aliases),
    featured: Boolean(raw.featured),
    isActive: raw.isActive ?? true,
    station: normalizeStation(raw.station),
    locationTags: normalizeLocationTags(raw.locationTags),
    mixcloudUsername:
      raw.mixcloudUsername ?? raw.platforms?.mixcloud?.username ?? undefined,
    soundcloudUsername:
      raw.soundcloudUsername ?? raw.platforms?.soundcloud?.pattern ?? undefined,
    socialLinks: raw.socialLinks ?? {},
  };
}

export function getArtistIdFromShow(raw: VoicesShowRaw): string | undefined {
  if (!raw.artistId) return undefined;
  if (typeof raw.artistId === "string") return raw.artistId;
  return raw.artistId._id;
}

export function getPopulatedArtistFromShow(
  raw: VoicesShowRaw,
): VoicesArtist | undefined {
  if (!raw.artistId || typeof raw.artistId === "string") return undefined;
  return normalizeArtist(raw.artistId);
}

export function isPublicMatchedShow(raw: VoicesShowRaw) {
  return raw.matching_status === "matched";
}

export function normalizeShow(
  raw: VoicesShowRaw,
  joinedArtist?: VoicesArtist,
): VoicesShow {
  const artist = joinedArtist ?? getPopulatedArtistFromShow(raw);
  const artistId = artist?.id ?? getArtistIdFromShow(raw);
  const showImageUrl = enhanceArtworkUrl(
    raw.imageUrl ?? raw.metadata?.artwork_url ?? undefined,
  );
  const genres = cleanStrings([
    ...(raw.metadata?.tags ?? []),
    raw.metadata?.genre,
  ]);
  const station = normalizeStation(raw.station ?? artist?.station);
  const locationTags = normalizeLocationTags(
    raw.locationTags?.length ? raw.locationTags : artist?.locationTags,
  );
  const archiveUrl = raw.url ?? raw.mixcloudUrl ?? raw.soundcloudUrl ?? undefined;
  const mixcloudUrl =
    raw.mixcloudUrl ?? (isMixcloudUrl(raw.url) ? raw.url : undefined) ?? undefined;

  return {
    id: raw._id,
    title: raw.title,
    description: raw.description ?? "",
    date: raw.show_date ?? raw.date ?? raw.upload_date ?? undefined,
    duration: raw.duration ?? undefined,
    imageUrl: showImageUrl,
    artwork: resolveShowArtwork({
      showTitle: raw.title,
      showImageUrl,
      artistName: artist?.name,
      artistImageUrl: artist?.imageUrl,
    }),
    artist,
    artistId,
    genres,
    featured: Boolean(raw.featured),
    station,
    locationTags,
    platform: raw.platform,
    archiveUrl,
    mixcloudUrl,
    soundcloudUrl: raw.soundcloudUrl ?? undefined,
    matchingStatus: raw.matching_status,
  };
}

export function deriveGenresFromShows(shows: VoicesShow[]) {
  return cleanStrings(shows.flatMap((show) => show.genres)).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function deriveGenresFromArtists(artists: VoicesArtist[]) {
  return cleanStrings(artists.flatMap((artist) => artist.genres)).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function matchesStationOrLocation(
  item: { station: VoicesStation; locationTags: VoicesLocationTag[] },
  filter?: string,
) {
  if (!filter) return true;
  const normalizedFilter = filter.toLowerCase();

  return (
    item.station === normalizedFilter ||
    item.station === "both" ||
    item.locationTags.includes(normalizedFilter)
  );
}
