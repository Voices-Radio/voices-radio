"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { ArtistInvitation } from "@/lib/voices/membership/artist-invitations-client";
import {
  claimArtistInvitationAction,
  type ClaimArtistInvitationState,
} from "./actions";

const initialState: ClaimArtistInvitationState = undefined;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange disabled:opacity-60"
    >
      {pending ? "Claiming…" : label}
    </button>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-gabarito text-sm font-bold text-voicesNext-cream"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
      />
    </div>
  );
}

export default function ClaimArtistForm({
  token,
  invitation,
  sessionMatchesInvitation,
}: {
  token: string;
  invitation: ArtistInvitation;
  sessionMatchesInvitation: boolean;
}) {
  const [state, formAction] = useFormState(
    claimArtistInvitationAction,
    initialState,
  );
  const [mode, setMode] = useState<"session" | "existing" | "create">(
    sessionMatchesInvitation
      ? "session"
      : invitation.kind === "create_new"
        ? "create"
        : "existing",
  );
  const statusRef = useRef<HTMLDivElement>(null);
  const forgotPasswordHref = `/forgot-password?email=${encodeURIComponent(
    invitation.email,
  )}&next=${encodeURIComponent(`/artists/claim/${token}`)}`;

  useEffect(() => {
    if (state?.status === "error") {
      setMode(state.mode);
      statusRef.current?.focus();
    }
    if (state?.status === "already_claimed") statusRef.current?.focus();
  }, [state]);

  if (state?.status === "already_claimed") {
    return (
      <div
        ref={statusRef}
        role="alert"
        tabIndex={-1}
        className="mt-8 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 font-gabarito text-sm text-voicesNext-cream"
      >
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex max-w-lg flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="invitationEmail" value={invitation.email} />
      <input type="hidden" name="mode" value={mode} />

      {state?.status === "error" && (
        <div
          ref={statusRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          data-testid="form-error"
          className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
        >
          {state.message}
        </div>
      )}

      {!sessionMatchesInvitation && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`rounded-voices-sm border px-4 py-3 text-left font-gabarito text-sm font-bold ${
              mode === "existing"
                ? "border-voicesNext-orange text-voicesNext-orangeText"
                : "border-voicesNext-border text-voicesNext-cream"
            }`}
          >
            Use existing account password
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`rounded-voices-sm border px-4 py-3 text-left font-gabarito text-sm font-bold ${
              mode === "create"
                ? "border-voicesNext-orange text-voicesNext-orangeText"
                : "border-voicesNext-border text-voicesNext-cream"
            }`}
          >
            Create account for this invitation
          </button>
        </div>
      )}

      {mode === "session" && (
        <div className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-4 font-asap text-sm text-voicesNext-cream/80">
          You are already signed in as {invitation.email}, so Voices can link
          this artist profile without asking for your password again.
        </div>
      )}

      {mode === "existing" && (
        <div className="flex flex-col gap-2">
          <Field
            id="password"
            name="password"
            label="Existing account password"
            type="password"
            autoComplete="current-password"
            required
          />
          <p className="font-asap text-sm text-voicesNext-cream/70">
            Forgot your password?{" "}
            <Link
              href={forgotPasswordHref}
              className="font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
            >
              Reset it first
            </Link>
            , then return here to link this artist profile.
          </p>
        </div>
      )}

      {mode === "create" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="firstName"
              name="firstName"
              label="First name"
              autoComplete="given-name"
              required
            />
            <Field
              id="lastName"
              name="lastName"
              label="Last name"
              autoComplete="family-name"
              required
            />
          </div>
          {invitation.kind === "create_new" && (
            <Field
              id="artistName"
              name="artistName"
              label="Artist name"
              required
            />
          )}
          <Field
            id="newPassword"
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            required
          />
          <label className="flex items-start gap-2 font-asap text-sm text-voicesNext-cream/90">
            <input
              type="checkbox"
              name="newsletters"
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            />
            Send me Voices news and updates.
          </label>
        </>
      )}

      <SubmitButton label="Claim artist profile" />
    </form>
  );
}
