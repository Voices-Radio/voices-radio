"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { accountPrimaryButtonClassName } from "../account/components/account-surface";
import PasswordPairFields from "../components/forms/password-pair-fields";
import ResendVerification from "../verify-email/resend-verification";
import { createPasswordAction, type CreatePasswordState } from "./actions";

const initialState: CreatePasswordState = undefined;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(accountPrimaryButtonClassName, "h-12 w-full px-6 text-base")}
    >
      {pending ? "Setting up your account…" : "Create password and continue"}
    </button>
  );
}

export default function CreatePasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(createPasswordAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.status === "error") errorRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

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

      {state?.status === "error" && state.linkProblem ? (
        <div className="border-t border-voicesNext-border pt-5">
          <p className="mb-3 font-gabarito text-sm text-voicesNext-cream/70">
            Get a new link:
          </p>
          <ResendVerification next="/account" />
        </div>
      ) : (
        <>
          <PasswordPairFields
            errors={state?.status === "error" ? state.fieldErrors : undefined}
            hint="At least 8 characters, with an upper-case letter, a lower-case letter and a number."
          />
          <SubmitButton />
        </>
      )}
    </form>
  );
}
