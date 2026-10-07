"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { GuestCheckoutStatus } from "@/lib/voices/membership/schemas";
import ResendVerification from "../../verify-email/resend-verification";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 20_000;

const buttonClassName =
  "mt-6 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background";

/**
 * The success page for someone who paid without ever choosing a password
 * (payment-first join). Nothing here claims membership until the backend has
 * confirmed the payment, and it tells apart "paid, still confirming" from
 * "never paid" using Stripe's own view of the session — this page is also
 * reachable by back button or a bookmarked URL.
 */
export default function GuestComplete({ sessionId }: { sessionId: string }) {
  const [timedOut, setTimedOut] = useState(false);

  const { data, error } = useSWR<GuestCheckoutStatus>(
    `/api/membership/guest-status?session_id=${encodeURIComponent(sessionId)}`,
    fetcher,
    {
      refreshInterval: (latest) =>
        latest?.paid || latest?.sessionStatus === "expired" ? 0 : POLL_INTERVAL_MS,
    },
  );

  const paid = Boolean(data?.paid);

  useEffect(() => {
    if (paid) return;
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [paid]);

  if (paid && data?.needsSetup) {
    return (
      <div role="status" aria-live="polite" data-testid="guest-paid">
        <p className="font-outfit text-2xl font-black uppercase text-voicesNext-cream">
          You&rsquo;re a Voices member
        </p>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          Thank you for joining. One last step: we&rsquo;ve emailed
          {data.email ? <> <strong>{data.email}</strong></> : " you"} a link to
          confirm your email and create your password. Open it on this or any
          device to get into your account.
        </p>
        <div className="mt-8 border-t border-voicesNext-border pt-6">
          <p className="mb-3 font-gabarito text-sm text-voicesNext-cream/70">
            Nothing arrived? Check your spam folder, or:
          </p>
          <ResendVerification next="/account" />
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div role="status" aria-live="polite" data-testid="guest-paid-existing">
        <p className="font-outfit text-2xl font-black uppercase text-voicesNext-cream">
          You&rsquo;re a Voices member
        </p>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          Your payment is confirmed. Sign in to see your membership.
        </p>
        <Link href="/sign-in?next=%2Faccount" className={buttonClassName}>
          Sign in
        </Link>
      </div>
    );
  }

  if (data?.sessionStatus === "expired" || (data?.sessionStatus === "open" && timedOut)) {
    return (
      <div role="status" aria-live="polite" data-testid="guest-unpaid">
        <p className="font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          We haven&rsquo;t received a payment, so you&rsquo;re not a member yet.
          Nothing has been charged.
        </p>
        <Link href="/join" className={buttonClassName}>
          Back to join
        </Link>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div role="status" aria-live="polite">
        <p className="font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          Your payment is taking a little longer to confirm than usual. As soon
          as it does, we&rsquo;ll email you a link to finish setting up your
          account. If nothing arrives within a few minutes,{" "}
          <Link
            href="/support"
            className="font-bold underline underline-offset-2 hover:text-voicesNext-orange"
          >
            get in touch
          </Link>{" "}
          and we&rsquo;ll sort it out.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="font-gabarito text-base text-voicesNext-cream/90">
        We couldn&rsquo;t check your payment just now. Refresh this page to try
        again.
      </p>
    );
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="font-gabarito text-base text-voicesNext-cream/90"
    >
      Confirming your payment…
    </p>
  );
}
