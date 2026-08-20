import "server-only";
import type { z } from "zod";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { authedFetch } from "./session";
import { describeErrorResponse } from "./membership-client";
import { describeMembershipError } from "./errors";
import {
  artistProfileSchema,
  type ArtistProfile,
  type ArtistSocialLinks,
} from "./schemas";

export type ArtistProfileResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

async function artistProfileRequest<T>(
  init: RequestInit,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<ArtistProfileResult<T>> {
  try {
    const response = await authedFetch("/api/artists/presenter/my-profile", init);

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
