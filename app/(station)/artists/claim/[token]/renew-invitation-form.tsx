"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { renewInvitationAction, type RenewInvitationState } from "./actions";

const initialState: RenewInvitationState = undefined;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange disabled:opacity-60"
    >
      {pending ? "Sending…" : "Email me a new link"}
    </button>
  );
}

/** D3: an expired link is renewed by the DJ, not by chasing someone at Voices. */
export default function RenewInvitationForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(renewInvitationAction, initialState);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state) statusRef.current?.focus();
  }, [state]);

  if (state?.status === "sent") {
    return (
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        data-testid="renew-sent"
        className="mt-6 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-4 font-asap text-sm text-voicesNext-cream/85 focus:outline-none"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col items-start gap-3">
      <input type="hidden" name="token" value={token} />
      {state?.status === "error" && (
        <p
          ref={statusRef}
          role="alert"
          tabIndex={-1}
          className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
        >
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
