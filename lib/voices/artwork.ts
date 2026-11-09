import { VOICES_FALLBACK_ARTWORK } from "./config";
import type { VoicesArtwork } from "./types";

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

export function resolveShowArtwork({
  showTitle,
  showImageUrl,
  artistName,
  artistImageUrl,
}: {
  showTitle: string;
  showImageUrl?: string | null;
  artistName?: string | null;
  artistImageUrl?: string | null;
}): VoicesArtwork {
  const enhancedShowImageUrl = enhanceArtworkUrl(showImageUrl);
  const enhancedArtistImageUrl = enhanceArtworkUrl(artistImageUrl);

  if (enhancedShowImageUrl) {
    return {
      src: enhancedShowImageUrl,
      alt: `${showTitle} artwork`,
      source: "show",
    };
  }

  if (enhancedArtistImageUrl) {
    return {
      src: enhancedArtistImageUrl,
      alt: artistName ? `${artistName} profile image` : "Artist profile image",
      source: "artist",
    };
  }

  return {
    src: VOICES_FALLBACK_ARTWORK,
    alt: "",
    source: "fallback",
  };
}
