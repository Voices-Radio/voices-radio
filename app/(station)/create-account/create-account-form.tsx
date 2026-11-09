"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AccountPageIntro,
  AccountSurface,
  accountFieldClassName,
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
} from "../account/components/account-surface";
import PasswordPairFields from "../components/forms/password-pair-fields";
import ResendVerification from "../verify-email/resend-verification";
import { registerFreeAccountAction, type FreeAccountState } from "./actions";

const initialState: FreeAccountState = undefined;

const labelClassName = "font-gabarito text-sm font-bold text-voicesNext-cream";
const errorClassName = "font-asap text-sm text-voicesNext-orange";

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
      {pending ? "Creating your account…" : "Create free account"}
    </button>
  );
}

/**
 * Free (non-member) sign-up. Saving favourite artists and shows is open to
 * everyone with an account; membership (and playlists, discounts, etc.) is the
 * paid step on /join. Never shows a payment step.
 */
export default function FreeAccountForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(registerFreeAccountAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.status === "error" && state.formError) {
      errorRef.current?.focus();
    }
  }, [state]);

  if (state?.status === "check_email") {
    return (
      <div
        className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-0"
        role="status"
      >
        <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
          Check your inbox
        </h1>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          We&rsquo;ve sent a link to <strong>{state.email}</strong>. Open it to
          confirm your email and you&rsquo;ll be signed in.
        </p>
        <div className="mt-8 border-t border-voicesNext-border pt-6">
          <p className="mb-3 font-gabarito text-sm text-voicesNext-cream/70">
            Nothing arrived? Check your spam folder, or:
          </p>
          <ResendVerification email={state.email} next={state.next} />
        </div>
      </div>
    );
  }

  if (state?.status === "account_exists") {
    return (
      <div
        className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-0"
        role="status"
      >
        <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
          You already have an account
        </h1>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          There&rsquo;s already a Voices account for{" "}
          <strong>{state.email}</strong>. Sign in to carry on.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/sign-in?next=${encodeURIComponent(state.next)}`}
            className={cn(accountPrimaryButtonClassName, "h-12 px-6 text-base")}
          >
            Sign in
          </Link>
          <Link
            href={`/forgot-password?next=${encodeURIComponent(state.next)}`}
            className={cn(
              accountSecondaryButtonClassName,
              "h-12 px-6 text-base",
            )}
          >
            Forgot password?
          </Link>
        </div>
      </div>
    );
  }

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined;
  // Echoed back on every error return so one mistyped character doesn't cost
  // the visitor the whole form. Passwords are never echoed.
  const values = state?.status === "error" ? state.values : undefined;
  const signInHref = next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in";
  const joinHref = next ? `/join?next=${encodeURIComponent(next)}` : "/join";

  return (
    <div className="mx-auto w-full max-w-[520px] px-4 py-12 md:px-8 md:py-16">
      <AccountPageIntro
        eyebrow="Voices account"
        title="Create a free account"
        description="Save your favourite artists & shows. It's free, and you can become a member any time."
      />

      <AccountSurface className="mt-6">
        <form action={formAction} noValidate className="flex flex-col gap-5">
          <input type="hidden" name="next" value={next} />

          {state?.status === "error" && state.formError && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
              data-testid="form-error"
              className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-background px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
            >
              {state.formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className={labelClassName}>
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                defaultValue={values?.firstName}
                required
                aria-invalid={Boolean(fieldErrors?.firstName)}
                aria-describedby={fieldErrors?.firstName ? "firstName-error" : undefined}
                className={accountFieldClassName}
              />
              {fieldErrors?.firstName && (
                <p id="firstName-error" className={errorClassName}>
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className={labelClassName}>
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                defaultValue={values?.lastName}
                required
                aria-invalid={Boolean(fieldErrors?.lastName)}
                aria-describedby={fieldErrors?.lastName ? "lastName-error" : undefined}
                className={accountFieldClassName}
              />
              {fieldErrors?.lastName && (
                <p id="lastName-error" className={errorClassName}>
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClassName}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={values?.email}
              required
              aria-invalid={Boolean(fieldErrors?.email)}
              aria-describedby={fieldErrors?.email ? "email-error" : undefined}
              className={accountFieldClassName}
            />
            {fieldErrors?.email && (
              <p id="email-error" className={errorClassName}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <PasswordPairFields
            errors={fieldErrors}
            hint="At least 8 characters, with an upper-case letter, a lower-case letter and a number."
          />

          <label className="flex items-start gap-2 font-asap text-sm text-voicesNext-cream/90">
            <input
              type="checkbox"
              name="newsletters"
              defaultChecked={values?.newsletters}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange transition-transform duration-200 checked:scale-105 focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background motion-reduce:transition-none"
            />
            Send me the Voices newsletter. You can change this any time in your
            account.
          </label>

          <SubmitButton />
        </form>
      </AccountSurface>

      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/70">
        Want playlists, discounts and more?{" "}
        <Link
          href={joinHref}
          className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
        >
          Join as a member
        </Link>
      </p>
    </div>
  );
}
