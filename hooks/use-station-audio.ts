"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export const LIVE_AUDIO_STOP_EVENT = "voices:stop-live-audio";
export const LIVE_AUDIO_PLAY_EVENT = "voices:play-live-audio";

export function stopLiveAudio(playerId?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(LIVE_AUDIO_STOP_EVENT, {
      detail: playerId ? { playerId } : {},
    }),
  );
}

export function playLiveAudio(playerId: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(LIVE_AUDIO_PLAY_EVENT, { detail: { playerId } }),
  );
}

// A live stream never legitimately ends or stalls for long. When it does
// (network blip, iOS suspending the page, a call/notification taking audio
// focus) we reconnect instead of leaving the UI claiming it is playing.
const STALL_TIMEOUT_MS = 8_000;
const MAX_RECONNECT_ATTEMPTS = 6;
const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 15_000;

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
  // What the listener asked for, as opposed to what the element is doing right
  // now. The browser pauses the element on interruptions the user never asked
  // for; this lets us tell those apart from a deliberate stop.
  const wantPlayingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number>();
  const stallTimerRef = useRef<number>();

  const clearTimers = useCallback(() => {
    window.clearTimeout(reconnectTimerRef.current);
    window.clearTimeout(stallTimerRef.current);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !streamUrl || playing) return;

    wantPlayingRef.current = true;
    try {
      setError(false);
      setLoading(true);
      stopLiveAudio(resolvedPlayerId);
      await audio.play();
      setPlaying(true);
    } catch {
      wantPlayingRef.current = false;
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

      wantPlayingRef.current = false;
      clearTimers();
      audioRef.current?.pause();
      setPlaying(false);
      setLoading(false);
    }

    window.addEventListener(LIVE_AUDIO_STOP_EVENT, stopOtherAudio);

    return () =>
      window.removeEventListener(LIVE_AUDIO_STOP_EVENT, stopOtherAudio);
  }, [clearTimers, resolvedPlayerId]);

  // Keep React state in step with the element, and recover from interruptions.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Drop the dead connection and fetch the current live edge.
    function reconnect() {
      const el = audioRef.current;
      if (!el || !wantPlayingRef.current) return;

      window.clearTimeout(reconnectTimerRef.current);
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        wantPlayingRef.current = false;
        setPlaying(false);
        setLoading(false);
        setError(true);
        return;
      }

      const delay = Math.min(
        RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttemptsRef.current,
        RECONNECT_MAX_DELAY_MS,
      );
      reconnectAttemptsRef.current += 1;
      setLoading(true);
      reconnectTimerRef.current = window.setTimeout(() => {
        const current = audioRef.current;
        if (!current || !wantPlayingRef.current) return;
        current.load();
        current.play().catch(() => reconnect());
      }, delay);
    }

    function armStallTimer() {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = window.setTimeout(reconnect, STALL_TIMEOUT_MS);
    }

    function onPlaying() {
      window.clearTimeout(stallTimerRef.current);
      window.clearTimeout(reconnectTimerRef.current);
      reconnectAttemptsRef.current = 0;
      setError(false);
      setLoading(false);
      setPlaying(true);
    }

    function onWaiting() {
      if (!wantPlayingRef.current) return;
      setLoading(true);
      armStallTimer();
    }

    function onPause() {
      // Our own stop/toggle clears the intent first, so this is an
      // interruption (call, notification, audio focus, OS suspend).
      setPlaying(false);
      if (!wantPlayingRef.current) return;
      audioRef.current?.play().catch(() => {
        // Autoplay rules can refuse until the next gesture; keep the intent so
        // coming back to the page retries, and show the real (paused) state.
      });
    }

    function onDead() {
      if (!wantPlayingRef.current) return;
      setPlaying(false);
      reconnect();
    }

    function resumeIfWanted() {
      const el = audioRef.current;
      if (!el || !wantPlayingRef.current || !el.paused) return;
      reconnectAttemptsRef.current = 0;
      el.play().catch(() => reconnect());
    }

    function onVisibility() {
      if (document.visibilityState === "visible") resumeIfWanted();
    }

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("stalled", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onDead);
    audio.addEventListener("error", onDead);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", resumeIfWanted);
    window.addEventListener("online", resumeIfWanted);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("stalled", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onDead);
      audio.removeEventListener("error", onDead);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", resumeIfWanted);
      window.removeEventListener("online", resumeIfWanted);
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    function playRequestedAudio(event: Event) {
      const detail = (event as CustomEvent<{ playerId?: string }>).detail;
      if (detail?.playerId !== resolvedPlayerId) return;

      void play();
    }

    window.addEventListener(LIVE_AUDIO_PLAY_EVENT, playRequestedAudio);

    return () =>
      window.removeEventListener(LIVE_AUDIO_PLAY_EVENT, playRequestedAudio);
  }, [play, resolvedPlayerId]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (playing) {
      wantPlayingRef.current = false;
      clearTimers();
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
