import {
  getVoicesLiveStation,
  voicesMediaConfig,
  type VoicesLiveStationId,
} from "./config";

export type RadioCultLiveStatus = "schedule" | "offAir" | "defaultPlaylist";

type RadioCultArtwork = {
  original?: string;
  default?: string;
  "512x512"?: string;
  "256x256"?: string;
  "128x128"?: string;
};

type RadioCultArtist = {
  name?: string;
  logo?: RadioCultArtwork;
};

type RadioCultScheduleContent = {
  id?: string;
  title?: string;
  description?: unknown;
  startDateUtc?: string;
  endDateUtc?: string;
  startDate?: string;
  endDate?: string;
  artist?: RadioCultArtist;
  artists?: RadioCultArtist[];
};

type RadioCultMetadata = {
  title?: string;
  artist?: string;
  artwork?: RadioCultArtwork;
};

export type RadioCultLiveResponse = {
  status?: RadioCultLiveStatus;
  content?: RadioCultScheduleContent | null;
  metadata?: RadioCultMetadata | null;
  musicRecognition?: RadioCultMetadata | null;
};

export type VoicesLiveMetadata = {
  stationId: VoicesLiveStationId;
  stationLabel: string;
  status: RadioCultLiveStatus | "unknown";
  title: string;
  subtitle: string;
  artwork?: string;
  starts?: string;
  ends?: string;
};

export type RadioCultScheduleEvent = {
  id?: string;
  title?: string;
  description?: unknown;
  startDateUtc?: string;
  endDateUtc?: string;
  startDate?: string;
  endDate?: string;
};

export function getRadioCultHeaders() {
  const apiKey = voicesMediaConfig.radioCultApiKey;

  if (!apiKey) return null;

  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
}

export function getRadioCultStationId(stationId: VoicesLiveStationId) {
  return getVoicesLiveStation(stationId)?.radioCultStationId;
}

export function getRadioCultApiUrl(path: string) {
  return `${voicesMediaConfig.radioCultApiBaseUrl}${path}`;
}

function pickArtwork(artwork?: RadioCultArtwork) {
  return (
    artwork?.["512x512"] ??
    artwork?.["256x256"] ??
    artwork?.default ??
    artwork?.original ??
    artwork?.["128x128"]
  );
}

function textFromTipTap(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const node = value as { text?: unknown; content?: unknown };
  const ownText = typeof node.text === "string" ? node.text : "";
  const childText = Array.isArray(node.content)
    ? node.content.map(textFromTipTap).join(" ")
    : "";

  return [ownText, childText].filter(Boolean).join(" ").replace(/\s+/g, " ");
}

export function normalizeRadioCultLiveMetadata(
  stationId: VoicesLiveStationId,
  payload?: RadioCultLiveResponse | null,
): VoicesLiveMetadata {
  const station = getVoicesLiveStation(stationId);
  const content = payload?.content ?? null;
  const metadata = payload?.musicRecognition ?? payload?.metadata ?? null;
  const artist = content?.artists?.[0] ?? content?.artist;
  const title =
    content?.title ??
    metadata?.title ??
    (payload?.status === "offAir" ? "Station offline" : station?.title) ??
    "Voices Radio";
  const subtitle =
    artist?.name ??
    metadata?.artist ??
    textFromTipTap(content?.description) ??
    station?.label ??
    "Voices Radio";

  return {
    stationId,
    stationLabel: station?.label ?? stationId.toUpperCase(),
    status: payload?.status ?? "unknown",
    title,
    subtitle,
    artwork: pickArtwork(metadata?.artwork) ?? pickArtwork(artist?.logo),
    starts: content?.startDateUtc ?? content?.startDate,
    ends: content?.endDateUtc ?? content?.endDate,
  };
}

export async function fetchRadioCultLiveMetadata(
  stationId: VoicesLiveStationId,
) {
  const radioCultStationId = getRadioCultStationId(stationId);
  const headers = getRadioCultHeaders();

  if (!radioCultStationId || !headers) {
    return normalizeRadioCultLiveMetadata(stationId);
  }

  const response = await fetch(
    getRadioCultApiUrl(`/api/station/${radioCultStationId}/schedule/live`),
    { headers, next: { revalidate: 30 } },
  );

  if (!response.ok) {
    throw new Error(`Radio Cult live request failed: ${response.status}`);
  }

  return normalizeRadioCultLiveMetadata(stationId, await response.json());
}
