"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateArtistProfile } from "@/lib/voices/membership/artist-profile-client";

const optionalText = z.string().max(2_000).optional();

const schema = z.object({
  bio: optionalText,
  imageUrl: z.string().url().or(z.literal("")).optional(),
  bannerUrl: z.string().url().or(z.literal("")).optional(),
  genres: z.string().max(1_000).optional(),
  mixcloudUsername: z.string().max(120).optional(),
  soundcloudUsername: z.string().max(240).optional(),
  instagram: z.string().url().or(z.literal("")).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  twitter: z.string().url().or(z.literal("")).optional(),
  facebook: z.string().url().or(z.literal("")).optional(),
});

export type ArtistProfileState =
  | { status: "success" }
  | { status: "error"; message: string }
  | undefined;

function optionalValue(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function splitGenres(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean)
    : [];
}

export async function updateArtistProfileAction(
  _prevState: ArtistProfileState,
  formData: FormData,
): Promise<ArtistProfileState> {
  const parsed = schema.safeParse({
    bio: optionalValue(formData.get("bio")),
    imageUrl: optionalValue(formData.get("imageUrl")) ?? "",
    bannerUrl: optionalValue(formData.get("bannerUrl")) ?? "",
    genres: optionalValue(formData.get("genres")),
    mixcloudUsername: optionalValue(formData.get("mixcloudUsername")),
    soundcloudUsername: optionalValue(formData.get("soundcloudUsername")),
    instagram: optionalValue(formData.get("instagram")) ?? "",
    website: optionalValue(formData.get("website")) ?? "",
    twitter: optionalValue(formData.get("twitter")) ?? "",
    facebook: optionalValue(formData.get("facebook")) ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check your artist profile details and try again.",
    };
  }

  const socialLinks = Object.fromEntries(
    (["instagram", "website", "twitter", "facebook"] as const)
      .map((key) => [key, parsed.data[key] || undefined] as const)
      .filter(([, value]) => value),
  );

  const result = await updateArtistProfile({
    bio: parsed.data.bio,
    imageUrl: parsed.data.imageUrl || undefined,
    bannerUrl: parsed.data.bannerUrl || undefined,
    genres: splitGenres(parsed.data.genres),
    mixcloudUsername: parsed.data.mixcloudUsername,
    soundcloudUsername: parsed.data.soundcloudUsername,
    socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/account/artist");
  return { status: "success" };
}
