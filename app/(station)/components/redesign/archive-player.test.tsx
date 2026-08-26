import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { stopLiveAudio } from "@/hooks/use-station-audio";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import ArchiveMiniPlayer from "./archive-mini-player";
import ArchivePlayPanel from "./archive-play-panel";
import { ArchivePlayerProvider } from "./archive-player-context";

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

function renderUnavailablePlayer() {
  return render(
    <ArchivePlayerProvider>
      <ArchivePlayPanel />
      <ArchiveMiniPlayer />
    </ArchivePlayerProvider>,
  );
}

describe("archive player controls", () => {
  it("shows an unavailable state when a show has no Mixcloud or SoundCloud media", () => {
    renderUnavailablePlayer();

    expect(screen.getByRole("button", { name: /archive unavailable/i })).toBeDisabled();
    expect(screen.getByText(/does not have a playable/i)).toBeInTheDocument();
  });

  it("opens the persistent MiniPlayer from the show play panel", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole("button", { name: /listen back guest mix/i }));

    expect(
      screen.getByRole("region", { name: /archive mini player/i }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: /archive mini player/i })).getByText(
        "Guest Mix",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause archive/i })).toBeInTheDocument();
  });

  it("closes and tears down the MiniPlayer from the close button", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole("button", { name: /listen back guest mix/i }));
    await user.click(screen.getByRole("button", { name: /close archive player/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: /archive mini player/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("stops archive playback when a live audio player starts", async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole("button", { name: /listen back guest mix/i }));
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

    await user.click(screen.getByRole("button", { name: /listen back guest mix/i }));
    stopLiveAudio();

    expect(
      screen.getByRole("region", { name: /archive mini player/i }),
    ).toBeInTheDocument();
  });
});
