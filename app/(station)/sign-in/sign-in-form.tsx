"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = undefined;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function SignInForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(signInAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.formError) {
      errorRef.current?.focus();
    }
  }, [state]);

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16 md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Sign in
      </h1>
      <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/70">
        Sign in to manage your Voices membership.
      </p>

      <form action={formAction} noValidate className="mt-8 flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />

        {state?.formError && (
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
            className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            aria-describedby={
              state?.fieldErrors?.password ? "password-error" : undefined
            }
            className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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

      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        New to Voices?{" "}
        <Link
          href="/join"
          className="font-bold text-voicesNext-cream underline underline-offset-2 hover:text-voicesNext-orange"
        >
          Join as a member
        </Link>
      </p>
    </div>
  );
}
