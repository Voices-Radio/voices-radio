import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  validateArtistInvitation,
  type ArtistInvitation,
} from "@/lib/voices/membership/artist-invitations-client";
import { getAccessToken, getSession } from "@/lib/voices/membership/session";
import ClaimArtistForm from "./claim-artist-form";
import RenewInvitationForm from "./renew-invitation-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Claim artist profile",
};

const linkClassName =
  "font-gabarito font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange";

/**
 * Every link that can't be claimed says why, and what to do next — the plan's
 * I4. It used to be one "Invitation unavailable" for invalid, expired and
 * already-claimed alike, which left a DJ with an expired link nothing to do.
 */
function InvitationProblem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-16 md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        {title}
      </h1>
      <div className="mt-4 font-asap text-base leading-relaxed text-voicesNext-cream/80">
        {children}
      </div>
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
        <p className="mt-2 whitespace-pre-line font-asap text-sm leading-relaxed text-voicesNext-cream/75">
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
  const [session, accessToken] = await Promise.all([
    getSession(),
    getAccessToken(),
  ]);
  const validation = await validateArtistInvitation(
    token,
    accessToken ?? undefined,
  );

  if (!validation.ok) {
    if (validation.code === "ALREADY_CLAIMED") {
      // The DJ who claimed it, back on an old email: nothing to explain.
      if (validation.claimedByYou) redirect("/account/artist");

      return (
        <InvitationProblem title="Already claimed">
          <p>This artist profile has already been claimed.</p>
          <p className="mt-3">
            If that was you,{" "}
            <Link href="/sign-in?next=/account/artist" className={linkClassName}>
              sign in
            </Link>{" "}
            to manage it.
          </p>
        </InvitationProblem>
      );
    }

    if (validation.code === "EXPIRED_INVITATION") {
      return (
        <InvitationProblem title="This link has expired">
          <p>
            Invitation links last seven days. We can email a new one to the
            address this invitation was sent to.
          </p>
          <RenewInvitationForm token={token} />
        </InvitationProblem>
      );
    }

    return (
      <InvitationProblem title="Invitation unavailable">
        <p>{validation.message}</p>
        <p className="mt-3">
          If you&rsquo;ve been sent a newer link, use that one. Otherwise email{" "}
          <a href="mailto:info@voicesradio.co.uk" className={linkClassName}>
            info@voicesradio.co.uk
          </a>{" "}
          and we&rsquo;ll send you a fresh invitation.
        </p>
      </InvitationProblem>
    );
  }

  const invitation = validation.data.invitation;
  const sessionEmail = session?.email ?? null;
  const sessionMatchesInvitation =
    sessionEmail?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="mx-auto max-w-[620px] px-4 py-16 md:px-0">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Claim artist profile
      </h1>
      <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/70">
        This invitation is for {invitation.email}.
      </p>

      {sessionEmail && !sessionMatchesInvitation && (
        <p
          data-testid="claim-session-mismatch"
          className="mt-4 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface px-4 py-3 font-asap text-sm text-voicesNext-cream/85"
        >
          You&rsquo;re signed in as {sessionEmail}. Claiming this profile signs
          you in as {invitation.email} instead.
        </p>
      )}

      <InvitationSummary invitation={invitation} />
      <ClaimArtistForm
        token={token}
        invitation={invitation}
        sessionMatchesInvitation={sessionMatchesInvitation}
      />
    </div>
  );
}
