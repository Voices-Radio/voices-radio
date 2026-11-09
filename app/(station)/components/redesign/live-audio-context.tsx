"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  getVoicesHeaderPlayerId,
  getVoicesLiveStation,
  type VoicesLiveStationId,
} from "@/lib/voices/config";
import useStationAudio from "@/hooks/use-station-audio";

export type LiveAudioState = {
  error: boolean;
  loading: boolean;
  playing: boolean;
  toggle: () => Promise<void>;
};

type LiveAudio = Record<VoicesLiveStationId, LiveAudioState>;

const LiveAudioContext = createContext<LiveAudio | null>(null);

function StationAudioElement({
  stationId,
  audioRef,
}: {
  stationId: VoicesLiveStationId;
  audioRef: React.RefObject<HTMLAudioElement>;
}) {
  return (
    <audio
      ref={audioRef}
      src={getVoicesLiveStation(stationId)?.streamUrl}
      preload="none"
    />
  );
}

/**
 * Owns the one <audio> element per live station.
 *
 * The mobile and desktop strips both mount (CSS hides one). When each called
 * useStationAudio itself, there were two <audio> elements sharing one player
 * id, so "Listen live" started both and neither stopped the other. Every
 * surface (both strips and the KX card) now reads this single instance.
 */
export function LiveAudioProvider({ children }: { children: ReactNode }) {
  const kx = useStationAudio(
    getVoicesLiveStation("kx")?.streamUrl,
    getVoicesHeaderPlayerId("kx"),
  );
  const east = useStationAudio(
    getVoicesLiveStation("east")?.streamUrl,
    getVoicesHeaderPlayerId("east"),
  );

  const value = useMemo<LiveAudio>(
    () => ({
      kx: {
        error: kx.error,
        loading: kx.loading,
        playing: kx.playing,
        toggle: kx.toggle,
      },
      east: {
        error: east.error,
        loading: east.loading,
        playing: east.playing,
        toggle: east.toggle,
      },
    }),
    // toggle is recreated every render by the hook, so key on state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kx.error, kx.loading, kx.playing, east.error, east.loading, east.playing],
  );

  return (
    <LiveAudioContext.Provider value={value}>
      <StationAudioElement stationId="kx" audioRef={kx.audioRef} />
      <StationAudioElement stationId="east" audioRef={east.audioRef} />
      {children}
    </LiveAudioContext.Provider>
  );
}

export function useLiveAudio(stationId: VoicesLiveStationId): LiveAudioState {
  const context = useContext(LiveAudioContext);
  if (!context) {
    throw new Error("useLiveAudio must be used inside <LiveAudioProvider>");
  }
  return context[stationId];
}
