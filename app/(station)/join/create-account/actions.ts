"use server";

import { z } from "zod";
import {
  backendLogin,
  backendRegister,
} from "@/lib/voices/membership/auth-client";
import { setSessionCookies } from "@/lib/voices/membership/session";
import { startCheckout } from "@/lib/voices/membership/start-checkout";

const schema = z.object({
  firstName: z.string().min(1, "Enter your first name."),
  lastName: z.string().min(1, "Enter your last name."),
  email: z
    .string()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  newsletters: z.string().optional(),
  tier: z.string().optional(),
  cadence: z.string().optional(),
});

type FieldErrors = Partial<
  Record<"email" | "password" | "firstName" | "lastName", string>
>;

/**
 * What the visitor typed, echoed back so an error doesn't cost them the form.
 * Password is deliberately absent — re-populating a password field means
 * putting the plaintext back into the HTML on every failed attempt.
 */
export type CreateAccountValues = {
  firstName: string;
  lastName: string;
  email: string;
  newsletters: boolean;
};

export type CreateAccountState =
  | {
      status: "error";
      formError?: string;
      fieldErrors?: FieldErrors;
      values: CreateAccountValues;
    }
  | { status: "verify_email"; email: string }
  | { status: "checkout_error"; message: string }
  | undefined;

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
  };

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    newsletters: formData.get("newsletters") ?? undefined,
    tier: formData.get("tier") || undefined,
    cadence: formData.get("cadence") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        key === "email" ||
        key === "password" ||
        key === "firstName" ||
        key === "lastName"
      ) {
        // Keep the first (most fundamental) issue per field — see the
        // matching comment in sign-in/actions.ts.
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

  const { email, password, firstName, lastName, newsletters, tier, cadence } =
    parsed.data;

  const registerResult = await backendRegister({
    email,
    password,
    firstName,
    lastName,
    newsletters: newsletters === "on",
  });

  if (!registerResult.ok) {
    return {
      status: "error",
      formError:
        registerResult.payload?.message ||
        "We couldn't create your account. Please try again.",
      values,
    };
  }

  // Registration may require email verification before login succeeds.
  // Try signing the new member straight in; fall back to a check-your-email
  // state if the backend rejects it.
  const loginResult = await backendLogin({ email, password });

  if (
    loginResult.ok &&
    loginResult.payload?.token &&
    loginResult.payload?.refreshToken
  ) {
    await setSessionCookies({
      token: loginResult.payload.token,
      refreshToken: loginResult.payload.refreshToken,
    });

    // startCheckout() redirects straight to Stripe on success and never
    // returns; it only comes back here on failure, with the account
    // already created and the member already signed in, so we show the
    // checkout error rather than losing that progress.
    const failure = await startCheckout(tier, cadence);
    return { status: "checkout_error", message: failure.message };
  }

  return { status: "verify_email", email };
}
