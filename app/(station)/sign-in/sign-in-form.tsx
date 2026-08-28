"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { AccountIntent } from "@/lib/voices/membership/capabilities";
import { cn } from "@/lib/utils";
import {
  AccountPageIntro,
  AccountSurface,
  accountFieldClassName,
  accountPrimaryButtonClassName,
} from "../account/components/account-surface";
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

export default function SignInForm({
  next,
  intent,
}: {
  next: string;
  intent?: AccountIntent;
}) {
  const [state, formAction] = useFormState(signInAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);
  const heading =
    intent === "artist"
      ? "Artist sign in"
      : intent === "member"
        ? "Member sign in"
        : "Sign in";
  const description =
    intent === "artist"
      ? "Sign in to manage your Voices artist profile."
      : intent === "member"
        ? "Sign in to manage your Voices membership."
        : "Sign in to manage your Voices account.";
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
          title={heading}
          description={description}
        />

        {!intent && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/sign-in?as=artist${
                next ? `&next=${encodeURIComponent(next)}` : ""
              }`}
              className="group/intent rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface px-4 py-3 font-gabarito text-sm font-bold text-voicesNext-cream transition-[border-color,color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-voicesNext-orange hover:bg-voicesNext-background hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Artist
              <span className="mt-1 block font-asap text-xs font-normal text-voicesNext-cream/70">
                Manage your DJ profile.
              </span>
            </Link>
            <Link
              href={`/sign-in?as=member${
                next ? `&next=${encodeURIComponent(next)}` : ""
              }`}
              className="group/intent rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface px-4 py-3 font-gabarito text-sm font-bold text-voicesNext-cream transition-[border-color,color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-voicesNext-orange hover:bg-voicesNext-background hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Member
              <span className="mt-1 block font-asap text-xs font-normal text-voicesNext-cream/70">
                Manage your membership.
              </span>
            </Link>
          </div>
        )}

        <AccountSurface className="mt-6">
          <form action={formAction} noValidate className="flex flex-col gap-5">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="as" value={intent ?? ""} />

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
