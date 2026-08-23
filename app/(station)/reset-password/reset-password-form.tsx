"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  accountFieldClassName,
  accountPrimaryButtonClassName,
} from "../account/components/account-surface";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = undefined;

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
      {pending ? "Saving…" : "Set new password"}
    </button>
  );
}

export default function ResetPasswordForm({
  token,
  next,
}: {
  token: string;
  next: string;
}) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.status) statusRef.current?.focus();
  }, [state]);

  if (state?.status === "success") {
    const href = state.next ?? "/sign-in";
    const label = state.next ? "Return to the artist profile link" : "Sign in";

    return (
      <div
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-4 font-asap text-sm leading-relaxed text-voicesNext-cream/85 focus:outline-none"
      >
        <p>{state.message}</p>
        <Link
          href={href}
          className="mt-4 inline-flex font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
        >
          {label}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="next" value={next} />

      {state?.status === "error" && state.formError && (
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="font-gabarito text-sm font-bold text-voicesNext-cream"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(
            state?.status === "error" && state.fieldErrors?.password,
          )}
          aria-describedby={
            state?.status === "error" && state.fieldErrors?.password
              ? "password-error"
              : undefined
          }
          className={accountFieldClassName}
        />
        {state?.status === "error" && state.fieldErrors?.password && (
          <p
            id="password-error"
            className="font-asap text-sm text-voicesNext-orange"
          >
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="font-gabarito text-sm font-bold text-voicesNext-cream"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(
            state?.status === "error" && state.fieldErrors?.confirmPassword,
          )}
          aria-describedby={
            state?.status === "error" && state.fieldErrors?.confirmPassword
              ? "confirm-password-error"
              : undefined
          }
          className={accountFieldClassName}
        />
        {state?.status === "error" && state.fieldErrors?.confirmPassword && (
          <p
            id="confirm-password-error"
            className="font-asap text-sm text-voicesNext-orange"
          >
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
