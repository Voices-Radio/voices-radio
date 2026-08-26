"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type ArchivePlayerCommand = {
  id: number;
  action: "play" | "pause";
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
  stopArchive: () => void;
  setReady: () => void;
  setPlaying: () => void;
  setPaused: () => void;
  setEnded: () => void;
  setError: (message?: string) => void;
  setProgress: (progress: ArchiveProgress) => void;
  isActiveArchive: (media?: VoicesArchiveMedia) => boolean;
};

const ArchivePlayerContext =
  createContext<ArchivePlayerContextValue | null>(null);

export function ArchivePlayerProvider({ children }: { children: ReactNode }) {
  const [activeMedia, setActiveMedia] = useState<
    VoicesArchiveMedia | undefined
  >();
  const [status, setStatus] = useState<ArchivePlayerStatus>("idle");
  const [command, setCommand] = useState<ArchivePlayerCommand | undefined>();
  const [progress, setProgressState] = useState<ArchiveProgress>({});
  const [error, setErrorState] = useState<string | undefined>();
  const [commandId, setCommandId] = useState(0);

  const issueCommand = useCallback((action: ArchivePlayerCommand["action"]) => {
    setCommandId((nextId) => {
      const id = nextId + 1;
      setCommand({ id, action });
      return id;
    });
  }, []);

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
      stopArchive,
      setReady: () =>
        setStatus((current) => (current === "loading" ? "ready" : current)),
      setPlaying: () => {
        setStatus("playing");
        setErrorState(undefined);
      },
      setPaused: () =>
        setStatus((current) => (current === "idle" ? current : "paused")),
      setEnded: () => setStatus("ended"),
      setError: (message) => {
        setStatus("error");
        setErrorState(message ?? "Archive player unavailable");
      },
      setProgress: (nextProgress) =>
        setProgressState((current) => ({ ...current, ...nextProgress })),
      isActiveArchive: (media) =>
        Boolean(media && activeMedia && media.id === activeMedia.id),
    }),
    [
      activeMedia,
      command,
      error,
      pauseArchive,
      playArchive,
      progress,
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
    throw new Error("useArchivePlayer must be used inside ArchivePlayerProvider");
  }

  return context;
}
