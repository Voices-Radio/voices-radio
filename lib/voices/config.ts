export const VOICES_API_BASE_URL =
  process.env.VOICES_API_BASE_URL ?? "https://api.voicesradio.co.uk";

/**
 * Base URL for auth + membership endpoints specifically. Defaults to
 * VOICES_API_BASE_URL — same backend, same behavior — unless overridden
 * separately. Kept distinct so E2E runs can point membership traffic at
 * the stub backend (tests/e2e/stub-backend/server.mjs) without also
 * rerouting unrelated site data (shows, blog, search) that already works
 * fine against the real API in E2E.
 */
export const VOICES_MEMBERSHIP_API_BASE_URL =
  process.env.VOICES_MEMBERSHIP_API_BASE_URL ?? VOICES_API_BASE_URL;

export const VOICES_FALLBACK_ARTWORK = "/VOICESLOGO_LIGHTBOX.png";

export const VOICES_DEFAULT_INDEX_LIMIT = 24;

export const VOICES_DEFAULT_FEATURED_LIMIT = 10;

/** The backend caps paginated artist lists at 100 per page. */
export const VOICES_ARTISTS_PAGE_SIZE = 100;

export const VOICES_APPLY_FOR_SHOW_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdlV09iFlcP2_n6ldRsSUoeZclzJpb0AMY4F2rrXUpC7jueZQ/viewform";

export const VOICES_MIXCLOUD_LIVE_URL =
  "https://www.mixcloud.com/live/VoicesRadio/";

export type VoicesLiveStationId = "kx" | "east";

/**
 * Where a station's stream, now-playing and schedule come from. Airtime is the
 * source of truth until RadioCult is ready and producers are trained.
 */
export type VoicesLiveSource = "airtime" | "radiocult";

/** Anything other than "radiocult" means Airtime, so a typo can't blank KX. */
export function resolveLiveSource(value: string | undefined): VoicesLiveSource {
  return value?.trim().toLowerCase() === "radiocult" ? "radiocult" : "airtime";
}

export type VoicesLiveStationConfig = {
  id: VoicesLiveStationId;
  label: "KX" | "EAST";
  title: string;
  liveSource: VoicesLiveSource;
  radioCultStationId?: string;
  streamUrl?: string;
  videoUrl?: string;
  comingSoon?: boolean;
};

export const voicesMediaConfig = {
  radioCultApiBaseUrl:
    process.env.RADIOCULT_API_BASE_URL ?? "https://api.radiocult.fm",
  radioCult: {
    kxStationId: process.env.NEXT_PUBLIC_RADIOCULT_KX_STATION_ID,
    eastStationId: process.env.NEXT_PUBLIC_RADIOCULT_EAST_STATION_ID,
    kxStreamUrl: process.env.NEXT_PUBLIC_RADIOCULT_KX_STREAM_URL,
    eastStreamUrl: process.env.NEXT_PUBLIC_RADIOCULT_EAST_STREAM_URL,
  },
  airtime: {
    // Server-only: read by the /api routes, never by the browser bundle.
    apiBaseUrl:
      process.env.AIRTIME_API_BASE_URL ?? "https://voicesradio.airtime.pro",
    kxStreamUrl:
      process.env.NEXT_PUBLIC_AIRTIME_KX_STREAM_URL ??
      "https://voicesradio.out.airtime.pro/voicesradio_a",
  },
  restream: {
    kxEmbedUrl: process.env.NEXT_PUBLIC_RESTREAM_KX_EMBED_URL,
    eastEmbedUrl: process.env.NEXT_PUBLIC_RESTREAM_EAST_EMBED_URL,
  },
};

// Flip KX to RadioCult by setting NEXT_PUBLIC_VOICES_KX_LIVE_SOURCE=radiocult
// and redeploying (NEXT_PUBLIC_ values are inlined at build time).
const kxLiveSource = resolveLiveSource(
  process.env.NEXT_PUBLIC_VOICES_KX_LIVE_SOURCE,
);

export const voicesLiveStations: VoicesLiveStationConfig[] = [
  {
    id: "kx",
    label: "KX",
    title: "Live from Voices KX",
    liveSource: kxLiveSource,
    radioCultStationId: voicesMediaConfig.radioCult.kxStationId,
    streamUrl:
      kxLiveSource === "airtime"
        ? voicesMediaConfig.airtime.kxStreamUrl
        : voicesMediaConfig.radioCult.kxStreamUrl,
    videoUrl: voicesMediaConfig.restream.kxEmbedUrl,
  },
  {
    id: "east",
    label: "EAST",
    title: "Live from Voices East",
    liveSource: "radiocult",
    radioCultStationId: voicesMediaConfig.radioCult.eastStationId,
    streamUrl: voicesMediaConfig.radioCult.eastStreamUrl,
    videoUrl: voicesMediaConfig.restream.eastEmbedUrl,
    comingSoon: true,
  },
];

export function getVoicesLiveStation(id: VoicesLiveStationId) {
  return voicesLiveStations.find((station) => station.id === id);
}

export function getVoicesHeaderPlayerId(id: VoicesLiveStationId) {
  return `voices-live-header:${id}`;
}
