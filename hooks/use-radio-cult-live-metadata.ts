"use client";

import { useLiveStation } from "@/app/(station)/components/redesign/live-stations-context";
import type { VoicesLiveStationId } from "@/lib/voices/config";

/**
 * Live metadata for a station, read from the shell's shared feed
 * (LiveStationsProvider). Kept as a hook so call sites stay unchanged.
 */
export default function useRadioCultLiveMetadata(
  stationId: VoicesLiveStationId,
) {
  return useLiveStation(stationId);
}
