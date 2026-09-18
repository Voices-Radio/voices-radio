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
} from "../account/components/account-surface";
import PasswordInput from "../components/forms/password-input";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = undefined;

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
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

/**
 * One sign-in for everyone. There used to be an Artist / Member picker here,
 * but it was only ever a landing hint — both doors ran the same login — and
 * choosing the "wrong" one produced a "this account is not linked to an
 * artist profile" notice for a sign-in that had worked. Where an account lands
 * now depends only on what it holds (see resolvePostLoginPath).
 */
export default function SignInForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(signInAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);
  const forgotPasswordHref = `/forgot-password${
    next ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  useEffect(() => {
    if (state?.formError) {
      errorRef.current?.focus();
    }
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-[520px] px-4 py-12 md:px-8 md:py-16">
      <div>
        <AccountPageIntro
          eyebrow="Voices account"
          title="Sign in"
          description="Sign in to manage your Voices membership or artist profile."
        />

        <AccountSurface className="mt-6">
          <form action={formAction} noValidate className="flex flex-col gap-5">
            <input type="hidden" name="next" value={next} />

            {state?.formError && (
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
                aria-invalid={Boolean(state?.fieldErrors?.email)}
                aria-describedby={
                  state?.fieldErrors?.email ? "email-error" : undefined
                }
                className={accountFieldClassName}
              />
              {state?.fieldErrors?.email && (
                <p
                  id="email-error"
                  className="font-asap text-sm text-voicesNext-orange"
                >
                  {state.fieldErrors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="font-gabarito text-sm font-bold text-voicesNext-cream"
                >
                  Password
                </label>
                <Link
                  href={forgotPasswordHref}
                  className="font-gabarito text-xs font-bold text-voicesNext-cream/80 underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(state?.fieldErrors?.password)}
                aria-describedby={
                  state?.fieldErrors?.password ? "password-error" : undefined
                }
                className={accountFieldClassName}
              />
              {state?.fieldErrors?.password && (
                <p
                  id="password-error"
                  className="font-asap text-sm text-voicesNext-orange"
                >
                  {state.fieldErrors.password}
                </p>
              )}
            </div>

            <SubmitButton />
          </form>
        </AccountSurface>

        <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
          New to Voices?{" "}
          <Link
            href="/join"
            className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
          >
            Join as a member
          </Link>
        </p>
      </div>
    </div>
  );
}
