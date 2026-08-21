import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getBenefits,
  getMembership,
  getTiers,
} from "@/lib/voices/membership/membership-client";
import {
  accountHomeDecision,
  parseAccountMode,
} from "@/lib/voices/membership/capabilities";
import {
  getSession,
  lookupCapabilities,
} from "@/lib/voices/membership/session";
import MembershipStatusCard from "../components/membership/membership-status-card";

export const metadata: Metadata = {
  title: "Your account",
};

const USABLE_BENEFIT_STATES = new Set(["available", "requires_action"]);

function AccountNotice({
  missing,
  artist,
}: {
  missing?: string;
  artist?: string;
}) {
  if (
    missing !== "artist" &&
    missing !== "member" &&
    artist !== "missing" &&
    artist !== "unavailable"
  ) {
    return null;
  }

  const message =
    artist === "missing"
      ? "This account is not linked to an artist profile. Use the invitation link from Voices to claim one."
      : artist === "unavailable"
      ? "Your artist profile is linked, but it cannot be edited from this account right now. Contact Voices if this looks wrong."
      : missing === "artist"
      ? "You signed in successfully, but this account is not linked to an artist profile."
      : "You signed in successfully, but this account does not currently have a membership.";

  return (
    <div className="mb-6 rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 font-gabarito text-sm text-voicesNext-cream">
      {message}
    </div>
  );
}

function EmptyAccountState() {
  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Your account
      </h1>
      <div className="mt-6 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6">
        <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
          Nothing active yet
        </h2>
        <p className="mt-3 font-asap text-sm leading-relaxed text-voicesNext-cream/75">
          This login is not linked to a membership or an artist profile right
          now. Join as a member, or use the invitation link from Voices to claim
          an artist profile.
        </p>
        <Link
          href="/join"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange"
        >
          Join as a member
        </Link>
      </div>
    </div>
  );
}

/**
 * Shown when the capabilities lookup fails, in place of EmptyAccountState.
 *
 * Deliberately says nothing about what this account holds, because at this
 * point we do not know — and a member reading "nothing active yet" during a
 * backend blip would reasonably conclude their subscription had lapsed.
 */
function CapabilitiesUnavailableState() {
  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Your account
      </h1>
      <div
        role="alert"
        data-testid="capabilities-unavailable"
        className="mt-6 rounded-voices-md border border-voicesNext-orange bg-voicesNext-surface p-6"
      >
        <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
          We couldn&rsquo;t load your account
        </h2>
        <p className="mt-3 font-asap text-sm leading-relaxed text-voicesNext-cream/75">
          Your membership and artist profile are unaffected — we just
          couldn&rsquo;t reach them right now. Please try again in a moment.
        </p>
        <Link
          href="/account"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ missing?: string; artist?: string }>;
}) {
  const [params, store] = await Promise.all([searchParams, cookies()]);
  const lookup = await lookupCapabilities();

  // "We couldn't load your account" is a different sentence from "your
  // account is empty", and only one of them is true when the capabilities
  // endpoint is down. Told the wrong one, a paying member has every reason
  // to think their membership has vanished.
  if (lookup.status === "unavailable") {
    return <CapabilitiesUnavailableState />;
  }

  const capabilities = lookup.status === "ok" ? lookup.data : null;
  const decision = accountHomeDecision(
    capabilities,
    parseAccountMode(store.get("voices_account_mode")?.value),
  );

  if (decision.kind === "redirect") {
    redirect(decision.href);
  }

  if (decision.kind === "empty") {
    return <EmptyAccountState />;
  }

  const [user, membershipResult, tiersResult, benefitsResult] =
    await Promise.all([
      getSession(),
      getMembership(),
      getTiers(),
      getBenefits(),
    ]);

  return (
    <div>
      <AccountNotice missing={params.missing} artist={params.artist} />
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        {user?.firstName ? `Hi ${user.firstName}` : "Your account"}
      </h1>

      <div className="mt-6">
        {membershipResult.ok ? (
          <MembershipStatusCard
            state={membershipResult.data}
            tierName={
              tiersResult.ok
                ? tiersResult.data.find(
                    (tier) => tier.id === membershipResult.data.tierId,
                  )?.name ?? null
                : null
            }
          />
        ) : (
          <div
            role="alert"
            className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 font-gabarito text-sm text-voicesNext-cream/90"
          >
            {membershipResult.message}
          </div>
        )}
      </div>

      {benefitsResult.ok && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
              Ready to use
            </h2>
            <Link
              href="/account/benefits"
              className="font-gabarito text-sm font-bold text-voicesNext-cream/70 underline underline-offset-2 hover:text-voicesNext-orange"
            >
              View all benefits
            </Link>
          </div>

          {(() => {
            const usable = benefitsResult.data.filter((benefit) =>
              USABLE_BENEFIT_STATES.has(benefit.state),
            );
            return usable.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2">
                {usable.map((benefit) => (
                  <li key={benefit.id}>
                    <Link
                      href={`/benefits/${benefit.slug}`}
                      className="flex items-center justify-between rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 font-gabarito text-sm text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange"
                    >
                      {benefit.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/70">
                Nothing waiting on you right now.
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}
