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

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(accountPrimaryButtonClassName, "h-11 px-6 text-sm")}
    >
      {pending ? "Saving…" : "Save artist profile"}
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
            ? "Your artist profile has been updated."
            : state.message}
        </div>
      )}

      <div className="grid gap-4 rounded-voices-md border border-voicesNext-border bg-voicesNext-background p-4 sm:grid-cols-2">
        <div>
          <p className="font-gabarito text-xs font-bold uppercase tracking-wide text-voicesNext-cream/60">
            Artist name
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

      <SaveButton />
    </form>
  );
}
