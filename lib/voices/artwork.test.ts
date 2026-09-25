import { describe, expect, it } from "vitest";
import {
  SHOW_CARD_FOCAL_POSITION,
  artworkForSize,
  artworkPosition,
  enhanceArtworkUrl,
  resolveShowArtwork,
} from "./artwork";
import type { VoicesArtwork } from "./types";

const MIXCLOUD = "https://thumbnailer.mixcloud.com/unsafe/1000x1000/extaudio/5/2/a/a/a69b";
const SOUNDCLOUD = "https://i1.sndcdn.com/artworks-v9tPdhmhDy5LFTOZ-yMfKVw-t500x500.jpg";

describe("enhanceArtworkUrl", () => {
  it("resizes Mixcloud Thumbor paths to the requested size", () => {
    expect(enhanceArtworkUrl(MIXCLOUD, { size: "card" })).toContain("/unsafe/300x300/");
    expect(enhanceArtworkUrl(MIXCLOUD, { size: "full" })).toContain("/unsafe/1000x1000/");
  });

  it("pulls the 2400px Mixcloud render for feature surfaces", () => {
    expect(enhanceArtworkUrl(MIXCLOUD, { size: "feature" })).toContain("/unsafe/2400x2400/");
  });

  it("never asks SoundCloud for more than t500x500, which is its hard ceiling", () => {
    // -original 404s on i1.sndcdn.com, so t500x500 is genuinely all there is.
    for (const size of ["detail", "full", "feature"] as const) {
      expect(enhanceArtworkUrl(SOUNDCLOUD, { size })).toContain("-t500x500.jpg");
    }
  });

  it("leaves unknown hosts and non-URLs untouched", () => {
    expect(enhanceArtworkUrl("https://example.com/a.jpg", { size: "card" })).toBe(
      "https://example.com/a.jpg",
    );
    expect(enhanceArtworkUrl("/local.jpg", { size: "card" })).toBe("/local.jpg");
    expect(enhanceArtworkUrl(undefined)).toBeUndefined();
  });
});

describe("artworkForSize", () => {
  const artwork: VoicesArtwork = {
    src: MIXCLOUD,
    alt: "Show artwork",
    source: "show",
  };

  it("re-renders the source at the size a surface actually needs", () => {
    expect(artworkForSize(artwork, "feature").src).toContain("/unsafe/2400x2400/");
    expect(artworkForSize(artwork, "card").src).toContain("/unsafe/300x300/");
  });

  it("carries alt, source and focal point through unchanged", () => {
    const withFocal: VoicesArtwork = { ...artwork, focalPoint: { x: 40, y: 20 } };
    const result = artworkForSize(withFocal, "feature");
    expect(result.alt).toBe("Show artwork");
    expect(result.source).toBe("show");
    expect(result.focalPoint).toEqual({ x: 40, y: 20 });
  });

  it("does not mutate the artwork it is given", () => {
    const before = { ...artwork };
    artworkForSize(artwork, "card");
    expect(artwork).toEqual(before);
  });
});

describe("artworkPosition", () => {
  it("uses a stored focal point when the show has one", () => {
    expect(artworkPosition({ x: 40, y: 20 })).toBe("40% 20%");
  });

  it("falls back to the measured show-card default when none is stored", () => {
    expect(artworkPosition(undefined)).toBe(SHOW_CARD_FOCAL_POSITION);
  });

  it("clamps out-of-range focal points rather than emitting invalid CSS", () => {
    expect(artworkPosition({ x: -10, y: 140 })).toBe("0% 100%");
  });

  it("ignores a non-finite focal point instead of emitting NaN%", () => {
    expect(artworkPosition({ x: Number.NaN, y: 50 })).toBe(SHOW_CARD_FOCAL_POSITION);
  });

  it("biases above centre, because most artwork puts its subject high", () => {
    // Measured over a random sample of 24 live shows: 16 wanted to sit above
    // centre. A centred crop is what cuts heads off in the 350x236 card box.
    const y = Number(SHOW_CARD_FOCAL_POSITION.split(" ")[1].replace("%", ""));
    expect(y).toBeLessThan(50);
    expect(y).toBeGreaterThan(0);
  });
});

describe("resolveShowArtwork", () => {
  it("prefers show artwork, then artist, then the fallback", () => {
    expect(
      resolveShowArtwork({ showTitle: "S", showImageUrl: MIXCLOUD }).source,
    ).toBe("show");
    expect(
      resolveShowArtwork({
        showTitle: "S",
        artistName: "A",
        artistImageUrl: SOUNDCLOUD,
      }).source,
    ).toBe("artist");
    expect(resolveShowArtwork({ showTitle: "S" }).source).toBe("fallback");
  });

  it("threads a focal point onto the resolved artwork", () => {
    const result = resolveShowArtwork({
      showTitle: "S",
      showImageUrl: MIXCLOUD,
      focalPoint: { x: 50, y: 25 },
    });
    expect(result.focalPoint).toEqual({ x: 50, y: 25 });
  });
});
