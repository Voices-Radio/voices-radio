import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  validateArtistInvitation,
  type ArtistInvitation,
} from "@/lib/voices/membership/artist-invitations-client";
import { getAccessToken, getSession } from "@/lib/voices/membership/session";
import {
  AccountPageIntro,
  AccountSurface,
} from "../../../account/components/account-surface";
import ClaimArtistForm from "./claim-artist-form";
import RenewInvitationForm from "./renew-invitation-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Claim artist profile",
};

/** One column, one width: the page, the card and the form all share it. */
const shellClassName =
  "mx-auto w-full max-w-[560px] px-4 py-12 md:px-8 md:py-16";

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
    <div className={shellClassName}>
      <AccountPageIntro
        eyebrow="Artist invitation"
        title={title}
        className="mx-auto text-center"
      />
      <AccountSurface interactive={false} className="mt-6">
        <div className="font-asap text-base leading-relaxed text-voicesNext-cream/80">
          {children}
        </div>
      </AccountSurface>
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function InvitationSummary({ invitation }: { invitation: ArtistInvitation }) {
  const artist = invitation.artist;
  if (!artist) return null;

  return (
    <div className="flex items-start gap-4 border-b border-voicesNext-border pb-6">
      {artist.imageUrl ? (
        // Externally hosted, so a plain <img> avoids allow-listing every host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artist.imageUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-full border border-voicesNext-border object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-voicesNext-border bg-voicesNext-background font-outfit text-xl font-black text-voicesNext-cream/70"
        >
          {artist.name ? initialsOf(artist.name) : "?"}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-gabarito text-xs font-bold uppercase tracking-[1.6px] text-voicesNext-cream/60">
          Artist profile
        </p>
        {artist.name ? (
          <h2 className="mt-1 break-words font-gabarito text-xl font-bold text-voicesNext-cream">
            {artist.name}
          </h2>
        ) : (
          <p className="mt-1 font-asap text-base text-voicesNext-cream/85">
            Your profile is ready to claim. You’ll choose your artist name
            below.
          </p>
        )}
        {artist.bio && (
          <p className="mt-2 line-clamp-3 whitespace-pre-line font-asap text-sm leading-relaxed text-voicesNext-cream/75">
            {artist.bio}
          </p>
        )}
      </div>
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
    <div className={shellClassName}>
      <AccountPageIntro
        eyebrow="Artist invitation"
        title="Claim your profile"
        className="mx-auto text-center"
      />

      {sessionEmail && !sessionMatchesInvitation && (
        <p
          data-testid="claim-session-mismatch"
          className="mt-6 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface px-4 py-3 font-asap text-sm text-voicesNext-cream/85"
        >
          You&rsquo;re signed in as {sessionEmail}. Claiming this profile signs
          you in as {invitation.email} instead.
        </p>
      )}

      <AccountSurface interactive={false} className="mt-6">
        <InvitationSummary invitation={invitation} />
        <ClaimArtistForm
          token={token}
          invitation={invitation}
          sessionMatchesInvitation={sessionMatchesInvitation}
        />
      </AccountSurface>
    </div>
  );
}
