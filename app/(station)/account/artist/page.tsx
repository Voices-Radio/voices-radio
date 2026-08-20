import type { Metadata } from "next";
import { getArtistProfile } from "@/lib/voices/membership/artist-profile-client";
import { requireArtist } from "@/lib/voices/membership/session";
import ArtistProfileForm from "./artist-profile-form";

export const metadata: Metadata = {
  title: "Artist profile",
};

export default async function ArtistAccountPage() {
  await requireArtist("/account/artist");
  const result = await getArtistProfile();

  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Artist profile
      </h1>
      <p className="mt-2 max-w-2xl font-asap text-sm leading-relaxed text-voicesNext-cream/75">
        Update the profile details shown on Voices. Artist name and programming
        email are managed by the station team so the website stays aligned with
        scheduling.
      </p>

      {result.ok ? (
        <ArtistProfileForm profile={result.data} />
      ) : (
        <div
          role="alert"
          className="mt-8 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 font-gabarito text-sm text-voicesNext-cream/90"
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
