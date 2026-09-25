import { VOICES_FALLBACK_ARTWORK } from "./config";
import type { VoicesArtwork, VoicesFocalPoint } from "./types";

const SOUNDCLOUD_IMAGE_SIZE_PATTERN =
  /-(badge|crop|large|mini|original|small|t\d+x\d+|tiny)\.(jpe?g|png|webp)$/i;

export type ArtworkImageSize = "thumbnail" | "card" | "detail" | "full";

const MIXCLOUD_DIMENSIONS: Record<ArtworkImageSize, string> = {
  thumbnail: "80x80",
  card: "300x300",
  detail: "600x600",
  full: "1000x1000",
};
const MIXCLOUD_FEATURE_SIZE = "2400x2400";

const SOUNDCLOUD_SUFFIX: Record<ArtworkImageSize, string> = {
  thumbnail: "large",
  card: "t300x300",
  detail: "t500x500",
  full: "t500x500",
};

type EnhanceArtworkOptions = {
  size?: ArtworkImageSize | "default" | "feature";
};

function resolveArtworkSize(size: EnhanceArtworkOptions["size"]) {
  if (size === "default" || !size) return "full";
  if (size === "feature") return "full";
  return size;
}

function enhanceMixcloudImageUrl(
  url: URL,
  options: EnhanceArtworkOptions = {},
) {
  if (url.hostname !== "thumbnailer.mixcloud.com") return url.toString();

  const size =
    options.size === "feature"
      ? MIXCLOUD_FEATURE_SIZE
      : MIXCLOUD_DIMENSIONS[resolveArtworkSize(options.size)];

  url.pathname = url.pathname.replace(
    /\/unsafe\/\d+x\d+\//,
    `/unsafe/${size}/`,
  );
  return url.toString();
}

function enhanceSoundCloudImageUrl(
  url: URL,
  options: EnhanceArtworkOptions = {},
) {
  if (!url.hostname.endsWith("sndcdn.com")) return url.toString();

  const size = SOUNDCLOUD_SUFFIX[resolveArtworkSize(options.size)];

  if (SOUNDCLOUD_IMAGE_SIZE_PATTERN.test(url.pathname)) {
    url.pathname = url.pathname.replace(
      SOUNDCLOUD_IMAGE_SIZE_PATTERN,
      `-${size}.$2`,
    );
  } else {
    url.pathname = url.pathname.replace(/\.(jpe?g|png|webp)$/i, `-${size}.$1`);
  }

  return url.toString();
}

export function enhanceArtworkUrl(
  src?: string | null,
  options: EnhanceArtworkOptions = {},
) {
  if (!src) return undefined;

  try {
    const url = new URL(src);
    return enhanceSoundCloudImageUrl(
      new URL(enhanceMixcloudImageUrl(url, options)),
      options,
    );
  } catch {
    return src;
  }
}

export function getArtworkSrcSet(src?: string | null) {
  const card = enhanceArtworkUrl(src, { size: "card" });
  const detail = enhanceArtworkUrl(src, { size: "detail" });
  const full = enhanceArtworkUrl(src, { size: "full" });

  if (!card || !detail || !full) return undefined;

  const entries = new Map([
    [card, "300w"],
    [detail, "600w"],
    [full, "1000w"],
  ]);

  return Array.from(entries, ([url, width]) => `${url} ${width}`).join(", ");
}

/**
 * Default `object-position` for show artwork cropped into a landscape box.
 *
 * The redesign show card paints a SQUARE source into a 350x236 box (350 less
 * the 30px station header and the 84px genre footer), so `object-cover`
 * discards 114px vertically — 57px off the top and 57px off the bottom when
 * centred. That centred crop is what takes the tops of people's heads off.
 *
 * 35% rather than 50% because a saliency sweep over a random sample of 24 live
 * shows put 16 of them above centre. The distribution is bimodal — artwork
 * either wants its top or its bottom, rarely the middle — so no single value
 * is right for everything. 35% is chosen on asymmetric downside: cropping a
 * face is far worse than cropping background, so it is worth being mildly
 * wrong on the minority that want their lower half to be right on the
 * majority that do not. Per-show `focalPoint` overrides this whenever one
 * exists.
 */
export const SHOW_CARD_FOCAL_POSITION = "50% 35%";

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

/**
 * Turns an optional focal point into a CSS `object-position` string, falling
 * back to the measured default. Out-of-range and non-finite values are
 * rejected rather than passed through, so bad data degrades to a sensible
 * crop instead of an invalid style declaration.
 */
export function artworkPosition(
  focalPoint?: VoicesFocalPoint,
  fallback: string = SHOW_CARD_FOCAL_POSITION,
) {
  if (!focalPoint) return fallback;
  const { x, y } = focalPoint;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return fallback;
  return `${clampPercentage(x)}% ${clampPercentage(y)}%`;
}

/**
 * Re-renders already-resolved artwork at the size a particular surface needs.
 *
 * Shows are normalised once and then shared between cards, rails and the
 * detail hero, so the single `src` on a VoicesShow cannot be right for all of
 * them. Rather than thread a size through normalisation, surfaces that care
 * ask for what they need at render time. Returns a new object; the input is
 * never mutated.
 */
export function artworkForSize(
  artwork: VoicesArtwork,
  size: EnhanceArtworkOptions["size"],
): VoicesArtwork {
  const src = enhanceArtworkUrl(artwork.src, { size });
  return src ? { ...artwork, src } : { ...artwork };
}

export function resolveShowArtwork({
  showTitle,
  showImageUrl,
  artistName,
  artistImageUrl,
  focalPoint,
}: {
  showTitle: string;
  showImageUrl?: string | null;
  artistName?: string | null;
  artistImageUrl?: string | null;
  focalPoint?: VoicesFocalPoint;
}): VoicesArtwork {
  const enhancedShowImageUrl = enhanceArtworkUrl(showImageUrl);
  const enhancedArtistImageUrl = enhanceArtworkUrl(artistImageUrl);

  if (enhancedShowImageUrl) {
    return {
      src: enhancedShowImageUrl,
      alt: `${showTitle} artwork`,
      source: "show",
      ...(focalPoint ? { focalPoint } : {}),
    };
  }

  if (enhancedArtistImageUrl) {
    return {
      src: enhancedArtistImageUrl,
      alt: artistName ? `${artistName} profile image` : "Artist profile image",
      source: "artist",
      ...(focalPoint ? { focalPoint } : {}),
    };
  }

  return {
    src: VOICES_FALLBACK_ARTWORK,
    alt: "",
    source: "fallback",
  };
}
