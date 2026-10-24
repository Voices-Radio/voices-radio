import { unescapeString } from "@/lib/unescape";
import { getVoicesLiveStation, voicesMediaConfig } from "./config";
import type { VoicesLiveStationId } from "./config";
import { fetchLiveShowArtistImage } from "./live-show-artist";
import type { RadioCultScheduleEvent, VoicesLiveMetadata } from "./radio-cult";

/**
 * Airtime client. Airtime returns wall-clock times with no offset, in whatever
 * timezone we ask for, so every request asks for UTC and every timestamp is
 * read as UTC.
 */

type AirtimeShow = {
  name?: string;
  id?: number;
  instance_id?: number;
  starts?: string;
  ends?: string;
};

type AirtimeTrack = { name?: string; type?: string };

export type AirtimeLiveResponse = {
  shows?: { current?: AirtimeShow | null };
  tracks?: { current?: AirtimeTrack | null };
};

export function parseAirtimeTime(value: string | undefined) {
  if (!value) return null;
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getApiUrl(path: string) {
  return `${voicesMediaConfig.airtime.apiBaseUrl}${path}`;
}

export function normalizeAirtimeLiveMetadata(
  stationId: VoicesLiveStationId,
  payload?: AirtimeLiveResponse | null,
): VoicesLiveMetadata {
  const station = getVoicesLiveStation(stationId);
  const stationLabel = station?.label ?? stationId.toUpperCase();
  const stationTitle = station?.title ?? "Voices Radio";
  const show = payload?.shows?.current;
  const track = payload?.tracks?.current;

  if (show?.name) {
    return {
      stationId,
      stationLabel,
      status: "schedule",
      title: unescapeString(show.name),
      subtitle: stationLabel,
      starts: parseAirtimeTime(show.starts)?.toISOString(),
      ends: parseAirtimeTime(show.ends)?.toISOString(),
    };
  }

  if (track) {
    return {
      stationId,
      stationLabel,
      status: "defaultPlaylist",
      title: track.name ? unescapeString(track.name) : stationTitle,
      subtitle: stationLabel,
    };
  }

  return {
    stationId,
    stationLabel,
    status: payload ? "offAir" : "unknown",
    title: payload ? "Station offline" : stationTitle,
    subtitle: stationLabel,
  };
}

export async function fetchAirtimeLiveMetadata(stationId: VoicesLiveStationId) {
  // No Data Cache: a stale entry once kept yesterday's show on air for hours.
  // /api/live's s-maxage already limits upstream calls at the CDN.
  const response = await fetch(getApiUrl("/api/live-info-v2?timezone=UTC"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Airtime live request failed: ${response.status}`);
  }

  const payload = (await response.json()) as AirtimeLiveResponse | null;

  // Never turn an unrecognised response into "off air".
  if (!payload || typeof payload !== "object" || !("shows" in payload)) {
    throw new Error("Airtime live response had an unexpected shape");
  }

  const metadata = normalizeAirtimeLiveMetadata(stationId, payload);
  if (metadata.status !== "schedule") return metadata;

  const artwork = await fetchLiveShowArtistImage(metadata.title);
  return artwork ? { ...metadata, artwork } : metadata;
}

/**
 * Every show in this week and next as one flat list. Airtime's own day keys are
 * ignored: it buckets by the station's local day whatever timezone we ask for
 * (its "monday" starts Sunday 23:00 UTC in BST), so the route re-buckets by the
 * viewer's day instead. `id` is the show and repeats; `instance_id` is unique.
 */
export async function fetchAirtimeSchedule(): Promise<
  RadioCultScheduleEvent[]
> {
  // No Data Cache: a stale entry served an old week (missing today's shows)
  // as "Off air". /api/week-info's s-maxage already limits upstream calls.
  const response = await fetch(getApiUrl("/api/week-info?timezone=UTC"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Airtime schedule request failed: ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown> | null;
  const days = Object.values(payload ?? {}).filter(Array.isArray);

  if (days.length === 0) {
    throw new Error("Airtime schedule response had an unexpected shape");
  }

  const seen = new Set<number>();
  const events: RadioCultScheduleEvent[] = [];

  for (const entry of days.flat() as AirtimeShow[]) {
    const starts = parseAirtimeTime(entry.starts);
    const instanceId = entry.instance_id;
    if (!starts || instanceId === undefined || seen.has(instanceId)) continue;

    seen.add(instanceId);
    events.push({
      id: String(instanceId),
      title: entry.name,
      startDateUtc: starts.toISOString(),
      endDateUtc: parseAirtimeTime(entry.ends)?.toISOString(),
    });
  }

  return events;
}
