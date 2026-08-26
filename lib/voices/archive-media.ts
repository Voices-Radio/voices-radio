import type {
  VoicesArchiveMedia,
  VoicesArtwork,
  VoicesPlatform,
} from "./types";

type BuildArchiveMediaInput = {
  showId: string;
  title: string;
  artwork: VoicesArtwork;
  artistName?: string;
  duration?: number | null;
  platform?: VoicesPlatform;
  mixcloudUrl?: string | null;
  soundcloudUrl?: string | null;
  mixcloudKey?: string | null;
  soundcloudId?: string | null;
  platformId?: string | null;
  url?: string | null;
};

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function firstClean(values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = clean(value);
    if (trimmed) return trimmed;
  }

  return undefined;
}

function parseUrl(value?: string | null) {
  const trimmed = clean(value);
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

function isMixcloudUrl(value?: string | null) {
  const parsed = parseUrl(value);
  if (!parsed) return false;

  const hostname = parsed.hostname.replace(/^www\./, "");
  return hostname === "mixcloud.com";
}

function isSoundCloudUrl(value?: string | null) {
  const parsed = parseUrl(value);
  if (!parsed) return false;

  const hostname = parsed.hostname.replace(/^www\./, "");
  return hostname === "soundcloud.com" || hostname === "api.soundcloud.com";
}

function normalizePath(path: string) {
  const cleanPath = path.split("?")[0]?.replace(/^\/+|\/+$/g, "");
  return cleanPath ? `/${cleanPath}/` : null;
}

export function getMixcloudFeedPath(value?: string | null) {
  const trimmed = clean(value);
  if (!trimmed) return null;

  const parsed = parseUrl(trimmed);
  if (parsed) {
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "player-widget.mixcloud.com") {
      const feed = parsed.searchParams.get("feed");
      return normalizePath(feed ?? "");
    }

    if (hostname !== "mixcloud.com") return null;
    return normalizePath(parsed.pathname);
  }

  if (trimmed.includes("://") || trimmed.includes(" ")) return null;
  return normalizePath(trimmed);
}

function buildMixcloudUrl(feedPath: string) {
  return `https://www.mixcloud.com${feedPath}`;
}

function buildMixcloudEmbedUrl(feedPath: string) {
  const params = new URLSearchParams({
    hide_cover: "1",
    mini: "1",
    light: "1",
    feed: feedPath,
  });

  return `https://www.mixcloud.com/widget/iframe/?${params.toString()}`;
}

export function getSoundCloudTrackId(value?: string | null) {
  const trimmed = clean(value);
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return trimmed;

  const parsed = parseUrl(trimmed);
  if (!parsed) {
    const path = trimmed.replace(/^\/+|\/+$/g, "");
    return path.includes("/") ? path : null;
  }

  const hostname = parsed.hostname.replace(/^www\./, "");

  if (hostname === "w.soundcloud.com") {
    return getSoundCloudTrackId(parsed.searchParams.get("url"));
  }

  if (hostname === "api.soundcloud.com") {
    const match = parsed.pathname.match(/^\/tracks\/(\d+)/);
    return match?.[1] ?? null;
  }

  if (hostname !== "soundcloud.com") return null;

  const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  return segments.slice(0, 2).join("/");
}

function getSoundCloudTrackUrl(value?: string | null) {
  const trackId = getSoundCloudTrackId(value);
  if (!trackId) return null;

  return /^\d+$/.test(trackId)
    ? `https://api.soundcloud.com/tracks/${trackId}`
    : `https://soundcloud.com/${trackId}`;
}

function buildSoundCloudEmbedUrl(trackUrl: string) {
  const params = new URLSearchParams({
    url: trackUrl,
    color: "#D34E24",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
    buying: "false",
    sharing: "false",
    download: "false",
  });

  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export function buildArchiveMedia({
  showId,
  title,
  artwork,
  artistName,
  duration,
  platform,
  mixcloudUrl,
  soundcloudUrl,
  mixcloudKey,
  soundcloudId,
  platformId,
  url,
}: BuildArchiveMediaInput): VoicesArchiveMedia | undefined {
  const soundCloudSource = firstClean([
    soundcloudUrl,
    isSoundCloudUrl(url) ? url : undefined,
    platform === "soundcloud" ? platformId : undefined,
    soundcloudId,
  ]);

  if (platform === "soundcloud" || soundCloudSource) {
    const trackUrl = getSoundCloudTrackUrl(soundCloudSource);
    const providerId = getSoundCloudTrackId(soundCloudSource);

    if (trackUrl && providerId) {
      return {
        id: showId,
        provider: "soundcloud",
        title,
        sourceUrl: trackUrl,
        embedUrl: buildSoundCloudEmbedUrl(trackUrl),
        externalUrl:
          firstClean([soundcloudUrl, isSoundCloudUrl(url) ? url : undefined]) ??
          trackUrl,
        artwork,
        artistName: clean(artistName),
        duration: duration ?? undefined,
        providerId,
      };
    }
  }

  const mixcloudSource = firstClean([
    mixcloudUrl,
    isMixcloudUrl(url) ? url : undefined,
    mixcloudKey,
    platform === "mixcloud" ? platformId : undefined,
  ]);
  const feedPath = getMixcloudFeedPath(mixcloudSource);

  if (!feedPath) return undefined;

  const sourceUrl = mixcloudSource && isMixcloudUrl(mixcloudSource)
    ? mixcloudSource
    : buildMixcloudUrl(feedPath);

  return {
    id: showId,
    provider: "mixcloud",
    title,
    sourceUrl,
    embedUrl: buildMixcloudEmbedUrl(feedPath),
    externalUrl: sourceUrl,
    artwork,
    artistName: clean(artistName),
    duration: duration ?? undefined,
    providerKey: feedPath,
  };
}
