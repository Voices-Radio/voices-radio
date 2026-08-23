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
  accountSurfaceStaticClassName,
} from "../../account/components/account-surface";
import { createAccountAction, type CreateAccountState } from "./actions";

const initialState: CreateAccountState = undefined;

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
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

function AccountPass({ tier, cadence }: { tier: string; cadence: string }) {
  const passRows = [
    ["Access", tier ? `${tier} membership` : "Voices membership"],
    ["Billing", cadence || "Selected at checkout"],
    ["Next", "Secure checkout"],
  ];

  return (
    <aside className={cn(accountSurfaceStaticClassName, "self-start md:mt-14")}>
      <p className="font-gabarito text-xs font-bold uppercase tracking-[1.6px] text-voicesNext-orangeText">
        Member pass
      </p>
      <div className="mt-5 space-y-4">
        {passRows.map(([label, value]) => (
          <div
            key={label}
            className="border-b border-voicesNext-border/70 pb-3 last:border-b-0 last:pb-0"
          >
            <p className="font-gabarito text-[11px] font-bold uppercase tracking-[1.2px] text-voicesNext-cream/50">
              {label}
            </p>
            <p className="mt-1 font-gabarito text-sm font-bold capitalize text-voicesNext-cream">
              {value}
            </p>
          </div>
        ))}
      </div>
    </aside>
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
            className={cn(accountPrimaryButtonClassName, "h-12 px-6 text-base")}
          >
            Try again
          </Link>
          <Link
            href="/account"
            className={cn(
              accountSecondaryButtonClassName,
              "h-12 px-6 text-base",
            )}
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
          className={cn(
            accountPrimaryButtonClassName,
            "mt-8 h-12 px-6 text-base",
          )}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined;

  return (
    <div className="mx-auto grid max-w-[980px] gap-6 px-4 py-12 md:grid-cols-[minmax(0,1fr)_320px] md:px-8 md:py-16">
      <div>
        <AccountPageIntro
          eyebrow="Join Voices"
          title="Create your account"
          description={
            tier
              ? `Setting up your ${tier} membership, billed ${cadence}.`
              : "Create an account to join Voices."
          }
        />

        <AccountSurface className="mt-6">
          <form action={formAction} noValidate className="flex flex-col gap-5">
            <input type="hidden" name="tier" value={tier} />
            <input type="hidden" name="cadence" value={cadence} />

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
                  className={accountFieldClassName}
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
                  className={accountFieldClassName}
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
                aria-describedby={
                  fieldErrors?.email ? "email-error" : undefined
                }
                className={accountFieldClassName}
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
                className={accountFieldClassName}
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
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange transition-transform duration-200 checked:scale-105 focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background motion-reduce:transition-none"
              />
              Send me Voices news and updates. You can change this any time in
              your account.
            </label>

            <SubmitButton />
          </form>
        </AccountSurface>

        <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
          Already a member?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
          >
            Sign in
          </Link>
        </p>
      </div>
      <AccountPass tier={tier} cadence={cadence} />
    </div>
  );
}
