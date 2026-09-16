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

const INTRO_DESCRIPTION =
  "Update the profile details shown on Voices. Artist name and programming email are managed by the station team so the website stays aligned with scheduling.";

/**
 * Shown when the artist is linked to this account but the account's role
 * cannot edit artist profiles — a staff account (admin, producer) that
 * claimed one keeps its role, and the self-service endpoints only admit
 * artist roles. Saying so here, with the profile in view, beats the old
 * redirect to a notice on another page.
 */
function ReadOnlyArtistProfile({ name }: { name: string | null }) {
  return (
    <AccountSurface
      interactive={false}
      data-testid="artist-profile-read-only"
      className="mt-8"
    >
      {name && (
        <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
          {name}
        </h2>
      )}
      <p className="mt-3 font-asap text-sm leading-relaxed text-voicesNext-cream/75">
        This artist profile is linked to your account, but your account type
        can&rsquo;t edit artist profiles on the website. Email{" "}
        <a
          href="mailto:info@voicesradio.co.uk"
          className="font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 hover:text-voicesNext-orange"
        >
          info@voicesradio.co.uk
        </a>{" "}
        and the team will make changes for you.
      </p>
    </AccountSurface>
  );
}

export default async function ArtistAccountPage() {
  const capabilities = await requireArtist("/account/artist");

  if (!capabilities.artist?.canManageProfile) {
    return (
      <div>
        <AccountPageIntro
          eyebrow="DJ console"
          title="Artist profile"
          description={INTRO_DESCRIPTION}
        />
        <ReadOnlyArtistProfile name={capabilities.artist?.name ?? null} />
      </div>
    );
  }

  const result = await getArtistProfile();

  return (
    <div>
      <AccountPageIntro
        eyebrow="DJ console"
        title="Artist profile"
        description={INTRO_DESCRIPTION}
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
