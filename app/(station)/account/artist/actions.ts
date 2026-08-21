"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  lookupArtistUsername,
  updateArtistProfile,
  uploadArtistProfileImage,
  type ArtistImageKind,
  type ProfileLookupPlatform,
} from "@/lib/voices/membership/artist-profile-client";
import type { ArtistProfile } from "@/lib/voices/membership/schemas";

const optionalText = z.string().max(2_000).optional();
const optionalUrl = z.string().url().or(z.literal("")).optional();

const schema = z.object({
  bio: optionalText,
  imageUrl: optionalUrl,
  bannerUrl: optionalUrl,
  genres: z.string().max(2_000).optional(),
  mixcloudUsername: z.string().max(200).optional(),
  soundcloudUsername: z.string().max(200).optional(),
  instagram: optionalUrl,
  website: optionalUrl,
  twitter: optionalUrl,
  facebook: optionalUrl,
});

export type ArtistProfileState =
  | { status: "success" }
  | { status: "error"; message: string }
  | undefined;

/**
 * Reads a field only if this submission actually included it, distinguishing
 * "the DJ cleared this" (the key is present, value "") from "this control
 * wasn't part of this submit" (the key is absent — e.g. the image URL text
 * input is unmounted while ImageField is showing the upload UI instead).
 *
 * The previous version (`optionalValue`) collapsed both into `undefined`,
 * which made it impossible to blank out a bio, image URL, or social link:
 * an empty string was silently discarded rather than saved as "now empty".
 */
function presentValue(formData: FormData, key: string): string | undefined {
  if (!formData.has(key)) return undefined;
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

/** GenreTagInput serialises its chips as a JSON array into one hidden field. */
function parseGenres(raw: string | undefined): string[] | undefined {
  if (raw === undefined) return undefined;
  if (!raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((genre): genre is string => typeof genre === "string")
      .map((genre) => genre.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const PROFILE_URL_PATTERNS: Record<ProfileLookupPlatform, RegExp> = {
  mixcloud: /(?:https?:\/\/)?(?:www\.)?mixcloud\.com\/([^/?#]+)/i,
  soundcloud: /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/([^/?#]+)/i,
};

/**
 * A DJ may paste a full profile URL or a handle with a leading `@` into the
 * username field — reduce either to the bare username the backend (and
 * RadioCult) expect. Mirrors services/profileLookup.js's normalizeUsername
 * on the backend, which applies the same cleanup to the lookup check; doing
 * it here too means what gets saved matches what the lookup confirmed.
 */
function normalizeUsername(
  platform: ProfileLookupPlatform,
  raw: string | undefined,
): string | undefined {
  if (raw === undefined) return undefined;
  const withoutAt = raw.replace(/^@/, "");
  const match = withoutAt.match(PROFILE_URL_PATTERNS[platform]);
  const username = match ? match[1] : withoutAt;
  return username.replace(/\/+$/, "");
}

export async function updateArtistProfileAction(
  _prevState: ArtistProfileState,
  formData: FormData,
): Promise<ArtistProfileState> {
  const parsed = schema.safeParse({
    bio: presentValue(formData, "bio"),
    imageUrl: presentValue(formData, "imageUrl"),
    bannerUrl: presentValue(formData, "bannerUrl"),
    genres: presentValue(formData, "genres"),
    mixcloudUsername: presentValue(formData, "mixcloudUsername"),
    soundcloudUsername: presentValue(formData, "soundcloudUsername"),
    instagram: presentValue(formData, "instagram"),
    website: presentValue(formData, "website"),
    twitter: presentValue(formData, "twitter"),
    facebook: presentValue(formData, "facebook"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check your artist profile details and try again.",
    };
  }

  const socialKeys = ["instagram", "website", "twitter", "facebook"] as const;
  const socialLinks = Object.fromEntries(
    socialKeys
      .filter((key) => parsed.data[key] !== undefined)
      .map((key) => [key, parsed.data[key]] as const),
  );

  const result = await updateArtistProfile({
    bio: parsed.data.bio,
    imageUrl: parsed.data.imageUrl,
    bannerUrl: parsed.data.bannerUrl,
    genres: parseGenres(parsed.data.genres),
    mixcloudUsername: normalizeUsername("mixcloud", parsed.data.mixcloudUsername),
    soundcloudUsername: normalizeUsername("soundcloud", parsed.data.soundcloudUsername),
    socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/account/artist");
  return { status: "success" };
}

export type ImageUploadState =
  | { status: "success"; profile: ArtistProfile }
  | { status: "error"; message: string };

/**
 * Called directly from ImageField's onChange (not bound to the main
 * <form>'s action) — the upload is its own save, independent of whatever
 * else is unsaved elsewhere on the page. See uploadArtistProfileImage() for
 * why this needs its own client function rather than reusing
 * updateArtistProfileAction's JSON path.
 */
export async function uploadArtistImageAction(
  kind: ArtistImageKind,
  formData: FormData,
): Promise<ImageUploadState> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Please choose an image file." };
  }

  const result = await uploadArtistProfileImage(kind, file);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/account/artist");
  return { status: "success", profile: result.data };
}

export type LookupState =
  | { status: "found"; displayName: string }
  | { status: "not_found" }
  | { status: "unavailable" };

/**
 * Called directly from UsernameField's debounced blur handler. Never throws
 * and never reports an error the DJ would act on — the worst case is
 * 'unavailable', the same as an upstream outage, so a network hiccup on our
 * own side degrades the same way a third-party one does.
 */
export async function lookupUsernameAction(
  platform: ProfileLookupPlatform,
  username: string,
): Promise<LookupState> {
  const trimmed = username.trim();
  if (!trimmed) return { status: "unavailable" };

  const result = await lookupArtistUsername(platform, trimmed);
  if (!result.ok) return { status: "unavailable" };

  if (result.data.status === "found") {
    return {
      status: "found",
      displayName: result.data.displayName || trimmed,
    };
  }

  return { status: result.data.status };
}
