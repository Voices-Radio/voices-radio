"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/voices/membership/membership-mutations";

const addressPart = z.string().max(200).optional();

const schema = z.object({
  displayName: z.string().max(80).optional(),
  supporterWallOptIn: z.string().optional(),
  marketingConsent: z.string().optional(),
  line1: addressPart,
  line2: addressPart,
  city: addressPart,
  postcode: addressPart,
  country: addressPart,
});

const ADDRESS_PARTS = [
  "line1",
  "line2",
  "city",
  "postcode",
  "country",
] as const;

export type ProfileState =
  { status: "success" } | { status: "error"; message: string } | undefined;

/**
 * supporterWallOptIn and marketingConsent are independently controlled
 * (contract §9 / brief test #16) — this always sends the form's current
 * checked state for both, so unchecking one never touches the other.
 */
export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = schema.safeParse({
    displayName: formData.get("displayName") || undefined,
    supporterWallOptIn: formData.get("supporterWallOptIn") ?? undefined,
    marketingConsent: formData.get("marketingConsent") ?? undefined,
    ...Object.fromEntries(
      ADDRESS_PARTS.map((part) => [
        part,
        formData.get(`address.${part}`) || undefined,
      ]),
    ),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check your details and try again.",
    };
  }

  // Only send `address` when at least one part was filled in. Sending an
  // object of empty strings would overwrite a stored address with blanks.
  const addressParts = ADDRESS_PARTS.reduce<Record<string, string>>(
    (acc, part) => {
      const value = parsed.data[part];
      if (value) acc[part] = value;
      return acc;
    },
    {},
  );

  const result = await updateProfile({
    displayName: parsed.data.displayName,
    supporterWallOptIn: parsed.data.supporterWallOptIn === "on",
    marketingConsent: parsed.data.marketingConsent === "on",
    address: Object.keys(addressParts).length ? addressParts : undefined,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/account/profile");
  return { status: "success" };
}
