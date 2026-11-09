"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionRateLimited } from "@/lib/voices/action-rate-limit";
import { AUTH_RATE_LIMITS } from "@/lib/voices/rate-limit";
import { backendLogin } from "@/lib/voices/membership/auth-client";
import { resolvePostLoginPath } from "@/lib/voices/membership/capabilities";
import {
  getCapabilities,
  setSessionCookies,
} from "@/lib/voices/membership/session";

const schema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export type SignInState =
  | {
      /** Set when the account exists but its email was never confirmed. */
      needsVerificationFor?: string;
      formError?: string;
      fieldErrors?: Partial<Record<"email" | "password", string>>;
    }
  | undefined;

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  // Before any work: this is the real sign-in path, and the one an attacker
  // brute-forces.
  const limited = await actionRateLimited(AUTH_RATE_LIMITS.login);
  if (limited) return { formError: limited };

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: NonNullable<SignInState>["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") {
        // A field can fail multiple chained checks (e.g. both .min() and
        // .email() on an empty string) — keep the first, most fundamental
        // one ("enter your email") rather than the last ("enter a valid
        // email"), which reads oddly for a field that was left blank.
        fieldErrors[key] ??= issue.message;
      }
    }
    return { fieldErrors, formError: "Please fix the errors below." };
  }

  const { ok, status, payload } = await backendLogin({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // The backend refuses an unconfirmed account with a 401 like a wrong
  // password. Saying "incorrect password" to someone who typed it right, and
  // who has no way to get a new link, is the dead end this branch removes.
  if (status === 401 && payload?.needsVerification) {
    return {
      needsVerificationFor: parsed.data.email,
      formError:
        "You need to confirm your email before signing in. We sent you a link when you signed up.",
    };
  }

  // Joined and paid through the payment-first flow, but never chose a password:
  // the account has none to check. The emailed link sets one.
  if (status === 401 && payload?.needsSetup) {
    return {
      needsVerificationFor: parsed.data.email,
      formError:
        "Your account isn't set up yet. Use the link we emailed you to confirm your email and create your password, or get a new one below.",
    };
  }

  if (!ok || !payload?.token || !payload?.refreshToken) {
    return {
      formError:
        status === 401
          ? "Incorrect email or password."
          : payload?.message || "We couldn't sign you in. Please try again.",
    };
  }

  await setSessionCookies({
    token: payload.token,
    refreshToken: payload.refreshToken,
  });

  const capabilities = await getCapabilities();
  redirect(
    resolvePostLoginPath({
      next: parsed.data.next,
      capabilities,
    }),
  );
}
