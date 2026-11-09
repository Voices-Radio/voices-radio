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
  /** Position in seconds. */
  seek: (position: number) => Promise<boolean>;
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
  /** Position in milliseconds, unlike Mixcloud's seconds. */
  seekTo: (milliseconds: number) => void;
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

function isMixcloudWidget(
  widget: MixcloudWidget | SoundCloudWidget,
): widget is MixcloudWidget {
  return typeof (widget as MixcloudWidget).seek === "function";
}

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
  // Id of the last command actually applied to the widget. Distinct from
  // readyRef: this guards against re-applying the *same* command when the
  // command-effect below re-runs for an unrelated reason (e.g. a caller
  // passing a fresh callback identity) — without it, a stale "play" gets
  // replayed over a widget the user just paused natively via the provider's
  // own on-widget controls.
  const appliedCommandIdRef = useRef<number | undefined>(undefined);
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

          if (
            commandRef.current?.action === "play" &&
            appliedCommandIdRef.current !== commandRef.current.id
          ) {
            appliedCommandIdRef.current = commandRef.current.id;
            return widget.play();
          }

          return undefined;
        })
        .catch(() => {
          if (!cancelled)
            callbacksRef.current.onError("Mixcloud player failed");
        });

      return () => {
        cancelled = true;
        widgetRef.current = null;
        readyRef.current = false;
        // Mixcloud's widget talks to the iframe's contentWindow via
        // postMessage. If the iframe has already been removed from the DOM
        // (e.g. the mini player was closed) that window is gone and off()
        // can throw — swallow it, the listeners are moot once the iframe is
        // gone anyway.
        try {
          widget.events.play.off(handlePlay);
          widget.events.pause.off(handlePause);
          widget.events.ended.off(handleEnded);
          widget.events.error.off(handleError);
          widget.events.progress.off(handleProgress);
        } catch {
          // iframe already torn down — nothing left to unbind.
        }
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

      if (
        commandRef.current?.action === "play" &&
        appliedCommandIdRef.current !== commandRef.current.id
      ) {
        appliedCommandIdRef.current = commandRef.current.id;
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
          position: typeof position === "number" ? position / 1000 : undefined,
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
      widgetRef.current = null;
      readyRef.current = false;
      // Same rationale as the Mixcloud branch above: the SoundCloud widget
      // posts unbind messages to the iframe's contentWindow, which is gone
      // once the iframe has already been removed (closing the mini player
      // unmounts this host before this cleanup runs) — that throw is what
      // surfaced as the client-side exception on the show page.
      try {
        widget.unbind(events.READY);
        widget.unbind(events.PLAY);
        widget.unbind(events.PAUSE);
        widget.unbind(events.FINISH);
        widget.unbind(events.ERROR);
        widget.unbind(events.PLAY_PROGRESS);
      } catch {
        // iframe already torn down — nothing left to unbind.
      }
    };
  }, [callbacksRef, commandRef, media.provider, scriptStatus]);

  useEffect(() => {
    if (!command || !readyRef.current || !widgetRef.current) return;
    // Deduped by command id, not just presence: without this, the effect
    // re-running for any unrelated reason (a caller passing a fresh
    // onError/onProgress identity, e.g.) would re-apply the same stale
    // "play" over a widget the user just paused via its own native
    // controls, making native pause look broken.
    if (appliedCommandIdRef.current === command.id) return;

    appliedCommandIdRef.current = command.id;
    const widget = widgetRef.current;

    if (command.action === "seek") {
      // Seeking is the one command whose shape differs between providers:
      // Mixcloud takes seconds and returns a promise, SoundCloud takes
      // milliseconds and returns nothing. Neither starts playback, so a seek
      // while paused stays paused.
      const position = command.position ?? 0;

      if (isMixcloudWidget(widget)) {
        widget
          .seek(position)
          .catch(() => callbacksRef.current.onError("Archive seek failed"));
      } else {
        widget.seekTo(Math.round(position * 1000));
      }
      return;
    }

    if (command.action === "play") {
      const result = widget.play();
      if (result instanceof Promise) {
        result.catch(() =>
          callbacksRef.current.onError("Archive playback failed"),
        );
      }
      return;
    }

    const result = widget.pause();
    if (result instanceof Promise) {
      result.catch(() => callbacksRef.current.onError("Archive pause failed"));
    }
  }, [callbacksRef, command]);

  // The provider widget is the audio engine, not a control surface: it renders
  // its own play button, which stacked a second, off-brand transport directly
  // under ours in the mini player. It stays mounted and painted — just moved
  // out of view.
  //
  // Deliberately NOT display:none, visibility:hidden, or zero-size: all three
  // can suspend iframe media or stop the SoundCloud widget initialising at all.
  // Real dimensions (SoundCloud needs them), zero opacity, off the z-stack, and
  // inert to pointer, tab order and assistive tech.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[60px] w-[320px] overflow-hidden opacity-0"
    >
      <iframe
        key={media.embedUrl}
        ref={iframeRef}
        tabIndex={-1}
        title={`${media.title} ${media.provider} player`}
        src={media.embedUrl}
        className="h-[60px] w-full border-0 bg-voicesNext-background"
        allow="autoplay"
      />
    </div>
  );
}
