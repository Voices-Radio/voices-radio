"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/voices/membership/membership-mutations";

const schema = z.object({
  displayName: z.string().max(80).optional(),
  supporterWallOptIn: z.string().optional(),
  marketingConsent: z.string().optional(),
  address: z.string().max(500).optional(),
});

export type ProfileState =
  | { status: "success" }
  | { status: "error"; message: string }
  | undefined;

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
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check your details and try again.",
    };
  }

  const result = await updateProfile({
    displayName: parsed.data.displayName,
    supporterWallOptIn: parsed.data.supporterWallOptIn === "on",
    marketingConsent: parsed.data.marketingConsent === "on",
    address: parsed.data.address,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/account/profile");
  return { status: "success" };
}
