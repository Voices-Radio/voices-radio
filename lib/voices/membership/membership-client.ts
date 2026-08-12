import "server-only";
import type { z } from "zod";
import { VOICES_MEMBERSHIP_API_BASE_URL } from "@/lib/voices/config";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { getAccessToken } from "./session";
import { describeMembershipError } from "./errors";
import {
  tiersResponseSchema,
  membershipStateSchema,
  benefitsResponseSchema,
  redemptionsResponseSchema,
  membershipProfileSchema,
  backendErrorEnvelopeSchema,
  type MembershipTierApi,
  type MembershipState,
  type Benefit,
  type Redemption,
  type MembershipProfile,
} from "./schemas";

export type MembershipResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string };

/** Shared with membership-mutations.ts — parses the contract's error envelope. */
export async function describeErrorResponse(response: Response): Promise<{
  code: string;
  message: string;
}> {
  const payload = await response.json().catch(() => null);
  const parsed = backendErrorEnvelopeSchema.safeParse(payload);
  const code = parsed.success ? parsed.data.error.code : "UNKNOWN";
  const backendMessage = parsed.success ? parsed.data.error.message : null;
  return { code, message: describeMembershipError(code, backendMessage) };
}

/**
 * Public read — no session required. Used from /join, which must render
 * pricing for signed-out visitors before they create an account.
 */
export async function getTiers(): Promise<
  MembershipResult<MembershipTierApi[]>
> {
  try {
    const response = await fetch(
      `${VOICES_MEMBERSHIP_API_BASE_URL}/api/membership/tiers`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const payload = await response.json().catch(() => null);
    const parsed = tiersResponseSchema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        "Voices tiers response failed validation:",
        parsed.error.flatten(),
      );
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message:
          "Pricing is temporarily unavailable. Please try again shortly.",
      };
    }

    return { ok: true, data: parsed.data.tiers };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices getTiers failed:", error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "Pricing is temporarily unavailable. Please try again shortly.",
    };
  }
}

/**
 * Authenticated reads for the /account area. Deliberately does NOT refresh
 * on a 401 — every /account page sits behind requireSession() (see
 * session.ts), which has already guaranteed a fresh access token before
 * render. A 401 here would mean the token expired mid-request, which
 * render() can't recover from anyway (no cookie mutation); the caller
 * should treat it as "reload the page" rather than trying to refresh here.
 */
async function authedGet<T>(
  path: string,
  // Input is deliberately `unknown`, not `T`: the payload arrives untrusted
  // off the network, and binding both ends would make T resolve to the
  // schema's *input* type — reintroducing optionality for defaulted fields.
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<MembershipResult<T>> {
  const token = await getAccessToken();
  if (!token) {
    return {
      ok: false,
      code: "NO_SESSION",
      message: describeMembershipError("NO_SESSION"),
    };
  }

  try {
    const response = await fetch(`${VOICES_MEMBERSHIP_API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const payload = await response.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        `Voices ${path} response failed validation:`,
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
    console.error(`Voices ${path} failed:`, error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: describeMembershipError("NETWORK_ERROR"),
    };
  }
}

export function getMembership(): Promise<MembershipResult<MembershipState>> {
  return authedGet("/api/membership/me", membershipStateSchema);
}

export async function getBenefits(): Promise<MembershipResult<Benefit[]>> {
  const result = await authedGet(
    "/api/membership/benefits",
    benefitsResponseSchema,
  );
  return result.ok ? { ok: true, data: result.data.benefits } : result;
}

export async function getRedemptions(): Promise<
  MembershipResult<Redemption[]>
> {
  const result = await authedGet(
    "/api/membership/redemptions",
    redemptionsResponseSchema,
  );
  return result.ok ? { ok: true, data: result.data.redemptions } : result;
}

export function getProfile(): Promise<MembershipResult<MembershipProfile>> {
  return authedGet("/api/membership/profile", membershipProfileSchema);
}
