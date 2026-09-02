"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  LIVE_AUDIO_PLAY_EVENT,
  LIVE_AUDIO_STOP_EVENT,
  stopLiveAudio,
} from "@/hooks/use-station-audio";
import type { VoicesArchiveMedia } from "@/lib/voices/types";

export type ArchivePlayerStatus =
  "idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error";

export type ArchivePlayerCommand = {
  id: number;
  action: "play" | "pause" | "seek";
  /** Target position in seconds. Only set for "seek". */
  position?: number;
};

type ArchiveProgress = {
  position?: number;
  duration?: number;
};

type ArchivePlayerContextValue = {
  activeMedia?: VoicesArchiveMedia;
  status: ArchivePlayerStatus;
  command?: ArchivePlayerCommand;
  progress: ArchiveProgress;
  error?: string;
  playArchive: (media: VoicesArchiveMedia) => void;
  toggleArchive: () => void;
  pauseArchive: () => void;
  seekArchive: (position: number) => void;
  stopArchive: () => void;
  setReady: () => void;
  setPlaying: () => void;
  setPaused: () => void;
  setEnded: () => void;
  setError: (message?: string) => void;
  setProgress: (progress: ArchiveProgress) => void;
  isActiveArchive: (media?: VoicesArchiveMedia) => boolean;
};

const ArchivePlayerContext = createContext<ArchivePlayerContextValue | null>(
  null,
);

export function ArchivePlayerProvider({ children }: { children: ReactNode }) {
  const [activeMedia, setActiveMedia] = useState<
    VoicesArchiveMedia | undefined
  >();
  const [status, setStatus] = useState<ArchivePlayerStatus>("idle");
  const [command, setCommand] = useState<ArchivePlayerCommand | undefined>();
  const [progress, setProgressState] = useState<ArchiveProgress>({});
  const [error, setErrorState] = useState<string | undefined>();
  // A ref, not state: the id only ever exists to let ArchiveWidgetHost dedupe
  // commands it has already applied. Held as state it had to be bumped from
  // inside a setState updater that also called setCommand — an impure updater
  // React is free to invoke twice, which would issue the command twice.
  const commandIdRef = useRef(0);

  const issueCommand = useCallback(
    (action: ArchivePlayerCommand["action"], position?: number) => {
      commandIdRef.current += 1;
      setCommand({ id: commandIdRef.current, action, position });
    },
    [],
  );

  const stopArchive = useCallback(() => {
    setActiveMedia(undefined);
    setStatus("idle");
    setCommand(undefined);
    setProgressState({});
    setErrorState(undefined);
  }, []);

  const playArchive = useCallback(
    (media: VoicesArchiveMedia) => {
      stopLiveAudio();
      setActiveMedia(media);
      setStatus("loading");
      setErrorState(undefined);
      setProgressState({
        duration: media.duration,
      });
      issueCommand("play");
    },
    [issueCommand],
  );

  const pauseArchive = useCallback(() => {
    if (!activeMedia) return;

    setStatus((current) => (current === "idle" ? current : "paused"));
    issueCommand("pause");
  }, [activeMedia, issueCommand]);

  const seekArchive = useCallback(
    (position: number) => {
      if (!activeMedia) return;

      const duration = progress.duration ?? activeMedia.duration;
      if (!duration) return;

      const clamped = Math.min(Math.max(0, position), duration);

      // Move the readout straight away rather than waiting for the widget's
      // next progress event — at up to a second's latency the thumb would
      // otherwise snap back under the user's finger before catching up.
      setProgressState((current) => ({ ...current, position: clamped }));
      issueCommand("seek", clamped);
    },
    [activeMedia, issueCommand, progress.duration],
  );

  const toggleArchive = useCallback(() => {
    if (!activeMedia) return;

    if (status === "playing" || status === "loading") {
      pauseArchive();
      return;
    }

    setStatus("loading");
    issueCommand("play");
  }, [activeMedia, issueCommand, pauseArchive, status]);

  useEffect(() => {
    function stopForLiveAudio(event: Event) {
      const detail = (event as CustomEvent<{ playerId?: string }>).detail;
      if (!detail?.playerId) return;
      stopArchive();
    }

    window.addEventListener(LIVE_AUDIO_PLAY_EVENT, stopArchive);
    window.addEventListener(LIVE_AUDIO_STOP_EVENT, stopForLiveAudio);

    return () => {
      window.removeEventListener(LIVE_AUDIO_PLAY_EVENT, stopArchive);
      window.removeEventListener(LIVE_AUDIO_STOP_EVENT, stopForLiveAudio);
    };
  }, [stopArchive]);

  // Each setter is its own useCallback (identity fixed for the provider's
  // lifetime, not just per-render) so that ArchiveWidgetHost's command effect
  // — which depends on onError — doesn't re-fire on every status/progress
  // change and replay a stale "play" command over a widget the user just
  // paused natively.
  const setReady = useCallback(
    () => setStatus((current) => (current === "loading" ? "ready" : current)),
    [],
  );
  const setPlaying = useCallback(() => {
    setStatus("playing");
    setErrorState(undefined);
  }, []);
  const setPaused = useCallback(
    () => setStatus((current) => (current === "idle" ? current : "paused")),
    [],
  );
  const setEnded = useCallback(() => setStatus("ended"), []);
  const setError = useCallback((message?: string) => {
    setStatus("error");
    setErrorState(message ?? "Archive player unavailable");
  }, []);
  const setProgress = useCallback(
    (nextProgress: ArchiveProgress) =>
      setProgressState((current) => ({ ...current, ...nextProgress })),
    [],
  );
  const isActiveArchive = useCallback(
    (media?: VoicesArchiveMedia) =>
      Boolean(media && activeMedia && media.id === activeMedia.id),
    [activeMedia],
  );

  const value = useMemo<ArchivePlayerContextValue>(
    () => ({
      activeMedia,
      status,
      command,
      progress,
      error,
      playArchive,
      toggleArchive,
      pauseArchive,
      seekArchive,
      stopArchive,
      setReady,
      setPlaying,
      setPaused,
      setEnded,
      setError,
      setProgress,
      isActiveArchive,
    }),
    [
      activeMedia,
      command,
      error,
      isActiveArchive,
      pauseArchive,
      playArchive,
      progress,
      seekArchive,
      setEnded,
      setError,
      setPaused,
      setPlaying,
      setProgress,
      setReady,
      status,
      stopArchive,
      toggleArchive,
    ],
  );

  return (
    <ArchivePlayerContext.Provider value={value}>
      {children}
    </ArchivePlayerContext.Provider>
  );
}

export function useArchivePlayer() {
  const context = useContext(ArchivePlayerContext);

  if (!context) {
    throw new Error(
      "useArchivePlayer must be used inside ArchivePlayerProvider",
    );
  }

  return context;
}
