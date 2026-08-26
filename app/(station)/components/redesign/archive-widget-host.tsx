"use client";

import { useEffect, useRef } from "react";
import { useScript } from "@/hooks/use-script";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import type { ArchivePlayerCommand } from "./archive-player-context";

type ArchiveWidgetHostProps = {
  media: VoicesArchiveMedia;
  command?: ArchivePlayerCommand;
  onReady: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onError: (message?: string) => void;
  onProgress: (progress: { position?: number; duration?: number }) => void;
};

type MixcloudEvent<T extends (...args: never[]) => void = () => void> = {
  on: (listener: T) => void;
  off: (listener: T) => void;
};

type MixcloudWidget = {
  ready: Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  events: {
    play: MixcloudEvent;
    pause: MixcloudEvent;
    ended: MixcloudEvent;
    error: MixcloudEvent;
    progress: MixcloudEvent<(position: number, duration: number) => void>;
  };
};

type SoundCloudWidget = {
  bind: (eventName: string, listener: (payload?: unknown) => void) => void;
  unbind: (eventName: string) => void;
  play: () => void;
  pause: () => void;
  getDuration: (callback: (duration: number) => void) => void;
  getPosition: (callback: (position: number) => void) => void;
};

type SoundCloudApi = {
  Widget: {
    (iframe: HTMLIFrameElement): SoundCloudWidget;
    Events: Record<string, string>;
  };
};

declare global {
  interface Window {
    Mixcloud?: {
      PlayerWidget: (iframe: HTMLIFrameElement) => MixcloudWidget;
    };
    SC?: SoundCloudApi;
  }
}

const MIXCLOUD_WIDGET_API = "https://widget.mixcloud.com/media/js/widgetApi.js";
const SOUNDCLOUD_WIDGET_API = "https://w.soundcloud.com/player/api.js";

function isPlayProgressPayload(
  payload: unknown,
): payload is { currentPosition?: number } {
  return typeof payload === "object" && payload !== null;
}

function useLatest<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

export default function ArchiveWidgetHost({
  media,
  command,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: ArchiveWidgetHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<MixcloudWidget | SoundCloudWidget | null>(null);
  const readyRef = useRef(false);
  const commandRef = useLatest(command);
  const callbacksRef = useLatest({
    onReady,
    onPlay,
    onPause,
    onEnded,
    onError,
    onProgress,
  });
  const scriptStatus = useScript(
    media.provider === "mixcloud" ? MIXCLOUD_WIDGET_API : SOUNDCLOUD_WIDGET_API,
  );

  useEffect(() => {
    if (scriptStatus === "error") {
      callbacksRef.current.onError("Archive player script failed to load");
    }
  }, [callbacksRef, scriptStatus]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || scriptStatus !== "ready") return;

    let cancelled = false;
    readyRef.current = false;
    widgetRef.current = null;

    if (media.provider === "mixcloud") {
      const widget = window.Mixcloud?.PlayerWidget(iframe);
      if (!widget) {
        callbacksRef.current.onError("Mixcloud player unavailable");
        return;
      }

      widgetRef.current = widget;

      const handlePlay = () => callbacksRef.current.onPlay();
      const handlePause = () => callbacksRef.current.onPause();
      const handleEnded = () => callbacksRef.current.onEnded();
      const handleError = () =>
        callbacksRef.current.onError("Mixcloud player unavailable");
      const handleProgress = (position: number, duration: number) =>
        callbacksRef.current.onProgress({ position, duration });

      widget.ready
        .then(() => {
          if (cancelled) return;

          readyRef.current = true;
          callbacksRef.current.onReady();
          widget.events.play.on(handlePlay);
          widget.events.pause.on(handlePause);
          widget.events.ended.on(handleEnded);
          widget.events.error.on(handleError);
          widget.events.progress.on(handleProgress);

          if (commandRef.current?.action === "play") {
            return widget.play();
          }

          return undefined;
        })
        .catch(() => {
          if (!cancelled) callbacksRef.current.onError("Mixcloud player failed");
        });

      return () => {
        cancelled = true;
        widget.events.play.off(handlePlay);
        widget.events.pause.off(handlePause);
        widget.events.ended.off(handleEnded);
        widget.events.error.off(handleError);
        widget.events.progress.off(handleProgress);
      };
    }

    const api = window.SC?.Widget;
    if (!api) {
      callbacksRef.current.onError("SoundCloud player unavailable");
      return;
    }

    const widget = api(iframe);
    const events = api.Events;
    widgetRef.current = widget;

    const handleReady = () => {
      readyRef.current = true;
      callbacksRef.current.onReady();
      widget.getDuration((duration) =>
        callbacksRef.current.onProgress({ duration: duration / 1000 }),
      );

      if (commandRef.current?.action === "play") {
        widget.play();
      }
    };
    const handlePlay = () => callbacksRef.current.onPlay();
    const handlePause = () => callbacksRef.current.onPause();
    const handleEnded = () => callbacksRef.current.onEnded();
    const handleError = () =>
      callbacksRef.current.onError("SoundCloud player unavailable");
    const handleProgress = (payload?: unknown) => {
      widget.getDuration((duration) => {
        const position = isPlayProgressPayload(payload)
          ? payload.currentPosition
          : undefined;

        callbacksRef.current.onProgress({
          position:
            typeof position === "number" ? position / 1000 : undefined,
          duration: duration / 1000,
        });
      });
    };

    widget.bind(events.READY, handleReady);
    widget.bind(events.PLAY, handlePlay);
    widget.bind(events.PAUSE, handlePause);
    widget.bind(events.FINISH, handleEnded);
    widget.bind(events.ERROR, handleError);
    widget.bind(events.PLAY_PROGRESS, handleProgress);

    return () => {
      widget.unbind(events.READY);
      widget.unbind(events.PLAY);
      widget.unbind(events.PAUSE);
      widget.unbind(events.FINISH);
      widget.unbind(events.ERROR);
      widget.unbind(events.PLAY_PROGRESS);
    };
  }, [callbacksRef, commandRef, media.provider, scriptStatus]);

  useEffect(() => {
    if (!command || !readyRef.current || !widgetRef.current) return;

    const widget = widgetRef.current;

    if (command.action === "play") {
      const result = widget.play();
      if (result instanceof Promise) {
        result.catch(() => onError("Archive playback failed"));
      }
      return;
    }

    const result = widget.pause();
    if (result instanceof Promise) {
      result.catch(() => onError("Archive pause failed"));
    }
  }, [command, onError]);

  return (
    <iframe
      key={media.embedUrl}
      ref={iframeRef}
      title={`${media.title} ${media.provider} player`}
      src={media.embedUrl}
      className="h-full min-h-[60px] w-full border-0 bg-voicesNext-background"
      allow="autoplay"
    />
  );
}
