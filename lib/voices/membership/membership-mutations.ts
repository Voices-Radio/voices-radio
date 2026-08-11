import "server-only";
import type { z } from "zod";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { authedFetch } from "./session";
import { describeErrorResponse } from "./membership-client";
import { describeMembershipError } from "./errors";
import {
  checkoutResponseSchema,
  previewChangeResponseSchema,
  immediateChangeResponseSchema,
  scheduledChangeResponseSchema,
  cancelResponseSchema,
  resumeResponseSchema,
  portalSessionResponseSchema,
  benefitSchema,
  membershipProfileSchema,
  type CheckoutResponse,
  type PreviewChangeResponse,
} from "./schemas";

export type MutationResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string };

/**
 * All authenticated mutating calls to the membership backend. Uses
 * authedFetch() (not the plain authedGet in membership-client.ts) because
 * Server Actions — unlike Server Component render — are allowed to mutate
 * cookies, so a stale access token here transparently refreshes and
 * retries instead of failing.
 */
async function authedMutate<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit,
): Promise<MutationResult<T>> {
  try {
    const response = await authedFetch(path, init);

    if (!response.ok) {
      const { code, message } = await describeErrorResponse(response);
      return { ok: false, code, message };
    }

    const payload = await response.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        `Voices ${path} mutation response failed validation:`,
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
    console.error(`Voices ${path} mutation failed:`, error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: describeMembershipError("NETWORK_ERROR"),
    };
  }
}

function jsonInit(body: unknown, idempotencyKey: string): RequestInit {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  };
}

export function checkout(
  input: {
    tierId: string;
    cadence: "monthly" | "annual";
    successUrl: string;
    cancelUrl: string;
  },
  idempotencyKey: string,
): Promise<MutationResult<CheckoutResponse>> {
  return authedMutate(
    "/api/membership/checkout",
    checkoutResponseSchema,
    jsonInit(input, idempotencyKey),
  );
}

export function previewChange(input: {
  action: "upgrade" | "downgrade" | "change_cadence" | "cancel";
  toTierId?: string;
  toCadence?: "monthly" | "annual";
}): Promise<MutationResult<PreviewChangeResponse>> {
  // Preview has no side effect, so no idempotency key — distinct from the
  // mutating calls below (contract §5).
  return authedMutate(
    "/api/membership/preview-change",
    previewChangeResponseSchema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export function upgrade(toTierId: string, idempotencyKey: string) {
  return authedMutate(
    "/api/membership/upgrade",
    immediateChangeResponseSchema,
    jsonInit({ toTierId }, idempotencyKey),
  );
}

export function downgrade(toTierId: string, idempotencyKey: string) {
  return authedMutate(
    "/api/membership/downgrade",
    scheduledChangeResponseSchema,
    jsonInit({ toTierId }, idempotencyKey),
  );
}

export function changeCadence(
  toCadence: "monthly" | "annual",
  idempotencyKey: string,
) {
  return authedMutate(
    "/api/membership/change-cadence",
    scheduledChangeResponseSchema,
    jsonInit({ toCadence }, idempotencyKey),
  );
}

export function cancelMembership(
  reason: string | undefined,
  idempotencyKey: string,
) {
  return authedMutate(
    "/api/membership/cancel",
    cancelResponseSchema,
    jsonInit(reason ? { reason } : {}, idempotencyKey),
  );
}

export function resumeMembership(idempotencyKey: string) {
  return authedMutate(
    "/api/membership/resume",
    resumeResponseSchema,
    jsonInit({}, idempotencyKey),
  );
}

export function createPortalSession(returnUrl: string | undefined) {
  return authedMutate(
    "/api/membership/portal-session",
    portalSessionResponseSchema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(returnUrl ? { returnUrl } : {}),
    },
  );
}

/**
 * Redemption's idempotency is a *different, durable* mechanism from every
 * other mutation here (contract §7: a permanent DB unique index on
 * {userId, idempotencyKey}, not the 10-minute response-replay cache behind
 * the Idempotency-Key header used above) — so the key travels in the body,
 * not a header.
 */
export function redeemBenefit(benefitId: string, idempotencyKey: string) {
  return authedMutate(
    `/api/membership/benefits/${encodeURIComponent(benefitId)}/redeem`,
    benefitSchema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idempotencyKey }),
    },
  );
}

export function updateProfile(input: {
  displayName?: string;
  supporterWallOptIn?: boolean;
  marketingConsent?: boolean;
  address?: string;
}) {
  return authedMutate("/api/membership/profile", membershipProfileSchema, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
