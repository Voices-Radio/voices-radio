import type { VoicesArtist } from "./types";

export type ArtistLinkSource = Pick<
  VoicesArtist,
  "mixcloudUsername" | "soundcloudUsername" | "socialLinks"
>;

export type ArtistLink = { label: string; href: string };

// Artist social fields are free text from RadioCult and the DJ profile form:
// a mix of full URLs, URLs without a protocol, @handles and bare handles, and
// about 40 artists keep their Instagram URL in the website field. Used as an
// href as-is, a bare handle resolves against our own domain
// (/artists/arniewrong → 404), so every value is turned into an absolute
// https URL here, or the button is left out.

const HANDLE_PATTERN = /^[A-Za-z0-9._-]{1,60}$/;
const INSTAGRAM_HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/;

/** First whitespace-separated token as an http(s) URL with a real hostname. */
function toHttpUrl(value: string | null | undefined): URL | null {
  const token = value?.trim().split(/\s+/)[0];
  if (!token) return null;

  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(token)
    ? token
    : `https://${token}`;

  try {
    const url = new URL(withProtocol);
    const isHttp = url.protocol === "https:" || url.protocol === "http:";
    const hasTld = /\.[a-z]{2,}$/i.test(url.hostname);
    return isHttp && hasTld ? url : null;
  } catch {
    return null;
  }
}

function isUrlLike(value: string) {
  return /^https?:\/\//i.test(value) || /^[^\s/]+\.[a-z]{2,}\//i.test(value);
}

function isInstagramUrl(url: URL) {
  return /(^|\.)instagram\.com$/i.test(url.hostname);
}

function toHandle(value: string | null | undefined, pattern: RegExp) {
  const handle = value?.trim().replace(/^@/, "").replace(/\/+$/, "");
  return handle && pattern.test(handle) ? handle : null;
}

function instagramHref(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (isUrlLike(trimmed)) {
    const url = toHttpUrl(trimmed);
    return url && isInstagramUrl(url) ? url.href : null;
  }

  const handle = toHandle(trimmed, INSTAGRAM_HANDLE_PATTERN);
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

function platformHref(
  value: string | null | undefined,
  buildFromHandle: (handle: string) => string,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (isUrlLike(trimmed)) return toHttpUrl(trimmed)?.href ?? null;

  const handle = toHandle(trimmed, HANDLE_PATTERN);
  return handle ? buildFromHandle(handle) : null;
}

export function getArtistLinks(artist: ArtistLinkSource): ArtistLink[] {
  const websiteUrl = toHttpUrl(artist.socialLinks.website);
  const websiteIsInstagram = websiteUrl ? isInstagramUrl(websiteUrl) : false;

  const instagram =
    instagramHref(artist.socialLinks.instagram) ??
    (websiteIsInstagram ? websiteUrl?.href ?? null : null);

  const candidates: Array<{ label: string; href: string | null }> = [
    {
      label: "Mixcloud",
      href: platformHref(
        artist.mixcloudUsername,
        (handle) => `https://www.mixcloud.com/${handle}/`,
      ),
    },
    {
      label: "SoundCloud",
      href: platformHref(
        artist.soundcloudUsername,
        (handle) => `https://soundcloud.com/${handle}`,
      ),
    },
    { label: "Instagram", href: instagram },
    {
      label: "Website",
      href: websiteUrl && !websiteIsInstagram ? websiteUrl.href : null,
    },
  ];

  return candidates.filter((link): link is ArtistLink => Boolean(link.href));
}
