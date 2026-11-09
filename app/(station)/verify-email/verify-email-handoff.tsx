"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AccountPageIntro,
  accountPrimaryButtonClassName,
} from "../account/components/account-surface";
import { verifyEmailAction, type VerifyEmailResult } from "./actions";
import ResendVerification from "./resend-verification";

/**
 * Confirms the email as soon as the page opens, then the action redirects.
 *
 * Runs from the browser rather than during server render on purpose: mail
 * scanners (Outlook Safe Links and friends) fetch every link in a message
 * before the recipient does, and the token is single-use. A plain GET that
 * spent it would leave the real click with a dead link.
 */
export default function VerifyEmailHandoff({
  token,
  next,
  initialError,
}: {
  token: string;
  next?: string;
  initialError?: string;
}) {
  const [result, setResult] = useState<VerifyEmailResult>(
    initialError ? { status: "error", message: initialError } : undefined,
  );
  // The token is single-use; Strict Mode's double effect must not spend it twice.
  const started = useRef(false);

  useEffect(() => {
    if (initialError || started.current) return;
    started.current = true;

    verifyEmailAction(token, next)
      .then((outcome) => {
        if (outcome) setResult(outcome);
      })
      .catch(() =>
        setResult({
          status: "error",
          message: "We couldn’t confirm your email just now. Please open the link again.",
        }),
      );
  }, [token, next, initialError]);

  if (result?.status === "error") {
    const signInHref = next
      ? `/sign-in?next=${encodeURIComponent(next)}`
      : "/sign-in";

    return (
      <div className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16">
        <AccountPageIntro
          eyebrow="Voices account"
          title="Link unavailable"
          description={result.message}
        />
        <Link
          href={signInHref}
          className={cn(accountPrimaryButtonClassName, "mt-8 h-12 px-6 text-base")}
        >
          Sign in
        </Link>
        <div className="mt-8 border-t border-voicesNext-border pt-6">
          <p className="mb-3 font-gabarito text-sm text-voicesNext-cream/70">
            Haven&rsquo;t confirmed your email yet? Links last 24 hours.
          </p>
          <ResendVerification next={next} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16"
      role="status"
      aria-live="polite"
    >
      <AccountPageIntro
        eyebrow="Voices account"
        title="Confirming your email"
        description="One moment — we’re confirming your address and signing you in."
      />
    </div>
  );
}
