import "server-only";
import type { z } from "zod";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { authedFetch } from "./session";
import { describeErrorResponse } from "./membership-client";
import { describeMembershipError } from "./errors";
import {
  artistProfileSchema,
  profileLookupResultSchema,
  type ArtistProfile,
  type ArtistSocialLinks,
  type ProfileLookupResult,
} from "./schemas";

export type ArtistProfileResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

const MY_PROFILE_PATH = "/api/artists/presenter/my-profile";

async function artistProfileRequest<T>(
  init: RequestInit,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  path: string = MY_PROFILE_PATH,
): Promise<ArtistProfileResult<T>> {
  try {
    const response = await authedFetch(path, init);

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const payload = await response.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        "Voices artist profile response failed validation:",
        parsed.error.flatten(),
      );
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: describeMembershipError("INVALID_RESPONSE"),
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices artist profile request failed:", error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: describeMembershipError("NETWORK_ERROR"),
    };
  }
}

export function getArtistProfile() {
  return artistProfileRequest<ArtistProfile>(
    { method: "GET" },
    artistProfileSchema,
  );
}

export function updateArtistProfile(input: {
  bio?: string;
  imageUrl?: string;
  bannerUrl?: string;
  genres?: string[];
  mixcloudUsername?: string;
  soundcloudUsername?: string;
  socialLinks?: Partial<ArtistSocialLinks>;
}) {
  return artistProfileRequest<ArtistProfile>(
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    artistProfileSchema,
  );
}

export type ArtistImageKind = "profile" | "banner";

/**
 * Uploads a DJ's profile or banner image. A dedicated call rather than a
 * variant of updateArtistProfile(): that call sends JSON, this sends
 * multipart form data, and the two can't share a body encoding. Saves
 * immediately, independent of the rest of the profile form — see
 * routes/artists.js's POST /presenter/my-profile/image.
 *
 * No explicit Content-Type header: fetch sets the multipart boundary itself
 * from the FormData body, and overriding it here would drop the boundary.
 */
export function uploadArtistProfileImage(kind: ArtistImageKind, file: File) {
  const body = new FormData();
  body.append("image", file);

  return artistProfileRequest<ArtistProfile>(
    { method: "POST", body },
    artistProfileSchema,
    `${MY_PROFILE_PATH}/image?kind=${kind}`,
  );
}

export type ProfileLookupPlatform = "mixcloud" | "soundcloud";

/**
 * Advisory "does this account exist?" check for the Mixcloud/SoundCloud
 * username fields. See profileLookupResultSchema for why the result is a
 * three-state status rather than a boolean, and services/profileLookup.js
 * for the backend side.
 */
export function lookupArtistUsername(
  platform: ProfileLookupPlatform,
  username: string,
) {
  return artistProfileRequest<ProfileLookupResult>(
    { method: "GET" },
    profileLookupResultSchema,
    `/api/artists/presenter/lookup/${platform}/${encodeURIComponent(username)}`,
  );
}
