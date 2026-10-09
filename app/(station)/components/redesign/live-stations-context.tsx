"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getVoicesLiveStation,
  type VoicesLiveStationId,
} from "@/lib/voices/config";
import {
  normalizeRadioCultLiveMetadata,
  type VoicesLiveMetadata,
} from "@/lib/voices/radio-cult";

const STATION_IDS: VoicesLiveStationId[] = ["kx", "east"];
const POLL_INTERVAL_MS = 30_000;

type LiveStations = Record<VoicesLiveStationId, VoicesLiveMetadata>;

function fallbackStations(): LiveStations {
  return {
    kx: normalizeRadioCultLiveMetadata("kx"),
    east: normalizeRadioCultLiveMetadata("east"),
  };
}

const LiveStationsContext = createContext<LiveStations | null>(null);

async function fetchStation(stationId: VoicesLiveStationId) {
  const response = await fetch(`/api/radio-cult/live?station=${stationId}`);
  if (!response.ok) return null;
  return (await response.json()) as VoicesLiveMetadata;
}

/**
 * One shared live-metadata feed for the whole shell. Previously every
 * component that showed "now playing" opened its own socket.io connection with
 * the RadioCult API key shipped to the browser; the mobile and desktop strips
 * both mount (CSS hides one), so a page held 4–6 sockets.
 *
 * Now the key stays server-side: /api/radio-cult/live proxies RadioCult and is
 * CDN-cached for 30s, so this poll costs one upstream call per 30s however many
 * visitors there are. Polling pauses while the tab is hidden.
 */
export function LiveStationsProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<LiveStations>(fallbackStations);

  useEffect(() => {
    let cancelled = false;
    const active = STATION_IDS.filter(
      (id) => getVoicesLiveStation(id)?.radioCultStationId,
    );
    if (active.length === 0) return;

    async function refresh() {
      const results = await Promise.all(
        active.map((id) => fetchStation(id).catch(() => null)),
      );
      if (cancelled) return;
      setStations((prev) => {
        const next = { ...prev };
        active.forEach((id, index) => {
          const result = results[index];
          if (result) next[id] = result;
        });
        return next;
      });
    }

    let timer: number | undefined;
    function start() {
      refresh();
      timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    }
    function stop() {
      window.clearInterval(timer);
    }
    function handleVisibility() {
      stop();
      if (document.visibilityState === "visible") start();
    }

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const value = useMemo(() => stations, [stations]);

  return (
    <LiveStationsContext.Provider value={value}>
      {children}
    </LiveStationsContext.Provider>
  );
}

/** Falls back to static metadata when rendered outside the provider. */
export function useLiveStation(stationId: VoicesLiveStationId) {
  const stations = useContext(LiveStationsContext);
  return useMemo(
    () => stations?.[stationId] ?? normalizeRadioCultLiveMetadata(stationId),
    [stations, stationId],
  );
}
