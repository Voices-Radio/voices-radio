import "server-only";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/site-url";
import { checkout } from "./membership-mutations";
import { isMembershipCadence, type MembershipCadence } from "./types";

export type StartCheckoutFailure = { ok: false; message: string };

/**
 * Shared checkout-handoff step (contract §3), used by both the
 * create-account flow (a brand-new member) and the already-signed-in
 * "pick an amount" flow. On success this redirects straight to Stripe and
 * never returns; on failure it returns a result so the caller can render
 * its own error UI instead of throwing through a form action.
 */
export async function startCheckout(
  amountMinor: number | undefined,
  cadence: string | undefined,
  source?: "reminder",
): Promise<StartCheckoutFailure> {
  if (!amountMinor || !isMembershipCadence(cadence)) {
    return { ok: false, message: "Choose a contribution amount to continue." };
  }

  const origin = getBaseUrl();
  const idempotencyKey = crypto.randomUUID();

  const result = await checkout(
    {
      amountMinor,
      cadence: cadence as MembershipCadence,
      successUrl: `${origin}/join/complete`,
      // `checkout=cancelled` lets /join say "no payment taken" to someone who
      // backed out of Stripe, rather than dropping them on a bare pricing page.
      cancelUrl: `${origin}/join?cadence=${cadence}&checkout=cancelled`,
      ...(source ? { source } : {}),
    },
    idempotencyKey,
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  redirect(result.data.checkoutUrl);
}
