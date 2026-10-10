import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { getMembershipPage } from "@/sanity.client";
import {
  mergeMembershipScale,
  mergeMembershipAnnual,
  withMembershipCopyFallback,
} from "@/lib/voices/membership/constants";
import { parseMembershipCadence } from "@/lib/voices/membership/types";
import { getPlans } from "@/lib/voices/membership/membership-client";
import { getMembership } from "@/lib/voices/membership/membership-client";
import { getSession } from "@/lib/voices/membership/session";
import { safeAccountNextPath } from "@/lib/voices/membership/capabilities";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { accountSecondaryButtonClassName } from "../account/components/account-surface";
import JoinStatusBanner from "./join-status-banner";
import ContributionSummary from "../components/membership/contribution-summary";
import MemberBenefits from "../components/membership/member-benefits";

export const metadata: Metadata = {
  alternates: { canonical: "/join" },
  title: "Join Voices Radio",
  description:
    "Support Voices Radio with a monthly or annual contribution, from £3.99 a month.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{
    cadence?: string;
    checkoutError?: string;
    checkout?: string;
    next?: string;
  }>;
}) {
  const [cmsCopy, plansResult, session, resolvedSearchParams] =
    await Promise.all([
      getMembershipPage(),
      getPlans(),
      getSession(),
      searchParams,
    ]);

  // Only for signed-in visitors; a failed lookup just means no banner.
  const membershipResult = session ? await getMembership() : null;

  const copy = withMembershipCopyFallback(cmsCopy);
  const cadence = parseMembershipCadence(resolvedSearchParams.cadence);
  // Signed-in visitors skip account creation entirely — /join/checkout
  // starts the Stripe handoff directly. Signed-out visitors go through
  // /join/create-account, which creates the account first.
  const ctaBasePath = session ? "/join/checkout" : "/join/create-account";
  // Where the visitor was headed (e.g. back to the artist whose heart they
  // tapped). Only ever a same-site path; carried through so signing in lands
  // them there with their save replayed.
  const next = safeAccountNextPath(resolvedSearchParams.next);
  const createAccountHref = next
    ? `/create-account?next=${encodeURIComponent(next)}`
    : "/create-account";
  const signInHref = next
    ? `/sign-in?next=${encodeURIComponent(next)}`
    : "/sign-in";

  // Prices are money, not marketing copy: the backend is the source of
  // truth for what's actually charged (contract §2). If it's unreachable,
  // show an honest "unavailable" state rather than a hardcoded price a
  // visitor might not actually be charged.
  if (!plansResult.ok) {
    return (
      <main
        id="main-content"
        className="mx-auto max-w-[720px] scroll-mt-24 px-4 py-16 text-center md:px-0"
      >
        <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
          Pricing is temporarily unavailable
        </h1>
        <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          {plansResult.message}
        </p>
      </main>
    );
  }

  const scale = mergeMembershipScale(plansResult.data.scale);
  const annual = mergeMembershipAnnual(plansResult.data.annual);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[1120px] scroll-mt-24 px-4 py-10 md:px-8 md:py-16"
    >
      {resolvedSearchParams.checkoutError && (
        <p
          role="alert"
          data-testid="form-error"
          className="mx-auto mb-8 max-w-2xl rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 text-center font-gabarito text-sm text-voicesNext-cream"
        >
          {resolvedSearchParams.checkoutError}
        </p>
      )}

      <JoinStatusBanner
        membership={membershipResult?.ok ? membershipResult.data : null}
        checkoutCancelled={resolvedSearchParams.checkout === "cancelled"}
      />

      {/* Two columns: the ask on the left (heading, then the picker directly
          beneath it), the offer on the right. Left is sticky on desktop so
          Continue stays in view while the benefits are read. Single column
          on mobile, with a jump link from the picker down to the offer. */}
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-0">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:pr-12 xl:pr-16">
          <header className="flex flex-col gap-3">
            <p className="font-asap text-xs font-bold uppercase tracking-[1.2px] text-voicesNext-orangeText">
              Membership
            </p>
            <h1 className="font-outfit text-4xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-5xl">
              {copy.join_heading}
            </h1>
            {copy.join_subheading && (
              <p className="max-w-lg font-gabarito text-base text-voicesNext-cream/90 md:text-lg">
                {copy.join_subheading}
              </p>
            )}
            {!session && (
              <Link
                href={signInHref}
                className={cn(
                  accountSecondaryButtonClassName,
                  "mt-2 h-11 self-start px-5 text-sm",
                )}
              >
                Already have an account? Sign in
              </Link>
            )}
            {!session && (
              <p className="font-gabarito text-sm text-voicesNext-cream/70">
                Just want to save favourites?{" "}
                <Link
                  href={createAccountHref}
                  className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
                >
                  Create a free account
                </Link>
              </p>
            )}
          </header>

          <ContributionSummary
            scale={scale}
            annual={annual}
            cadence={cadence}
            ctaBasePath={ctaBasePath}
            ctaNext={session ? undefined : next}
            scaleBody={copy.join_scale_body}
          />
        </div>

        <div className="lg:border-l lg:border-voicesNext-border/40 lg:pl-12 xl:pl-16">
          <MemberBenefits />
        </div>
      </div>

      {copy.faqs && copy.faqs.length > 0 && (
        <section className="mt-16 border-t border-voicesNext-border pt-10">
          <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream">
            Frequently asked questions
          </h2>
          <dl className="mt-6 flex flex-col gap-6">
            {copy.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-gabarito text-base font-bold text-voicesNext-cream">
                  {faq.question}
                </dt>
                <dd className="mt-2 max-w-3xl font-gabarito text-sm leading-relaxed text-voicesNext-cream/90">
                  <PortableText value={faq.answer} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}
