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

/** What the user has asked the transport to do. See `intent` below. */
type ArchivePlayerIntent = "play" | "pause";

type ArchivePlayerContextValue = {
  activeMedia?: VoicesArchiveMedia;
  status: ArchivePlayerStatus;
  /**
   * Whether every transport button should render as "pause". Derived from
   * intent, not status — see the comment on `intent` in the provider.
   */
  isPlaying: boolean;
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
  // What the user asked for, as distinct from what the widget has managed to
  // do yet. The widget fires its own "ready" event somewhere between the tap
  // and the first play event, and deriving "is it playing?" from status alone
  // meant every transport button flipped back to Play for that whole
  // buffering window (pause → play → pause). Intent only moves on a user
  // action or a real transport event from the widget.
  const [intent, setIntent] = useState<ArchivePlayerIntent>("pause");
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
    setIntent("pause");
    setCommand(undefined);
    setProgressState({});
    setErrorState(undefined);
  }, []);

  const playArchive = useCallback(
    (media: VoicesArchiveMedia) => {
      stopLiveAudio();
      setActiveMedia(media);
      setStatus("loading");
      setIntent("play");
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

    setIntent("pause");
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

    // Reads intent, not status, so the button can never disagree with its own
    // label: whatever the icon says is exactly what the tap does.
    if (intent === "play") {
      pauseArchive();
      return;
    }

    setIntent("play");
    setStatus("loading");
    issueCommand("play");
  }, [activeMedia, intent, issueCommand, pauseArchive]);

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
  //
  // These four are the widget's real transport events, so they are also the
  // only things besides a user action that may move intent — that is how a
  // pause triggered from the provider's own controls still reaches our button.
  // setReady is deliberately absent: readiness is not a transport event.
  const setPlaying = useCallback(() => {
    setIntent("play");
    setStatus("playing");
    setErrorState(undefined);
  }, []);
  const setPaused = useCallback(() => {
    setIntent("pause");
    setStatus((current) => (current === "idle" ? current : "paused"));
  }, []);
  const setEnded = useCallback(() => {
    setIntent("pause");
    setStatus("ended");
  }, []);
  const setError = useCallback((message?: string) => {
    setIntent("pause");
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
      isPlaying: intent === "play",
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
      intent,
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
