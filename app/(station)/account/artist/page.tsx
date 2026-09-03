import type { Metadata } from "next";
import { getArtistProfile } from "@/lib/voices/membership/artist-profile-client";
import { requireArtist } from "@/lib/voices/membership/session";
import {
  AccountPageIntro,
  AccountSurface,
} from "../components/account-surface";
import ArtistProfileForm from "./artist-profile-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Artist profile",
};

export default async function ArtistAccountPage() {
  await requireArtist("/account/artist");
  const result = await getArtistProfile();

  return (
    <div>
      <AccountPageIntro
        eyebrow="DJ console"
        title="Artist profile"
        description="Update the profile details shown on Voices. Artist name and programming email are managed by the station team so the website stays aligned with scheduling."
      />

      {result.ok ? (
        <ArtistProfileForm profile={result.data} />
      ) : (
        <AccountSurface
          role="alert"
          interactive={false}
          className="mt-8 font-gabarito text-sm text-voicesNext-cream/90"
        >
          {result.message}
        </AccountSurface>
      )}
    </div>
  );
}
