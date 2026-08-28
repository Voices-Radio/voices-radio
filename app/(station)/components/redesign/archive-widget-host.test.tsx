import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import ArchiveWidgetHost from "./archive-widget-host";
import type { ArchivePlayerCommand } from "./archive-player-context";

// ArchiveWidgetHost reads the load status via useScript; stub it to "ready"
// synchronously so the SoundCloud/Mixcloud setup effect runs immediately
// instead of waiting on a real <script> tag (which jsdom never actually
// loads).
vi.mock("@/hooks/use-script", () => ({
  useScript: () => "ready",
}));

const media: VoicesArchiveMedia = {
  id: "show-1",
  provider: "soundcloud",
  title: "Guest Mix",
  sourceUrl: "https://soundcloud.com/voicesradio/guest-mix",
  embedUrl:
    "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fvoicesradio%2Fguest-mix",
  externalUrl: "https://soundcloud.com/voicesradio/guest-mix",
  artwork: { src: "/logo.png", alt: "", source: "show" },
};

function makeWidget() {
  const listeners: Record<string, ((payload?: unknown) => void)[]> = {};

  return {
    bind: vi.fn((event: string, listener: (payload?: unknown) => void) => {
      (listeners[event] ??= []).push(listener);
    }),
    unbind: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    getDuration: vi.fn((cb: (duration: number) => void) => cb(0)),
    getPosition: vi.fn((cb: (position: number) => void) => cb(0)),
    fire(event: string, payload?: unknown) {
      listeners[event]?.forEach((listener) => listener(payload));
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ArchiveWidgetHost — SoundCloud command handling", () => {
  it("does not replay a stale 'play' command when the host re-renders with a fresh onError identity", () => {
    const widget = makeWidget();
    const Widget = Object.assign(() => widget, {
      Events: {
        READY: "ready",
        PLAY: "play",
        PAUSE: "pause",
        FINISH: "finish",
        ERROR: "error",
        PLAY_PROGRESS: "playProgress",
      },
    });
    vi.stubGlobal("SC", { Widget });

    const command: ArchivePlayerCommand = { id: 1, action: "play" };
    const props = {
      media,
      command,
      onReady: vi.fn(),
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onEnded: vi.fn(),
      onProgress: vi.fn(),
    };

    const { rerender } = render(
      <ArchiveWidgetHost {...props} onError={vi.fn()} />,
    );

    // Widget becomes ready and the initial "play" command is applied once.
    widget.fire("ready");
    expect(widget.play).toHaveBeenCalledTimes(1);

    // The user pauses using SoundCloud's own on-widget controls — this is
    // the "native pause" path, nothing to do with our command state.
    widget.fire("pause");

    // A parent re-render hands down a new onError closure (this happens on
    // every ArchivePlayerProvider status change, since its context value is
    // rebuilt) while `command` itself is untouched. Regression: this used
    // to be an effect dependency and re-fired, calling widget.play() again
    // and instantly undoing the native pause.
    rerender(<ArchiveWidgetHost {...props} onError={vi.fn()} />);

    expect(widget.play).toHaveBeenCalledTimes(1);
  });
});
