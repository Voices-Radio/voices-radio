import type { ImageLoaderProps } from "next/image";

/**
 * Sanity images are served straight from Sanity's CDN instead of being run
 * through Vercel's image optimizer a second time. Sanity already resizes and
 * converts (`auto=format` → WebP), so the double pass only added a cold
 * transform (~600ms on a cache miss) and a second round of lossy compression.
 */
const SANITY_IMAGE_HOST = "cdn.sanity.io";
const DEFAULT_QUALITY = 75;

export function isSanityImageUrl(src: unknown): src is string {
  if (typeof src !== "string") return false;

  try {
    const url = new URL(src);
    return (
      url.hostname === SANITY_IMAGE_HOST && url.pathname.startsWith("/images/")
    );
  } catch {
    return false;
  }
}

/**
 * next/image loader for cdn.sanity.io URLs. The incoming URL may already pin a
 * crop (`rect`, `w`, `h`, `fit=crop`) from @sanity/image-url; the loader keeps
 * that crop and only rescales it. It never asks for more pixels than the URL
 * already pins, so srcset entries above the source size reuse the largest real
 * image instead of an upscaled copy.
 */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  const params = url.searchParams;
  const pinnedWidth = Number(params.get("w"));
  const pinnedHeight = Number(params.get("h"));
  const targetWidth = pinnedWidth > 0 ? Math.min(width, pinnedWidth) : width;

  params.set("w", String(targetWidth));
  if (pinnedWidth > 0 && pinnedHeight > 0) {
    params.set(
      "h",
      String(
        Math.max(1, Math.round((pinnedHeight * targetWidth) / pinnedWidth)),
      ),
    );
  }
  params.set("q", String(quality ?? DEFAULT_QUALITY));
  if (!params.has("auto") && !params.has("fm")) params.set("auto", "format");
  // `fit=max` never upscales; a URL that already chose a fit keeps it.
  if (!params.has("fit")) params.set("fit", "max");

  return url.toString();
}

/** The loader next/image should use for `src`; undefined means Vercel's. */
export function getImageLoader(src: unknown) {
  return isSanityImageUrl(src) ? sanityImageLoader : undefined;
}

type SanityCrop = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

/** Source dimensions are encoded in the asset id: `image-<hash>-1242x689-jpg`. */
export function getSanityAssetDimensions(assetRef?: string) {
  const match = assetRef?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  if (!match) return undefined;

  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * Scales a requested crop box (e.g. 2400×1350) down so it never exceeds the
 * pixels that actually exist in the cropped source. Requesting more makes
 * Sanity upscale, which adds bytes but no detail.
 */
export function capSizeToSource({
  assetRef,
  crop,
  width,
  height,
}: {
  assetRef?: string;
  crop?: SanityCrop;
  width: number;
  height: number;
}) {
  const source = getSanityAssetDimensions(assetRef);
  if (!source) return { width, height };

  const cropWidth = source.width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0));
  const cropHeight =
    source.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0));
  // Largest box with the requested aspect ratio that fits inside the crop.
  const fittedWidth = Math.min(cropWidth, (cropHeight * width) / height);
  const scale = Math.min(1, fittedWidth / width);

  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}
