import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { backendResendVerification } from "@/lib/voices/membership/auth-client";
import { safeInternalPathOrUndefined } from "@/lib/voices/membership/paths";
import { verificationReturnUrl } from "@/lib/voices/membership/verification-return";
import { AUTH_RATE_LIMITS, enforceRateLimit } from "@/lib/voices/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  next: z.string().optional(),
});

// Identical for "sent", "no such account" and "already verified": the answer
// must not reveal which addresses have accounts.
const GENERIC_SENT = {
  status: "sent",
  message:
    "If that address has an account waiting to be confirmed, we've sent a new link. It can take a minute to arrive.",
};

/**
 * Re-sends the verification email. Without this, someone who never opened the
 * first link (it expires after 24 hours) has no way back in: signing up again
 * says the address is taken and signing in says to verify.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(
    request,
    AUTH_RATE_LIMITS.resendVerification,
  );
  if (limited) return limited;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const next = safeInternalPathOrUndefined(parsed.data.next) ?? "/account";
  const { ok, status } = await backendResendVerification({
    email: parsed.data.email,
    verificationReturnUrl: await verificationReturnUrl(next),
  });

  // 400/404 are the enumeration-sensitive answers; anything else that isn't
  // success is a genuine failure the visitor can retry.
  if (ok || status === 400 || status === 404) {
    return NextResponse.json(GENERIC_SENT);
  }

  return NextResponse.json(
    {
      status: "error",
      message: "We couldn't send the email just now. Please try again shortly.",
    },
    { status: 502 },
  );
}
