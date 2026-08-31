import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import ArchiveMiniPlayer from "./archive-mini-player";
import { ArchivePlayerProvider } from "./archive-player-context";
import ArchiveTilePlayButton from "./archive-tile-play-button";

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

function renderTile(mediaOverride?: VoicesArchiveMedia) {
  return render(
    <ArchivePlayerProvider>
      <ArchiveTilePlayButton media={mediaOverride} title="Guest Mix" />
      <ArchiveMiniPlayer />
    </ArchivePlayerProvider>,
  );
}

describe("ArchiveTilePlayButton", () => {
  it("opens the MiniPlayer in place without navigating", async () => {
    const user = userEvent.setup();
    renderTile(media);

    await user.click(screen.getByRole("button", { name: /play guest mix/i }));

    expect(
      screen.getByRole("region", { name: /archive mini player/i }),
    ).toBeInTheDocument();
  });

  it("stops the click from bubbling into the surrounding card link", async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    render(
      <ArchivePlayerProvider>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div onClick={onParentClick}>
          <ArchiveTilePlayButton media={media} title="Guest Mix" />
        </div>
      </ArchivePlayerProvider>,
    );

    await user.click(screen.getByRole("button", { name: /play guest mix/i }));

    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("falls back to a non-interactive icon when the show has no archive", () => {
    renderTile(undefined);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
