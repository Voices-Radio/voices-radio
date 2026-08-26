import { describe, expect, it } from "vitest";
import { buildArchiveMedia, getMixcloudFeedPath } from "./archive-media";
import type { VoicesArtwork } from "./types";

const artwork: VoicesArtwork = {
  src: "/show.jpg",
  alt: "Show artwork",
  source: "show",
};

describe("archive media normalization", () => {
  it("builds Mixcloud media from a Mixcloud URL", () => {
    const media = buildArchiveMedia({
      showId: "show-1",
      title: "Breakfast Show",
      artwork,
      artistName: "Voices Radio",
      platform: "mixcloud",
      mixcloudUrl: "https://www.mixcloud.com/VoicesRadio/breakfast-show/",
    });

    expect(media).toMatchObject({
      id: "show-1",
      provider: "mixcloud",
      providerKey: "/VoicesRadio/breakfast-show/",
      sourceUrl: "https://www.mixcloud.com/VoicesRadio/breakfast-show/",
      externalUrl: "https://www.mixcloud.com/VoicesRadio/breakfast-show/",
      title: "Breakfast Show",
      artistName: "Voices Radio",
      artwork,
    });
    expect(media?.embedUrl).toContain("https://www.mixcloud.com/widget/iframe/");
    expect(media?.embedUrl).toContain("mini=1");
    expect(media?.embedUrl).toContain("feed=%2FVoicesRadio%2Fbreakfast-show%2F");
  });

  it("builds Mixcloud media from a stored Mixcloud key", () => {
    const media = buildArchiveMedia({
      showId: "show-2",
      title: "Evening Show",
      artwork,
      mixcloudKey: "VoicesRadio/evening-show",
    });

    expect(media?.provider).toBe("mixcloud");
    expect(media?.providerKey).toBe("/VoicesRadio/evening-show/");
    expect(media?.sourceUrl).toBe(
      "https://www.mixcloud.com/VoicesRadio/evening-show/",
    );
  });

  it("builds SoundCloud media from a SoundCloud URL", () => {
    const media = buildArchiveMedia({
      showId: "show-3",
      title: "Guest Mix",
      artwork,
      platform: "soundcloud",
      soundcloudUrl: "https://soundcloud.com/voicesradio/guest-mix",
    });

    expect(media).toMatchObject({
      id: "show-3",
      provider: "soundcloud",
      providerId: "voicesradio/guest-mix",
      sourceUrl: "https://soundcloud.com/voicesradio/guest-mix",
      externalUrl: "https://soundcloud.com/voicesradio/guest-mix",
    });
    expect(media?.embedUrl).toContain("https://w.soundcloud.com/player/");
    expect(media?.embedUrl).toContain(
      "url=https%3A%2F%2Fsoundcloud.com%2Fvoicesradio%2Fguest-mix",
    );
    expect(media?.embedUrl).toContain("visual=false");
  });

  it("builds SoundCloud media from a numeric SoundCloud id", () => {
    const media = buildArchiveMedia({
      showId: "show-4",
      title: "Uploaded Track",
      artwork,
      platform: "soundcloud",
      soundcloudId: "123456",
    });

    expect(media?.provider).toBe("soundcloud");
    expect(media?.providerId).toBe("123456");
    expect(media?.sourceUrl).toBe("https://api.soundcloud.com/tracks/123456");
    expect(media?.embedUrl).toContain(
      "url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F123456",
    );
  });

  it("uses platform fallback when archive URL is stored in the generic url field", () => {
    const media = buildArchiveMedia({
      showId: "show-5",
      title: "Generic Field",
      artwork,
      platform: "soundcloud",
      url: "https://soundcloud.com/voicesradio/generic-field",
    });

    expect(media?.provider).toBe("soundcloud");
    expect(media?.sourceUrl).toBe(
      "https://soundcloud.com/voicesradio/generic-field",
    );
  });

  it("returns undefined for invalid or missing archive data", () => {
    expect(
      buildArchiveMedia({
        showId: "show-6",
        title: "No Archive",
        artwork,
      }),
    ).toBeUndefined();
    expect(getMixcloudFeedPath("https://example.com/not-mixcloud")).toBeNull();
  });
});
