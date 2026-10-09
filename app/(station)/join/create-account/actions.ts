"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionRateLimited } from "@/lib/voices/action-rate-limit";
import { AUTH_RATE_LIMITS } from "@/lib/voices/rate-limit";
import { getBaseUrl } from "@/lib/site-url";
import { guestCheckout } from "@/lib/voices/membership/guest-checkout";
import { isMembershipCadence, parseAmountMinor } from "@/lib/voices/membership/types";

const schema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  newsletters: z.string().optional(),
  memberUpdates: z.string().optional(),
  amount: z.string().optional(),
  cadence: z.string().optional(),
});

type FieldErrors = Partial<Record<"email" | "firstName" | "lastName", string>>;

/**
 * What the visitor typed, echoed back so an error doesn't cost them the form.
 */
export type CreateAccountValues = {
  firstName: string;
  lastName: string;
  email: string;
  newsletters: boolean;
  memberUpdates: boolean;
};

export type CreateAccountState =
  | {
      status: "error";
      formError?: string;
      fieldErrors?: FieldErrors;
      values: CreateAccountValues;
    }
  // A normal account already uses this address: sign in to carry on.
  | { status: "account_exists"; email: string }
  // They already joined and paid but never set a password: a new link is on its way.
  | { status: "setup_pending"; email: string }
  | undefined;

/**
 * Payment-first join, step 2: take a name and email (no password), then go
 * straight to Stripe. The password is chosen AFTER paying, from the link we
 * email, so that it can only ever be set by someone who owns the inbox. Only
 * returns on failure; success redirects to Stripe.
 */
export async function createAccountAction(
  _prevState: CreateAccountState,
  formData: FormData,
): Promise<CreateAccountState> {
  // Captured from the raw FormData before validation runs, so the visitor's
  // input survives even the failures that never reach a parsed value.
  const values: CreateAccountValues = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    newsletters: formData.get("newsletters") === "on",
    memberUpdates: formData.get("memberUpdates") === "on",
  };

  const limited = await actionRateLimited(AUTH_RATE_LIMITS.register);
  if (limited) return { status: "error", formError: limited, values };

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    newsletters: formData.get("newsletters") ?? undefined,
    memberUpdates: formData.get("memberUpdates") ?? undefined,
    amount: formData.get("amount") || undefined,
    cadence: formData.get("cadence") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "firstName" || key === "lastName") {
        // Keep the first (most fundamental) issue per field.
        fieldErrors[key] ??= issue.message;
      }
    }
    return {
      status: "error",
      fieldErrors,
      formError: "Please fix the errors below.",
      values,
    };
  }

  const { email, firstName, lastName, newsletters, memberUpdates, amount, cadence } =
    parsed.data;
  const amountMinor = parseAmountMinor(amount);

  if (!amountMinor || !isMembershipCadence(cadence)) {
    return {
      status: "error",
      formError: "Choose a contribution amount to continue.",
      values,
    };
  }

  const origin = getBaseUrl();
  const result = await guestCheckout({
    firstName,
    lastName,
    email,
    newsletters: newsletters === "on",
    memberUpdates: memberUpdates === "on",
    amountMinor,
    cadence,
    successUrl: `${origin}/join/complete`,
    // `checkout=cancelled` lets /join say "no payment taken" to someone who
    // backed out of Stripe.
    cancelUrl: `${origin}/join?cadence=${cadence}&checkout=cancelled`,
  });

  if (!result.ok) {
    if (result.code === "ACCOUNT_EXISTS") {
      return { status: "account_exists", email };
    }
    if (result.code === "SETUP_PENDING") {
      return { status: "setup_pending", email };
    }
    return { status: "error", formError: result.message, values };
  }

  redirect(result.data.checkoutUrl);
}
