import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { stopLiveAudio } from "@/hooks/use-station-audio";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import ArchiveMiniPlayer from "./archive-mini-player";
import ArchivePlayPanel from "./archive-play-panel";
import {
  ArchivePlayerProvider,
  useArchivePlayer,
} from "./archive-player-context";

const media: VoicesArchiveMedia = {
  id: "show-1",
  provider: "soundcloud",
  title: "Guest Mix",
  sourceUrl: "https://soundcloud.com/voicesradio/guest-mix",
  embedUrl:
    "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fvoicesradio%2Fguest-mix&visual=false",
  externalUrl: "https://soundcloud.com/voicesradio/guest-mix",
  artwork: {
    src: "/VOICESLOGO_LIGHTBOX.png",
    alt: "Guest Mix artwork",
    source: "show",
  },
  artistName: "Voices Radio",
  duration: 3600,
  providerId: "voicesradio/guest-mix",
};

function renderPlayer(mediaOverride: VoicesArchiveMedia | undefined = media) {
  return render(
    <ArchivePlayerProvider>
      <ArchivePlayPanel media={mediaOverride} />
      <ArchiveMiniPlayer />
    </ArchivePlayerProvider>,
  );
}

/** Surfaces the command the provider is currently issuing to the widget. */
function CommandProbe() {
  const { command } = useArchivePlayer();
  return (
    <output data-testid="command">
      {command ? `${command.action}:${command.position ?? "-"}` : "none"}
    </output>
  );
}

function renderSeekablePlayer() {
  return render(
    <ArchivePlayerProvider>
      <ArchivePlayPanel media={media} />
      <ArchiveMiniPlayer />
      <CommandProbe />
    </ArchivePlayerProvider>,
  );
}

function renderUnavailablePlayer() {
  return render(
    <ArchivePlayerProvider>
      <ArchivePlayPanel />
      <ArchiveMiniPlayer />
    </ArchivePlayerProvider>,
  );
}

describe("archive player controls", () => {
  it("shows an unavailable state when a show has no archive media", () => {
    renderUnavailablePlayer();

    expect(
      screen.getByRole("button", { name: /archive unavailable/i }),
    ).toBeDisabled();
    expect(screen.getByText(/no archive available/i)).toBeInTheDocument();
  });

  it("exposes a single transport control in the mini player", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    const miniPlayer = screen.getByRole("region", {
      name: /archive mini player/i,
    });

    // The provider iframe carries its own play button. It has to stay mounted
    // (it is the audio engine) but must not surface a second, competing
    // transport next to ours.
    expect(
      within(miniPlayer).getAllByRole("button", {
        name: /^(play|pause) archive$/i,
      }),
    ).toHaveLength(1);
  });

  it("keeps the provider widget mounted but hidden from view and assistive tech", async () => {
    const user = userEvent.setup();
    const { container } = renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute("tabindex", "-1");
    expect(iframe?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("does not name the streaming provider in player status copy", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    // Provider naming belongs on the "open on SoundCloud" link, where it names
    // a destination — not on status labels, where it repeated itself twice on
    // the show page.
    expect(screen.queryByText(/soundcloud archive/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/in the miniplayer/i)).not.toBeInTheDocument();
  });

  it("opens the persistent MiniPlayer from the show play panel", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    expect(
      screen.getByRole("region", { name: /archive mini player/i }),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("region", { name: /archive mini player/i }),
      ).getByText("Guest Mix"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /pause archive/i }),
    ).toBeInTheDocument();
  });

  it("exposes the progress bar as a seek slider spanning the show's duration", async () => {
    const user = userEvent.setup();
    renderSeekablePlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    const slider = screen.getByRole("slider", { name: /seek/i });
    expect(slider).toHaveAttribute("max", "3600");
    expect(slider).toHaveAttribute("aria-valuetext", "0:00 of 60:00");
  });

  it("seeks immediately for keyboard input", async () => {
    const user = userEvent.setup();
    renderSeekablePlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    const slider = screen.getByRole("slider", { name: /seek/i });
    fireEvent.change(slider, { target: { value: "900" } });

    expect(screen.getByTestId("command")).toHaveTextContent("seek:900");
    expect(slider).toHaveAttribute("aria-valuetext", "15:00 of 60:00");
  });

  it("holds the seek until the drag is released", async () => {
    const user = userEvent.setup();
    renderSeekablePlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    const slider = screen.getByRole("slider", { name: /seek/i });

    // Mid-drag the readout tracks the thumb, but no seek is issued yet — one
    // command per pointer-move would flood the widget with postMessage calls.
    fireEvent.pointerDown(slider);
    fireEvent.change(slider, { target: { value: "600" } });
    expect(slider).toHaveAttribute("aria-valuetext", "10:00 of 60:00");
    expect(screen.getByTestId("command")).not.toHaveTextContent("seek");

    fireEvent.pointerUp(slider);
    expect(screen.getByTestId("command")).toHaveTextContent("seek:600");
  });

  it("disables seeking when the duration is unknown", async () => {
    const user = userEvent.setup();
    render(
      <ArchivePlayerProvider>
        <ArchivePlayPanel media={{ ...media, duration: undefined }} />
        <ArchiveMiniPlayer />
      </ArchivePlayerProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );

    expect(screen.getByRole("slider", { name: /seek/i })).toBeDisabled();
  });

  it("closes and tears down the MiniPlayer from the close button", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /close archive player/i }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /archive mini player/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("stops archive playback when a live audio player starts", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );
    expect(
      screen.getByRole("region", { name: /archive mini player/i }),
    ).toBeInTheDocument();

    stopLiveAudio("voices-live-header:kx");

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /archive mini player/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("does not stop itself when archive playback stops live audio without a player id", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(
      screen.getByRole("button", { name: /listen back guest mix/i }),
    );
    stopLiveAudio();

    expect(
      screen.getByRole("region", { name: /archive mini player/i }),
    ).toBeInTheDocument();
  });
});
