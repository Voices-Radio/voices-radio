"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
import ReviewedField, { reviewReasonId } from "./reviewed-field";
import {
  reviewByField,
  shownList,
  shownText,
  type FieldReview,
} from "./field-review";

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

function describedBy(id: string, review: FieldReview | undefined) {
  return review?.status === "rejected" && review.reason
    ? reviewReasonId(id)
    : undefined;
}

function TextField({
  id,
  name,
  label,
  defaultValue,
  review,
  type = "text",
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  review?: FieldReview;
  type?: string;
}) {
  return (
    <ReviewedField fieldId={id} review={review}>
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
          defaultValue={shownText(review, defaultValue) ?? ""}
          aria-describedby={describedBy(id, review)}
          className={accountFieldClassName}
        />
      </div>
    </ReviewedField>
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
  const [confirmedComplete, setConfirmedComplete] = useState(false);
  const review = profile.profileReview;
  const reviews = reviewByField(review);
  const rejectedCount = Object.values(reviews).filter(
    (field) => field.status === "rejected",
  ).length;

  useEffect(() => {
    if (state?.status) statusRef.current?.focus();
  }, [state]);

  // Enter in a text box would otherwise send the whole profile for review,
  // which locks it. Enter stays live in the textarea (new line) and in the
  // genre box (adds a tag).
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onKeyDown={handleKeyDown}
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

      {review?.pending && (
        <div className="rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 font-asap text-sm text-voicesNext-cream/80">
          <p className="font-gabarito font-bold text-voicesNext-cream">
            Profile update awaiting review
          </p>
          <p className="mt-2">
            Further changes unlock after every field has been reviewed.
          </p>
        </div>
      )}

      {!review?.pending && rejectedCount > 0 && (
        <p className="font-asap text-sm text-voicesNext-cream/80">
          {rejectedCount === 1
            ? "1 field was not approved. Its reason is shown under the field."
            : `${rejectedCount} fields were not approved. Each reason is shown under its field.`}
        </p>
      )}

      <fieldset disabled={review?.pending} className="flex flex-col gap-5 border-0 p-0 disabled:opacity-60">

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="name" name="name" label="Name (private)" defaultValue={profile.name} review={reviews.name} />
        <TextField id="artistName" name="artistName" label="Artist name" defaultValue={profile.artistName} review={reviews.artistName} />
        <TextField id="showName" name="showName" label="Show name" defaultValue={profile.showName} review={reviews.showName} />
      </div>

      {profile.programmingEmail && (
        <p className="font-asap text-sm text-voicesNext-cream/70">
          Programming email:{" "}
          <span className="font-bold text-voicesNext-cream">
            {profile.programmingEmail}
          </span>
        </p>
      )}

      <ReviewedField fieldId="bio" review={reviews.bio}>
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
            defaultValue={shownText(reviews.bio, profile.bio) ?? ""}
            aria-describedby={describedBy("bio", reviews.bio)}
            rows={6}
            className={accountTextAreaClassName}
          />
        </div>
      </ReviewedField>

      <ReviewedField fieldId="imageUrl" review={reviews.imageUrl}>
        <ImageField
          kind="profile"
          fieldName="imageUrl"
          label="Profile image"
          initialUrl={shownText(reviews.imageUrl, profile.imageUrl)}
        />
      </ReviewedField>
      <ReviewedField fieldId="bannerUrl" review={reviews.bannerUrl}>
        <ImageField
          kind="banner"
          fieldName="bannerUrl"
          label="Banner image"
          initialUrl={shownText(reviews.bannerUrl, profile.bannerUrl)}
        />
      </ReviewedField>
      <ReviewedField fieldId="genres" review={reviews.genres}>
        <GenreTagInput
          name="genres"
          initialGenres={shownList(reviews.genres, profile.genres)}
        />
      </ReviewedField>
      <ReviewedField fieldId="mixcloudUsername" review={reviews.mixcloudUsername}>
        <UsernameField
          id="mixcloudUsername"
          name="mixcloudUsername"
          label="Mixcloud username"
          platform="mixcloud"
          defaultValue={shownText(reviews.mixcloudUsername, profile.mixcloudUsername)}
        />
      </ReviewedField>
      <ReviewedField fieldId="soundcloudUsername" review={reviews.soundcloudUsername}>
        <UsernameField
          id="soundcloudUsername"
          name="soundcloudUsername"
          label="SoundCloud username"
          platform="soundcloud"
          defaultValue={shownText(reviews.soundcloudUsername, profile.soundcloudUsername)}
        />
      </ReviewedField>

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
          review={reviews.instagram}
        />
        <TextField
          id="website"
          name="website"
          label="Website URL"
          type="url"
          defaultValue={profile.socialLinks.website}
          review={reviews.website}
        />
        <TextField
          id="twitter"
          name="twitter"
          label="Twitter URL"
          type="url"
          defaultValue={profile.socialLinks.twitter}
          review={reviews.twitter}
        />
        <TextField
          id="facebook"
          name="facebook"
          label="Facebook URL"
          type="url"
          defaultValue={profile.socialLinks.facebook}
          review={reviews.facebook}
        />
      </fieldset>

      </fieldset>

      {!review?.pending && (
        <label className="flex cursor-pointer items-start gap-3 font-asap text-sm text-voicesNext-cream">
          <input
            type="checkbox"
            checked={confirmedComplete}
            onChange={(event) => setConfirmedComplete(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-voicesNext-orange"
          />
          <span>
            My profile is as complete as I can make it.
            <span className="mt-1 block text-voicesNext-cream/60">
              Your profile locks after you submit it, until Voices has
              reviewed every field.
            </span>
          </span>
        </label>
      )}
      <SaveButton disabled={Boolean(review?.pending) || !confirmedComplete} />
    </form>
  );
}
