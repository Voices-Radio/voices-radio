import type { MembershipState } from "./schemas";

/**
 * How long after starting checkout a `pending_reconciliation` membership is
 * assumed to be a payment still settling rather than one that was never made.
 * Stripe redirects back and the webhook normally lands within seconds; past
 * this, the person is better served by "finish joining" than by a spinner
 * that may never end.
 */
export const SETTLING_WINDOW_MS = 5 * 60 * 1000;

export type ResumableCheckout = {
  amountMinor: number;
  cadence: "monthly" | "annual";
  /** Starts a fresh checkout for the same choice (signed-in members skip account creation). */
  href: string;
};

/**
 * The checkout this member left unfinished, or null.
 *
 * Two shapes count: the session lapsed unpaid (`status: null` with a
 * `checkout` block), or it's still `pending_reconciliation` but older than the
 * settling window. A recent pending one is deliberately NOT resumable: the
 * member may have just paid, and offering "finish joining" then invites a
 * second checkout.
 */
export function getResumableCheckout(
  state: Pick<MembershipState, "status" | "checkout">,
  now: number = Date.now(),
): ResumableCheckout | null {
  const checkout = state.checkout;
  if (!checkout) return null;

  if (state.status === "pending_reconciliation") {
    const startedAt = checkout.startedAt ? Date.parse(checkout.startedAt) : NaN;
    // Unknown start time: treat as old rather than leaving a spinner forever.
    const settling =
      Number.isFinite(startedAt) && now - startedAt < SETTLING_WINDOW_MS;
    if (settling) return null;
  } else if (state.status !== null) {
    return null;
  }

  return {
    amountMinor: checkout.amountMinor,
    cadence: checkout.cadence,
    href: `/join/checkout?amount=${checkout.amountMinor}&cadence=${checkout.cadence}`,
  };
}

/** A payment that is genuinely still settling (shown as "Activating…"). */
export function isSettling(
  state: Pick<MembershipState, "status" | "checkout">,
  now: number = Date.now(),
): boolean {
  return (
    state.status === "pending_reconciliation" &&
    getResumableCheckout(state, now) === null
  );
}
