import { describe, expect, it } from "vitest";
import {
  capSizeToSource,
  getSanityAssetDimensions,
  isSanityImageUrl,
  sanityImageLoader,
} from "./sanity-image";

const CROPPED =
  "https://cdn.sanity.io/images/abc/production/hash-1242x689.jpg?rect=9,0,1225,689&w=1225&h=689&q=95&fit=crop&auto=format";

describe("isSanityImageUrl", () => {
  it("accepts Sanity CDN image URLs", () => {
    expect(isSanityImageUrl(CROPPED)).toBe(true);
  });

  it("rejects other hosts, relative paths and non-strings", () => {
    expect(isSanityImageUrl("https://thumbnailer.mixcloud.com/x.jpg")).toBe(
      false,
    );
    expect(isSanityImageUrl("/optimized/studio-5.jpg")).toBe(false);
    expect(isSanityImageUrl({ src: CROPPED })).toBe(false);
  });
});

describe("sanityImageLoader", () => {
  it("rescales the pinned crop and keeps its aspect ratio", () => {
    const url = new URL(
      sanityImageLoader({ src: CROPPED, width: 640, quality: 85 }),
    );

    expect(url.searchParams.get("w")).toBe("640");
    expect(url.searchParams.get("h")).toBe("360");
    expect(url.searchParams.get("q")).toBe("85");
    expect(url.searchParams.get("rect")).toBe("9,0,1225,689");
    expect(url.searchParams.get("fit")).toBe("crop");
  });

  it("never asks for more pixels than the URL pins", () => {
    const url = new URL(sanityImageLoader({ src: CROPPED, width: 3840 }));

    expect(url.searchParams.get("w")).toBe("1225");
    expect(url.searchParams.get("h")).toBe("689");
  });

  it("defaults quality and adds non-upscaling fit to a bare asset URL", () => {
    const url = new URL(
      sanityImageLoader({
        src: "https://cdn.sanity.io/images/abc/production/hash-800x600.png",
        width: 384,
      }),
    );

    expect(url.searchParams.get("w")).toBe("384");
    expect(url.searchParams.has("h")).toBe(false);
    expect(url.searchParams.get("q")).toBe("75");
    expect(url.searchParams.get("fit")).toBe("max");
    expect(url.searchParams.get("auto")).toBe("format");
  });
});

describe("getSanityAssetDimensions", () => {
  it("reads the dimensions encoded in an asset ref", () => {
    expect(getSanityAssetDimensions("image-abc123-1242x689-jpg")).toEqual({
      width: 1242,
      height: 689,
    });
  });

  it("returns undefined for an unrecognised ref", () => {
    expect(getSanityAssetDimensions("not-a-ref")).toBeUndefined();
    expect(getSanityAssetDimensions(undefined)).toBeUndefined();
  });
});

describe("capSizeToSource", () => {
  it("shrinks a 2400×1350 request to what a 1242×689 source can fill", () => {
    expect(
      capSizeToSource({
        assetRef: "image-abc-1242x689-jpg",
        width: 2400,
        height: 1350,
      }),
    ).toEqual({ width: 1224, height: 689 });
  });

  it("accounts for the editor's crop", () => {
    expect(
      capSizeToSource({
        assetRef: "image-abc-2000x2000-jpg",
        crop: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        width: 2400,
        height: 1350,
      }),
    ).toEqual({ width: 1777, height: 1000 });
  });

  it("leaves a request alone when the source is large enough", () => {
    expect(
      capSizeToSource({
        assetRef: "image-abc-4000x3000-jpg",
        width: 2400,
        height: 1350,
      }),
    ).toEqual({ width: 2400, height: 1350 });
  });

  it("leaves a request alone when the ref has no dimensions", () => {
    expect(capSizeToSource({ width: 800, height: 800 })).toEqual({
      width: 800,
      height: 800,
    });
  });
});
