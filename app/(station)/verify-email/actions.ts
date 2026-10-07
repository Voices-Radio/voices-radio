"use server";

import { redirect } from "next/navigation";
import { backendVerifyEmail } from "@/lib/voices/membership/auth-client";
import { resolvePostLoginPath } from "@/lib/voices/membership/capabilities";
import { safeInternalPathOrUndefined } from "@/lib/voices/membership/paths";
import {
  getCapabilities,
  setAccessTokenCookie,
  setSessionCookies,
} from "@/lib/voices/membership/session";

export type VerifyEmailResult = { status: "error"; message: string } | undefined;

const LINK_UNUSABLE =
  "This link has expired or has already been used. If you’ve already confirmed your email, sign in to carry on.";

/**
 * Spends the emailed token, signs the member in, and sends them on to `next`
 * (back into checkout, or their account). Only returns on failure — success
 * always redirects.
 */
export async function verifyEmailAction(
  token: string,
  next: string | undefined,
): Promise<VerifyEmailResult> {
  if (!token) {
    return { status: "error", message: "This link is missing its verification code." };
  }

  const { ok, payload } = await backendVerifyEmail(token);

  if (!ok || !payload?.token) {
    return { status: "error", message: LINK_UNUSABLE };
  }

  if (payload.refreshToken) {
    await setSessionCookies({
      token: payload.token,
      refreshToken: payload.refreshToken,
    });
  } else {
    // An older backend returns only the access token: still signed in, just
    // for an hour rather than 30 days.
    await setAccessTokenCookie({ token: payload.token });
  }

  const capabilities = await getCapabilities();
  redirect(
    resolvePostLoginPath({
      next: safeInternalPathOrUndefined(next),
      capabilities,
    }),
  );
}
