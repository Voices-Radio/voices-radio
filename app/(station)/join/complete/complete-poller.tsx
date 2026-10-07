"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import {
  formatMembershipDate,
  formatMinorUnitsWithCadence,
} from "@/lib/voices/membership/format";
import type { MembershipState } from "@/lib/voices/membership/schemas";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 15_000;

// Statuses that mean a payment really landed. Everything else — still
// pending, `null` (never subscribed / checkout lapsed) or `expired` — must
// not be celebrated: this page is also reachable by back button or bookmark
// without paying.
const PAID_STATUSES = new Set([
  "active",
  "grace",
  "cancelling",
  "complimentary",
]);

/**
 * Stripe can redirect back here before the webhook has settled the
 * payment (contract §10). Polls GET /api/membership/me for up to ~15s
 * waiting for `status` to leave `pending_reconciliation` — no success
 * state renders until the backend actually confirms it.
 */
export default function CompletePoller() {
  const [timedOut, setTimedOut] = useState(false);

  const { data, error } = useSWR<MembershipState>(
    "/api/membership/me",
    fetcher,
    {
      refreshInterval: (latest) =>
        latest && latest.status !== "pending_reconciliation"
          ? 0
          : POLL_INTERVAL_MS,
    },
  );

  const reconciled = Boolean(data?.status && PAID_STATUSES.has(data.status));
  // The backend answered and there is no payment behind it.
  const notPaid = Boolean(
    data && data.status !== "pending_reconciliation" && !reconciled,
  );

  useEffect(() => {
    if (!reconciled) return;
    trackMembershipEvent({ name: "membership_checkout_reconciled" });
  }, [reconciled]);

  useEffect(() => {
    if (reconciled || notPaid) return;
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [reconciled, notPaid]);

  if (reconciled) {
    const price =
      typeof data?.priceMinor === "number" && data.currency && data.cadence
        ? formatMinorUnitsWithCadence(
            data.priceMinor,
            data.currency,
            data.cadence,
          )
        : null;
    const renewsOn = formatMembershipDate(data?.renewsAt ?? null);

    // This used to router.replace("/account") the instant reconciliation
    // landed, so "Payment confirmed" existed for roughly one frame and the
    // highest-stakes moment in the product ended on a generic account page.
    // The membership is already active by the time this renders — the visitor
    // leaves when they choose to, not when a redirect fires.
    return (
      <div role="status" aria-live="polite">
        <p className="font-outfit text-2xl font-black uppercase text-voicesNext-cream">
          You&rsquo;re a Voices member
        </p>

        <dl className="mt-6 flex flex-col gap-3 border-t border-voicesNext-border pt-5">
          {price && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <dt className="font-asap text-xs font-bold uppercase tracking-[1.2px] text-voicesNext-cream/60">
                Billing
              </dt>
              <dd className="font-gabarito text-base font-bold text-voicesNext-cream">
                {price}
              </dd>
            </div>
          )}
          {renewsOn && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <dt className="font-asap text-xs font-bold uppercase tracking-[1.2px] text-voicesNext-cream/60">
                Next payment
              </dt>
              <dd className="font-gabarito text-base font-bold text-voicesNext-cream">
                {renewsOn}
              </dd>
            </div>
          )}
        </dl>

        <p className="mt-6 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          A receipt is on its way to your inbox. Your benefits are live now —
          you can see and claim them from your account.
        </p>

        <Link
          href="/account"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          Go to your account
        </Link>
      </div>
    );
  }

  if (notPaid) {
    return (
      <div role="status" aria-live="polite">
        <p className="font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          We haven&rsquo;t received a payment, so you&rsquo;re not a member yet.
          Nothing has been charged.
        </p>
        <Link
          href="/join"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          Back to join
        </Link>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div role="status" aria-live="polite">
        <p className="font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          Your payment is taking a little longer to confirm than usual. Your
          membership will appear on your account once it does. If it
          hasn&rsquo;t within a few minutes,{" "}
          <Link
            href="/support"
            className="font-bold underline underline-offset-2 hover:text-voicesNext-orange"
          >
            get in touch
          </Link>{" "}
          and we&rsquo;ll sort it out.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        >
          Go to your account
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="font-gabarito text-base text-voicesNext-cream/90"
      >
        We couldn&rsquo;t check your payment status just now. Refresh this page
        to try again.
      </p>
    );
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="font-gabarito text-base text-voicesNext-cream/90"
    >
      Payment received, activating your membership…
    </p>
  );
}
