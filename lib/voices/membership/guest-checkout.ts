import "server-only";
import { VOICES_MEMBERSHIP_API_BASE_URL } from "@/lib/voices/config";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { describeErrorResponse } from "./membership-client";
import { backendClientHeaders } from "./backend-headers";
import { describeMembershipError } from "./errors";
import {
  checkoutResponseSchema,
  guestCheckoutStatusSchema,
  resumeCheckoutResponseSchema,
  type CheckoutResponse,
  type GuestCheckoutStatus,
  type ResumeCheckoutResponse,
} from "./schemas";

export type GuestResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string };

/**
 * Payment-first join: starts Stripe Checkout for someone who has given a name
 * and email but has no password yet. The backend creates a pending account
 * for them, or answers ACCOUNT_EXISTS (a normal account already uses the
 * address) / SETUP_PENDING (they have already joined and paid).
 */
export async function guestCheckout(input: {
  firstName: string;
  lastName: string;
  email: string;
  newsletters: boolean;
  memberUpdates: boolean;
  amountMinor: number;
  cadence: "monthly" | "annual";
  successUrl: string;
  cancelUrl: string;
  source?: "reminder";
}): Promise<GuestResult<CheckoutResponse>> {
  try {
    const response = await fetch(
      `${VOICES_MEMBERSHIP_API_BASE_URL}/api/membership/guest-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await backendClientHeaders()),
        },
        body: JSON.stringify(input),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const parsed = checkoutResponseSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (!parsed.success) {
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: describeMembershipError("INVALID_RESPONSE"),
      };
    }
    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices guest checkout failed:", error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: describeMembershipError("NETWORK_ERROR"),
    };
  }
}

/**
 * The reminder email's "Finish joining", for a guest joiner (no password, so
 * no session): trades the signed token from the link for a fresh Stripe
 * session at the amount they already chose. The backend answers LINK_INVALID
 * (bad/expired token), ACCOUNT_EXISTS (they have a full account now) or
 * SETUP_PENDING (already paid; a new set-password link is on its way).
 */
export async function resumeCheckout(
  token: string,
): Promise<GuestResult<ResumeCheckoutResponse>> {
  try {
    const response = await fetch(
      `${VOICES_MEMBERSHIP_API_BASE_URL}/api/membership/resume-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await backendClientHeaders()),
        },
        body: JSON.stringify({ token }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const parsed = resumeCheckoutResponseSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (!parsed.success) {
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: describeMembershipError("INVALID_RESPONSE"),
      };
    }
    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices resume checkout failed:", error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: describeMembershipError("NETWORK_ERROR"),
    };
  }
}

/** What the success page polls: is the payment confirmed, and which inbox to open. */
export async function getGuestCheckoutStatus(
  sessionId: string,
): Promise<GuestResult<GuestCheckoutStatus>> {
  try {
    const response = await fetch(
      `${VOICES_MEMBERSHIP_API_BASE_URL}/api/membership/guest-checkout/${encodeURIComponent(sessionId)}`,
      { headers: await backendClientHeaders(), cache: "no-store" },
    );

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const parsed = guestCheckoutStatusSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (!parsed.success) {
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: describeMembershipError("INVALID_RESPONSE"),
      };
    }
    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices guest checkout status failed:", error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: describeMembershipError("NETWORK_ERROR"),
    };
  }
}
