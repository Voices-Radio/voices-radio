"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ArtistInvitation } from "@/lib/voices/membership/artist-invitations-client";
import {
  canChooseClaimMode,
  claimModeFor,
  type ClaimMode,
} from "@/lib/voices/membership/claim-mode";
import {
  accountFieldClassName,
  accountPrimaryButtonClassName,
} from "../../../account/components/account-surface";
import PasswordInput from "../../../components/forms/password-input";
import {
  claimArtistInvitationAction,
  type ClaimArtistInvitationState,
} from "./actions";

const initialState: ClaimArtistInvitationState = undefined;

const linkClassName =
  "font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange";

function SubmitButton({ label }: { label: string }) {
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
      {pending ? "Claiming…" : label}
    </button>
  );
}

function Field({
  id,
  name,
  label,
  password = false,
  autoComplete,
  required,
  defaultValue,
  readOnly,
  type = "text",
  hint,
  invalid,
  onChange,
}: {
  id: string;
  name?: string;
  label: string;
  password?: boolean;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
  type?: "text" | "email";
  hint?: ReactNode;
  invalid?: boolean;
  onChange?: (value: string) => void;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const inputProps = {
    id,
    name,
    autoComplete,
    required,
    readOnly,
    "aria-invalid": invalid || undefined,
    "aria-describedby": hintId,
    className: accountFieldClassName,
    ...(onChange
      ? {
          onChange: (event: { target: { value: string } }) =>
            onChange(event.target.value),
        }
      : {}),
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-gabarito text-sm font-bold text-voicesNext-cream"
      >
        {label}
      </label>
      {password ? (
        <PasswordInput {...inputProps} />
      ) : (
        <input {...inputProps} type={type} defaultValue={defaultValue} />
      )}
      {hint && (
        <p
          id={hintId}
          className={`font-asap text-xs ${
            invalid ? "text-voicesNext-orange" : "text-voicesNext-cream/70"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function ModeButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-voices-sm border px-4 py-3 text-left font-gabarito text-sm font-bold ${
        selected
          ? "border-voicesNext-orange text-voicesNext-orangeText"
          : "border-voicesNext-border text-voicesNext-cream"
      }`}
    >
      {children}
    </button>
  );
}

const FIRST_NAME_HINT = "Your legal first name, not your artist name.";
const LAST_NAME_HINT = "Your legal last name.";
const ARTIST_NAME_HINT =
  "The name you DJ or present under, shown publicly on the website and schedule. Please match the artist name on your Mixcloud and SoundCloud shows, so we can link your back-catalogue.";

/** Same name to a human: any case, any spacing. */
const sameName = (a: string, b: string) =>
  a.trim().replace(/\s+/g, " ").toLowerCase() ===
  b.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Offers the one claim path that can succeed for this address (see
 * claimModeFor). A choice of paths is shown only when the backend could not
 * say which works.
 */
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
  const [mode, setMode] = useState<ClaimMode>(() =>
    claimModeFor({ sessionMatchesInvitation, invitation }),
  );
  const canChoose = canChooseClaimMode({
    sessionMatchesInvitation,
    invitation,
  });
  const statusRef = useRef<HTMLDivElement>(null);
  const forgotPasswordHref = `/forgot-password?email=${encodeURIComponent(
    invitation.email,
  )}&next=${encodeURIComponent(`/artists/claim/${token}`)}`;

  const error = state?.status === "error" ? state : undefined;
  const values = error?.values;
  const invitedName = invitation.artist?.name ?? "That name";

  // The artist name is editable when the DJ has to choose it (a profile with
  // none yet) or has to replace an invited one that was taken. Otherwise the
  // name is shown read-only: changing a live one re-points RadioCult and show
  // matching, so it goes through Voices.
  const artistNameRequired = invitation.artist?.artistNameRequired === true;
  const nameIsEditable =
    artistNameRequired ||
    (invitation.kind === "create_new" &&
      (invitation.nameTaken || error?.field === "artistName"));

  // Tracked only to warn when the artist name is just the legal name typed
  // above — the likeliest mistake. The inputs stay uncontrolled.
  const [firstNameValue, setFirstNameValue] = useState(values?.firstName ?? "");
  const [lastNameValue, setLastNameValue] = useState(values?.lastName ?? "");
  const [artistNameValue, setArtistNameValue] = useState(
    values?.artistName ?? "",
  );
  const matchesLegalName =
    mode === "create" &&
    Boolean(artistNameValue.trim()) &&
    Boolean(firstNameValue.trim() && lastNameValue.trim()) &&
    sameName(artistNameValue, `${firstNameValue} ${lastNameValue}`);

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
        className="mt-6 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background p-4 font-gabarito text-sm text-voicesNext-cream"
      >
        <p>{state.message}</p>
        <p className="mt-3 font-asap">
          If that was you,{" "}
          <Link href="/sign-in?next=/account/artist" className={linkClassName}>
            sign in
          </Link>{" "}
          to manage it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex w-full flex-col gap-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="invitationEmail" value={invitation.email} />
      <input type="hidden" name="mode" value={mode} />

      {error && (
        <div
          ref={statusRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          data-testid="form-error"
          className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
        >
          {error.message}
        </div>
      )}

      {canChoose && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeButton
            selected={mode === "existing"}
            onClick={() => setMode("existing")}
          >
            Use existing account password
          </ModeButton>
          <ModeButton
            selected={mode === "create"}
            onClick={() => setMode("create")}
          >
            Create account for this invitation
          </ModeButton>
        </div>
      )}

      {mode !== "session" && (
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="username"
          readOnly
          defaultValue={invitation.email}
        />
      )}

      {mode === "session" && (
        <div className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-4 font-asap text-sm text-voicesNext-cream/80">
          You are already signed in as {invitation.email}, so Voices can link
          this artist profile without asking for your password again.
        </div>
      )}

      {mode === "existing" && (
        <div className="flex flex-col gap-2">
          {!canChoose && (
            <p className="font-asap text-sm text-voicesNext-cream/80">
              You already have a Voices account. Enter your password to claim
              this artist profile.
            </p>
          )}
          <Field
            id="password"
            name="password"
            label="Password"
            password
            autoComplete="current-password"
            required
          />
          <p className="font-asap text-sm text-voicesNext-cream/70">
            Forgot your password?{" "}
            <Link href={forgotPasswordHref} className={linkClassName}>
              Reset it first
            </Link>
            , then return here to link this artist profile.
          </p>
        </div>
      )}

      {mode === "set_password" && (
        <div className="flex flex-col gap-2">
          <p className="font-asap text-sm text-voicesNext-cream/80">
            Your Voices account for {invitation.email} uses Sign in with Apple.
            Choose a password to use it on the website too — Sign in with Apple
            keeps working in the app.
          </p>
          <Field
            id="newPassword"
            name="password"
            label="Choose a password"
            password
            autoComplete="new-password"
            required
            hint="At least 8 characters."
            invalid={error?.field === "password"}
          />
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
              defaultValue={values?.firstName}
              hint={FIRST_NAME_HINT}
              onChange={setFirstNameValue}
            />
            <Field
              id="lastName"
              name="lastName"
              label="Last name"
              autoComplete="family-name"
              required
              defaultValue={values?.lastName}
              hint={LAST_NAME_HINT}
              onChange={setLastNameValue}
            />
          </div>
          <Field
            id="newPassword"
            name="password"
            label="Choose a password"
            password
            autoComplete="new-password"
            required
            hint="At least 8 characters."
            invalid={error?.field === "password"}
          />
          <label className="flex items-start gap-2 font-asap text-sm text-voicesNext-cream/90">
            <input
              type="checkbox"
              name="newsletters"
              defaultChecked={values?.newsletters}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
            />
            Send me Voices news and updates.
          </label>
        </>
      )}

      {nameIsEditable ? (
        <>
          <Field
            id="artistName"
            name="artistName"
            label="Artist name"
            required
            defaultValue={values?.artistName}
            invalid={error?.field === "artistName"}
            onChange={setArtistNameValue}
            hint={
              invitation.kind === "create_new" && invitation.nameTaken ? (
                <>
                  “{invitedName}” is already the name of another artist on
                  Voices. Choose a variant — for example, add a word or your
                  city. {ARTIST_NAME_HINT}
                </>
              ) : (
                ARTIST_NAME_HINT
              )
            }
          />
          {matchesLegalName && (
            <p
              role="status"
              className="text-voicesNext-cream/85 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface px-4 py-3 font-asap text-sm"
            >
              This matches your first and last name. That’s fine if you perform
              under your own name — otherwise, enter the name you DJ under.
            </p>
          )}
        </>
      ) : null}

      <SubmitButton label="Claim artist profile" />
    </form>
  );
}
