"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  getVoicesLiveStation,
  voicesMediaConfig,
  type VoicesLiveStationId,
} from "@/lib/voices/config";
import {
  normalizeRadioCultLiveMetadata,
  type RadioCultLiveResponse,
  type VoicesLiveMetadata,
} from "@/lib/voices/radio-cult";

export default function useRadioCultLiveMetadata(
  stationId: VoicesLiveStationId,
) {
  const fallback = useMemo(
    () => normalizeRadioCultLiveMetadata(stationId),
    [stationId],
  );
  const [metadata, setMetadata] = useState<VoicesLiveMetadata>(fallback);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/radio-cult/live?station=${stationId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: VoicesLiveMetadata | null) => {
        if (!cancelled && payload) setMetadata(payload);
      })
      .catch(() => {
        if (!cancelled) setMetadata(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [fallback, stationId]);

  useEffect(() => {
    const station = getVoicesLiveStation(stationId);
    const apiKey = voicesMediaConfig.radioCultApiKey;

    if (!station?.radioCultStationId || !apiKey) return;

    const socket: Socket = io(voicesMediaConfig.radioCultApiBaseUrl, {
      auth: { "x-api-key": apiKey },
      query: { stationId: station.radioCultStationId },
      transports: ["websocket", "polling"],
    });

    socket.on("player-metadata", (payload: RadioCultLiveResponse) => {
      setMetadata(normalizeRadioCultLiveMetadata(stationId, payload));
    });

    return () => {
      socket.disconnect();
    };
  }, [stationId]);

  return metadata;
}
