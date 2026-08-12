"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createAccountAction, type CreateAccountState } from "./actions";

const initialState: CreateAccountState = undefined;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function CreateAccountForm({
  tier,
  cadence,
}: {
  tier: string;
  cadence: string;
}) {
  const [state, formAction] = useFormState(createAccountAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.status === "error" && state.formError) {
      errorRef.current?.focus();
    }
  }, [state]);

  if (state?.status === "checkout_error") {
    return (
      <div
        className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-0"
        role="alert"
      >
        <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
          Your account is ready
        </h1>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          {state.message} You&rsquo;re signed in, so you can pick up checkout
          again whenever you&rsquo;re ready.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={tier ? `/join?cadence=${cadence}` : "/join"}
            className="inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          >
            Try again
          </Link>
          <Link
            href="/account"
            className="inline-flex h-12 items-center justify-center rounded-full border border-voicesNext-border px-6 font-gabarito text-base font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          >
            Go to your account
          </Link>
        </div>
      </div>
    );
  }

  if (state?.status === "verify_email") {
    return (
      <div
        className="mx-auto max-w-[480px] px-4 py-16 text-center md:px-0"
        role="status"
      >
        <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
          Check your email
        </h1>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          We&rsquo;ve sent a verification link to <strong>{state.email}</strong>
          {tier
            ? `. Verify your address, then sign in and we'll pick your ${tier} membership back up.`
            : ". Verify your address, then sign in to continue."}
        </p>
        <Link
          href={
            tier
              ? `/sign-in?next=${encodeURIComponent(
                  `/join/checkout?tier=${tier}&cadence=${cadence}`,
                )}`
              : "/sign-in"
          }
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined;

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16 md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Create your account
      </h1>
      <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/70">
        {tier
          ? `Setting up your ${tier} membership, billed ${cadence}.`
          : "Create an account to join Voices."}
      </p>

      <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="cadence" value={cadence} />

        {state?.status === "error" && state.formError && (
          <div
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            data-testid="form-error"
            className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
          >
            {state.formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="firstName"
              className="font-gabarito text-sm font-bold text-voicesNext-cream"
            >
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              aria-invalid={Boolean(fieldErrors?.firstName)}
              aria-describedby={
                fieldErrors?.firstName ? "firstName-error" : undefined
              }
              className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            />
            {fieldErrors?.firstName && (
              <p
                id="firstName-error"
                className="font-asap text-sm text-voicesNext-orange"
              >
                {fieldErrors.firstName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="lastName"
              className="font-gabarito text-sm font-bold text-voicesNext-cream"
            >
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              aria-invalid={Boolean(fieldErrors?.lastName)}
              aria-describedby={
                fieldErrors?.lastName ? "lastName-error" : undefined
              }
              className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            />
            {fieldErrors?.lastName && (
              <p
                id="lastName-error"
                className="font-asap text-sm text-voicesNext-orange"
              >
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="font-gabarito text-sm font-bold text-voicesNext-cream"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? "email-error" : undefined}
            className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          />
          {fieldErrors?.email && (
            <p
              id="email-error"
              className="font-asap text-sm text-voicesNext-orange"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="font-gabarito text-sm font-bold text-voicesNext-cream"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(fieldErrors?.password)}
            aria-describedby={
              fieldErrors?.password ? "password-error" : "password-hint"
            }
            className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          />
          {fieldErrors?.password ? (
            <p
              id="password-error"
              className="font-asap text-sm text-voicesNext-orange"
            >
              {fieldErrors.password}
            </p>
          ) : (
            <p
              id="password-hint"
              className="font-asap text-xs text-voicesNext-cream/70"
            >
              At least 8 characters.
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 font-asap text-sm text-voicesNext-cream/90">
          <input
            type="checkbox"
            name="newsletters"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          />
          Send me Voices news and updates. You can change this any time in your
          account.
        </label>

        <SubmitButton />
      </form>

      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        Already a member?{" "}
        <Link
          href="/sign-in"
          className="font-bold text-voicesNext-cream underline underline-offset-2 hover:text-voicesNext-orange"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
