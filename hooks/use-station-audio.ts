"use client";

import { useEffect, useId, useRef, useState } from "react";

const STOP_EVENT = "voices:stop-live-audio";

export function stopLiveAudio(playerId?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(STOP_EVENT, { detail: playerId ? { playerId } : {} }),
  );
}

export default function useStationAudio(streamUrl?: string) {
  const playerId = useId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    function stopOtherAudio(event: Event) {
      const detail = (event as CustomEvent<{ playerId?: string }>).detail;
      if (detail?.playerId === playerId) return;

      audioRef.current?.pause();
      setPlaying(false);
      setLoading(false);
    }

    window.addEventListener(STOP_EVENT, stopOtherAudio);

    return () => window.removeEventListener(STOP_EVENT, stopOtherAudio);
  }, [playerId]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setError(false);
      setLoading(true);
      stopLiveAudio(playerId);
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  return {
    audioRef,
    error,
    loading,
    playing,
    toggle,
  };
}
