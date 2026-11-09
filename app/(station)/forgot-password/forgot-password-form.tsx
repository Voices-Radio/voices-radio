"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  accountFieldClassName,
  accountPrimaryButtonClassName,
} from "../account/components/account-surface";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = undefined;
const CREATE_ACCOUNT_HREF = "/join/create-account";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccountCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "missing"; email: string };

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
      {pending ? "Sending…" : "Send reset email"}
    </button>
  );
}

export default function ForgotPasswordForm({
  email,
  next,
}: {
  email: string;
  next: string;
}) {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);
  const statusRef = useRef<HTMLDivElement>(null);
  const [emailValue, setEmailValue] = useState(email);
  const [accountCheck, setAccountCheck] = useState<AccountCheckState>({
    status: "idle",
  });
  const serverMissingEmail =
    state?.status === "error" ? state.accountMissingEmail : undefined;
  const missingEmail =
    serverMissingEmail ||
    (accountCheck.status === "missing" ? accountCheck.email : undefined);
  const showMissingAccount = Boolean(missingEmail);

  useEffect(() => {
    if (state?.status) statusRef.current?.focus();
  }, [state]);

  useEffect(() => {
    const trimmedEmail = emailValue.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setAccountCheck({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setAccountCheck({ status: "checking" });
      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail }),
          signal: controller.signal,
        });
        if (!response.ok) {
          setAccountCheck({ status: "idle" });
          return;
        }

        const payload = (await response.json()) as {
          exists?: boolean;
          email?: string;
        };
        setAccountCheck(
          payload.exists === false
            ? { status: "missing", email: payload.email ?? trimmedEmail }
            : { status: "idle" },
        );
      } catch (error) {
        if (!controller.signal.aborted) setAccountCheck({ status: "idle" });
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [emailValue]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (showMissingAccount) {
      event.preventDefault();
      statusRef.current?.focus();
    }
  }

  if (state?.status === "success") {
    return (
      <div
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-4 font-asap text-sm leading-relaxed text-voicesNext-cream/85 focus:outline-none"
      >
        <p>{state.message}</p>
        {state.next && (
          <p className="mt-3">
            Once your password is reset, return to{" "}
            <Link
              href={state.next}
              className="font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
            >
              the artist profile link
            </Link>{" "}
            and use your new password.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="next" value={next} />

      {state?.status === "error" && state.formError && !showMissingAccount && (
        <div
          ref={statusRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          data-testid="form-error"
          className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-background px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
        >
          {state.formError}
        </div>
      )}

      {showMissingAccount && (
        <div
          ref={statusRef}
          role="alert"
          aria-live="polite"
          tabIndex={-1}
          id="account-missing"
          className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-background px-4 py-3 font-asap text-sm leading-relaxed text-voicesNext-cream/90 focus:outline-none"
        >
          You don&apos;t have an account for this email.{" "}
          <Link
            href={CREATE_ACCOUNT_HREF}
            className="font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
          >
            Create one here
          </Link>
          .
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
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
          required
          aria-invalid={Boolean(
            showMissingAccount ||
              (state?.status === "error" && state.fieldErrors?.email),
          )}
          aria-describedby={
            showMissingAccount
              ? "account-missing"
              : state?.status === "error" && state.fieldErrors?.email
              ? "email-error"
              : undefined
          }
          className={accountFieldClassName}
        />
        {state?.status === "error" && state.fieldErrors?.email && (
          <p id="email-error" className="font-asap text-sm text-voicesNext-orange">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
