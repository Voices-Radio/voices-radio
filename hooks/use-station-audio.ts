"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const STOP_EVENT = "voices:stop-live-audio";
const PLAY_EVENT = "voices:play-live-audio";

export function stopLiveAudio(playerId?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(STOP_EVENT, { detail: playerId ? { playerId } : {} }),
  );
}

export function playLiveAudio(playerId: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: { playerId } }));
}

export default function useStationAudio(
  streamUrl?: string,
  externalPlayerId?: string,
) {
  const generatedPlayerId = useId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const resolvedPlayerId = externalPlayerId ?? generatedPlayerId;

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !streamUrl || playing) return;

    try {
      setError(false);
      setLoading(true);
      stopLiveAudio(resolvedPlayerId);
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [playing, resolvedPlayerId, streamUrl]);

  useEffect(() => {
    function stopOtherAudio(event: Event) {
      const detail = (event as CustomEvent<{ playerId?: string }>).detail;
      if (detail?.playerId === resolvedPlayerId) return;

      audioRef.current?.pause();
      setPlaying(false);
      setLoading(false);
    }

    window.addEventListener(STOP_EVENT, stopOtherAudio);

    return () => window.removeEventListener(STOP_EVENT, stopOtherAudio);
  }, [resolvedPlayerId]);

  useEffect(() => {
    function playRequestedAudio(event: Event) {
      const detail = (event as CustomEvent<{ playerId?: string }>).detail;
      if (detail?.playerId !== resolvedPlayerId) return;

      void play();
    }

    window.addEventListener(PLAY_EVENT, playRequestedAudio);

    return () => window.removeEventListener(PLAY_EVENT, playRequestedAudio);
  }, [play, resolvedPlayerId]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    await play();
  }

  return {
    audioRef,
    error,
    loading,
    playing,
    toggle,
  };
}
