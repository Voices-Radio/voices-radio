"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { MembershipProfile } from "@/lib/voices/membership/schemas";
import { updateProfileAction, type ProfileState } from "./actions";

const initialState: ProfileState = undefined;

const ADDRESS_FIELDS = [
  { name: "line1", label: "Address line 1", autoComplete: "address-line1" },
  {
    name: "line2",
    label: "Address line 2 (optional)",
    autoComplete: "address-line2",
  },
  { name: "city", label: "Town or city", autoComplete: "address-level2" },
  { name: "postcode", label: "Postcode", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name" },
] as const;

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function ProfileForm({
  profile,
  showAddress,
}: {
  profile: MembershipProfile;
  showAddress: boolean;
}) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.status === "error" || state?.status === "success") {
      statusRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {state?.status && (
        <div
          ref={statusRef}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          tabIndex={-1}
          data-testid="form-error"
          className="rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none"
        >
          {state.status === "success"
            ? "Your profile has been updated."
            : state.message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="displayName"
          className="font-gabarito text-sm font-bold text-voicesNext-cream"
        >
          Recognition name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={profile.displayName ?? ""}
          maxLength={80}
          className="h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        />
        <p className="font-asap text-xs text-voicesNext-cream/70">
          Shown on the supporter wall, if you opt in below.
        </p>
      </div>

      <label className="flex items-start gap-2 font-asap text-sm text-voicesNext-cream/90">
        <input
          type="checkbox"
          name="supporterWallOptIn"
          defaultChecked={profile.supporterWallOptIn}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        />
        List me on the public supporter wall.
      </label>

      {/* Deliberately a separate control from supporter-wall opt-in — one
          is public recognition, the other is transactional-vs-marketing
          email preference (contract §9 / brief test #16). */}
      <label className="flex items-start gap-2 font-asap text-sm text-voicesNext-cream/90">
        <input
          type="checkbox"
          name="marketingConsent"
          defaultChecked={profile.marketingConsent}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-voicesNext-border bg-voicesNext-background text-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        />
        Send me Voices news and updates.
      </label>

      {showAddress && (
        <fieldset className="flex flex-col gap-3 border-0 p-0">
          <legend className="font-gabarito text-sm font-bold text-voicesNext-cream">
            Postal address
          </legend>
          <p className="font-asap text-xs text-voicesNext-cream/70">
            Needed to fulfil a benefit on your current tier.
          </p>

          {/* Separate fields, not one free-text box: the backend stores this
              as a structured address (line1/line2/city/postcode/country) and
              a single blob cannot be split back apart reliably. */}
          {ADDRESS_FIELDS.map(({ name, label, autoComplete }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label
                htmlFor={`address-${name}`}
                className="font-gabarito text-sm text-voicesNext-cream/90"
              >
                {label}
              </label>
              <input
                id={`address-${name}`}
                name={`address.${name}`}
                type="text"
                autoComplete={autoComplete}
                defaultValue={profile.address?.[name] ?? ""}
                maxLength={200}
                className="rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 font-gabarito text-base text-voicesNext-cream outline-none focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
              />
            </div>
          ))}
        </fieldset>
      )}

      <SaveButton />
    </form>
  );
}
