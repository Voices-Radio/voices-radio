"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import type { MembershipState } from "@/lib/voices/membership/schemas";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 15_000;

/**
 * Stripe can redirect back here before the webhook has settled the
 * payment (contract §10). Polls GET /api/membership/me for up to ~15s
 * waiting for `status` to leave `pending_reconciliation` — no success
 * state renders until the backend actually confirms it.
 */
export default function CompletePoller() {
  const router = useRouter();
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

  const reconciled = Boolean(data && data.status !== "pending_reconciliation");

  useEffect(() => {
    if (!reconciled) return;
    trackMembershipEvent({ name: "membership_checkout_reconciled" });
    router.replace("/account");
  }, [reconciled, router]);

  useEffect(() => {
    if (reconciled) return;
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [reconciled]);

  if (reconciled) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="font-gabarito text-base text-voicesNext-cream/90"
      >
        Payment confirmed — taking you to your account…
      </p>
    );
  }

  if (timedOut) {
    return (
      <div role="status" aria-live="polite">
        <p className="font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          We&rsquo;ve got your payment — your membership will appear shortly.
          If it doesn&rsquo;t within a few minutes,{" "}
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
      <p role="alert" className="font-gabarito text-base text-voicesNext-cream/90">
        We couldn&rsquo;t check your payment status just now. Refresh this
        page to try again.
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
