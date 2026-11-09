"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AccountPageIntro,
  AccountSurface,
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
} from "../../account/components/account-surface";
import { resumeCheckoutAction, type ResumeCheckoutState } from "./actions";
import { formatMinorUnitsWithCadence } from "@/lib/voices/membership/format";
import {
  isMembershipCadence,
  parseAmountMinor,
} from "@/lib/voices/membership/types";

const initialState: ResumeCheckoutState = undefined;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        accountPrimaryButtonClassName,
        "h-12 w-full px-6 text-base",
      )}
    >
      {pending ? "Taking you to payment…" : "Continue to payment"}
    </button>
  );
}

function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-0"
      role="status"
    >
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        {title}
      </h1>
      {children}
    </div>
  );
}

const noticeTextClassName =
  "mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90";
const noticeActionsClassName =
  "mt-8 flex flex-col justify-center gap-3 sm:flex-row";

/**
 * Landing page for the reminder email's "Finish joining" link. The amount and
 * cadence in the URL are for display only: the backend charges what it stored
 * when the visitor first chose.
 */
export default function ResumeForm({
  token,
  amount,
  cadence,
}: {
  token: string;
  amount: string;
  cadence: string;
}) {
  const [state, formAction] = useFormState(resumeCheckoutAction, initialState);
  const amountMinor = parseAmountMinor(amount);
  const knownCadence = isMembershipCadence(cadence) ? cadence : null;
  const contribution =
    amountMinor && knownCadence
      ? formatMinorUnitsWithCadence(amountMinor, "gbp", knownCadence)
      : null;
  const joinPath = knownCadence ? `/join?cadence=${knownCadence}` : "/join";

  if (state?.status === "link_invalid") {
    return (
      <Notice title="This link has expired">
        <p className={noticeTextClassName}>
          The link in your email no longer works. No payment has been taken. You
          can start again in a minute.
        </p>
        <div className={noticeActionsClassName}>
          <Link
            href={joinPath}
            className={cn(accountPrimaryButtonClassName, "h-12 px-6 text-base")}
          >
            Start again
          </Link>
        </div>
      </Notice>
    );
  }

  if (state?.status === "account_exists") {
    const next =
      amountMinor && knownCadence
        ? `/join/checkout?amount=${amountMinor}&cadence=${knownCadence}`
        : "/join";
    return (
      <Notice title="You already have an account">
        <p className={noticeTextClassName}>
          Sign in and we&rsquo;ll take you straight to payment.
        </p>
        <div className={noticeActionsClassName}>
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className={cn(accountPrimaryButtonClassName, "h-12 px-6 text-base")}
          >
            Sign in
          </Link>
          <Link
            href={`/forgot-password?next=${encodeURIComponent(next)}`}
            className={cn(
              accountSecondaryButtonClassName,
              "h-12 px-6 text-base",
            )}
          >
            Forgot password?
          </Link>
        </div>
      </Notice>
    );
  }

  if (state?.status === "setup_pending") {
    return (
      <Notice title="You’ve already joined">
        <p className={noticeTextClassName}>
          Your payment went through, but your account isn&rsquo;t set up yet.
          We&rsquo;ve just emailed you a new link to confirm your email and
          create your password. If it doesn&rsquo;t arrive, check your spam
          folder.
        </p>
      </Notice>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] px-4 py-12 md:px-8 md:py-16">
      <AccountPageIntro
        eyebrow="Join Voices"
        title="Finish joining"
        description={
          contribution
            ? `You're joining at ${contribution}. No payment has been taken yet.`
            : "No payment has been taken yet."
        }
      />

      <AccountSurface className="mt-6">
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="token" value={token} />

          {state?.status === "error" && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-background px-4 py-3 font-gabarito text-sm text-voicesNext-cream"
            >
              {state.message}
            </div>
          )}

          <p className="font-gabarito text-sm text-voicesNext-cream/80">
            Your details are saved. Pay on the next page, then choose your
            password from the email we send you.
          </p>

          <SubmitButton />
        </form>
      </AccountSurface>
    </div>
  );
}
