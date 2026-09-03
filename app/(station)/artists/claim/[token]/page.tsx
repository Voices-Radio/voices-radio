import type { Metadata } from "next";
import {
  validateArtistInvitation,
  type ArtistInvitation,
} from "@/lib/voices/membership/artist-invitations-client";
import { getSession } from "@/lib/voices/membership/session";
import ClaimArtistForm from "./claim-artist-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Claim artist profile",
};

function InvalidInvitation({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-16 md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Invitation unavailable
      </h1>
      <p className="mt-4 font-asap text-base leading-relaxed text-voicesNext-cream/80">
        {message}
      </p>
    </div>
  );
}

function InvitationSummary({ invitation }: { invitation: ArtistInvitation }) {
  if (!invitation.artist) return null;

  return (
    <div className="mt-6 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-4">
      <p className="font-gabarito text-xs font-bold uppercase tracking-wide text-voicesNext-cream/60">
        Artist profile
      </p>
      <h2 className="mt-1 font-gabarito text-xl font-bold text-voicesNext-cream">
        {invitation.artist.name}
      </h2>
      {invitation.artist.bio && (
        <p className="mt-2 font-asap text-sm leading-relaxed text-voicesNext-cream/75">
          {invitation.artist.bio}
        </p>
      )}
    </div>
  );
}

export default async function ClaimArtistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [validation, session] = await Promise.all([
    validateArtistInvitation(token),
    getSession(),
  ]);

  if (!validation.ok) {
    return <InvalidInvitation message={validation.message} />;
  }

  const invitation = validation.data.invitation;
  const sessionMatchesInvitation =
    session?.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="mx-auto max-w-[620px] px-4 py-16 md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Claim artist profile
      </h1>
      <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/70">
        This invitation is for {invitation.email}.
      </p>

      <InvitationSummary invitation={invitation} />
      <ClaimArtistForm
        token={token}
        invitation={invitation}
        sessionMatchesInvitation={sessionMatchesInvitation}
      />
    </div>
  );
}
