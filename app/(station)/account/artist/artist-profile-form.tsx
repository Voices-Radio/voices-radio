"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { ArtistProfile } from "@/lib/voices/membership/schemas";
import { cn } from "@/lib/utils";
import {
  accountFieldClassName,
  accountPrimaryButtonClassName,
  accountSurfaceClassName,
  accountTextAreaClassName,
} from "../components/account-surface";
import { updateArtistProfileAction, type ArtistProfileState } from "./actions";
import ImageField from "./image-field";
import GenreTagInput from "./genre-tag-input";
import UsernameField from "./username-field";

const initialState: ArtistProfileState = undefined;

function SaveButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(accountPrimaryButtonClassName, "h-11 px-6 text-sm")}
    >
      {pending ? "Submitting…" : "Submit for review"}
    </button>
  );
}

function TextField({
  id,
  name,
  label,
  defaultValue,
  type = "text",
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
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
        defaultValue={defaultValue ?? ""}
        className={accountFieldClassName}
      />
    </div>
  );
}

export default function ArtistProfileForm({
  profile,
}: {
  profile: ArtistProfile;
}) {
  const [state, formAction] = useFormState(
    updateArtistProfileAction,
    initialState,
  );
  const statusRef = useRef<HTMLDivElement>(null);
  const review = profile.profileReview;

  useEffect(() => {
    if (state?.status) statusRef.current?.focus();
  }, [state]);

  return (
    <form
      action={formAction}
      className={cn(
        accountSurfaceClassName,
        "mt-8 flex max-w-3xl flex-col gap-5",
      )}
    >
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
            ? "Your profile update has been submitted for review."
            : state.message}
        </div>
      )}

      {review && (
        <div className="rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 font-asap text-sm text-voicesNext-cream/80">
          <p className="font-gabarito font-bold text-voicesNext-cream">
            {review.pending ? "Profile update awaiting review" : "Latest profile review"}
          </p>
          <ul className="mt-2 list-disc pl-5">
            {review.fields.map((field) => (
              <li key={field.field}>
                {field.field}: {field.status}
                {field.rejectionReason ? ` — ${field.rejectionReason}` : ""}
              </li>
            ))}
          </ul>
          {review.pending && <p className="mt-2">Further changes unlock after every field has been reviewed.</p>}
        </div>
      )}

      <fieldset disabled={review?.pending} className="flex flex-col gap-5 border-0 p-0 disabled:opacity-60">

      <div className="grid gap-4 rounded-voices-md border border-voicesNext-border bg-voicesNext-background p-4 sm:grid-cols-2">
        <div>
          <p className="font-gabarito text-xs font-bold uppercase tracking-wide text-voicesNext-cream/60">
            Artist name
          </p>
          <p className="mt-1 font-gabarito text-base font-bold text-voicesNext-cream">
            {profile.artistName ?? "Not set"}
          </p>
        </div>
        <div>
          <p className="font-gabarito text-xs font-bold uppercase tracking-wide text-voicesNext-cream/60">
            Name (private)
          </p>
          <p className="mt-1 font-gabarito text-base font-bold text-voicesNext-cream">
            {profile.name}
          </p>
        </div>
        {profile.programmingEmail && (
          <div>
            <p className="font-gabarito text-xs font-bold uppercase tracking-wide text-voicesNext-cream/60">
              Programming email
            </p>
            <p className="mt-1 font-gabarito text-base font-bold text-voicesNext-cream">
              {profile.programmingEmail}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="name" name="name" label="Name (private)" defaultValue={profile.name} />
        <TextField id="artistName" name="artistName" label="Artist name" defaultValue={profile.artistName} />
        <TextField id="showName" name="showName" label="Show name" defaultValue={profile.showName} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="bio"
          className="font-gabarito text-sm font-bold text-voicesNext-cream"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          rows={6}
          className={accountTextAreaClassName}
        />
      </div>

      <ImageField
        kind="profile"
        fieldName="imageUrl"
        label="Profile image"
        initialUrl={profile.imageUrl}
      />
      <ImageField
        kind="banner"
        fieldName="bannerUrl"
        label="Banner image"
        initialUrl={profile.bannerUrl}
      />
      <GenreTagInput name="genres" initialGenres={profile.genres} />
      <UsernameField
        id="mixcloudUsername"
        name="mixcloudUsername"
        label="Mixcloud username"
        platform="mixcloud"
        defaultValue={profile.mixcloudUsername}
      />
      <UsernameField
        id="soundcloudUsername"
        name="soundcloudUsername"
        label="SoundCloud username"
        platform="soundcloud"
        defaultValue={profile.soundcloudUsername}
      />

      <fieldset className="grid gap-4 border-0 p-0 sm:grid-cols-2">
        <legend className="font-gabarito text-sm font-bold text-voicesNext-cream">
          Social links
        </legend>
        <TextField
          id="instagram"
          name="instagram"
          label="Instagram URL"
          type="url"
          defaultValue={profile.socialLinks.instagram}
        />
        <TextField
          id="website"
          name="website"
          label="Website URL"
          type="url"
          defaultValue={profile.socialLinks.website}
        />
        <TextField
          id="twitter"
          name="twitter"
          label="Twitter URL"
          type="url"
          defaultValue={profile.socialLinks.twitter}
        />
        <TextField
          id="facebook"
          name="facebook"
          label="Facebook URL"
          type="url"
          defaultValue={profile.socialLinks.facebook}
        />
      </fieldset>

      </fieldset>
      <SaveButton disabled={Boolean(review?.pending)} />
    </form>
  );
}
