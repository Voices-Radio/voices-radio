export const VOICES_API_BASE_URL =
  process.env.VOICES_API_BASE_URL ?? "https://api.voicesradio.co.uk";

export const VOICES_FALLBACK_ARTWORK = "/VOICESLOGO_LIGHTBOX.png";

export const VOICES_DEFAULT_INDEX_LIMIT = 24;

export const VOICES_DEFAULT_FEATURED_LIMIT = 10;

export const VOICES_APPLY_FOR_SHOW_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdlV09iFlcP2_n6ldRsSUoeZclzJpb0AMY4F2rrXUpC7jueZQ/viewform";

export type VoicesLiveStationId = "kx" | "east";

export type VoicesLiveStationConfig = {
  id: VoicesLiveStationId;
  label: "KX" | "EAST";
  title: string;
  radioCultStationId?: string;
  streamUrl?: string;
  videoUrl?: string;
  comingSoon?: boolean;
};

export const voicesMediaConfig = {
  radioCultApiBaseUrl:
    process.env.RADIOCULT_API_BASE_URL ?? "https://api.radiocult.fm",
  radioCultApiKey: process.env.NEXT_PUBLIC_RADIOCULT_API_KEY,
  radioCult: {
    kxStationId: process.env.NEXT_PUBLIC_RADIOCULT_KX_STATION_ID,
    eastStationId: process.env.NEXT_PUBLIC_RADIOCULT_EAST_STATION_ID,
    kxStreamUrl: process.env.NEXT_PUBLIC_RADIOCULT_KX_STREAM_URL,
    eastStreamUrl: process.env.NEXT_PUBLIC_RADIOCULT_EAST_STREAM_URL,
  },
  restream: {
    kxEmbedUrl: process.env.NEXT_PUBLIC_RESTREAM_KX_EMBED_URL,
    eastEmbedUrl: process.env.NEXT_PUBLIC_RESTREAM_EAST_EMBED_URL,
  },
};

export const voicesLiveStations: VoicesLiveStationConfig[] = [
  {
    id: "kx",
    label: "KX",
    title: "Live from Voices KX",
    radioCultStationId: voicesMediaConfig.radioCult.kxStationId,
    streamUrl: voicesMediaConfig.radioCult.kxStreamUrl,
    videoUrl: voicesMediaConfig.restream.kxEmbedUrl,
  },
  {
    id: "east",
    label: "EAST",
    title: "Live from Voices East",
    radioCultStationId: voicesMediaConfig.radioCult.eastStationId,
    streamUrl: voicesMediaConfig.radioCult.eastStreamUrl,
    videoUrl: voicesMediaConfig.restream.eastEmbedUrl,
    comingSoon: true,
  },
];

export function getVoicesLiveStation(id: VoicesLiveStationId) {
  return voicesLiveStations.find((station) => station.id === id);
}
