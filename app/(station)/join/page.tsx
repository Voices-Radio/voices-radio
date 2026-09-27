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
import { getSession } from "@/lib/voices/membership/session";
import ContributionSummary from "../components/membership/contribution-summary";

export const metadata: Metadata = {
  alternates: { canonical: "/join" },
  title: "Join Voices Radio",
  description:
    "Support Voices Radio with a monthly or annual contribution, from £3.99 a month.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ cadence?: string; checkoutError?: string }>;
}) {
  const [cmsCopy, plansResult, session, resolvedSearchParams] =
    await Promise.all([
      getMembershipPage(),
      getPlans(),
      getSession(),
      searchParams,
    ]);

  const copy = withMembershipCopyFallback(cmsCopy);
  const cadence = parseMembershipCadence(resolvedSearchParams.cadence);
  // Signed-in visitors skip account creation entirely — /join/checkout
  // starts the Stripe handoff directly. Signed-out visitors go through
  // /join/create-account, which creates the account first.
  const ctaBasePath = session ? "/join/checkout" : "/join/create-account";

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
      <header className="mb-10 flex flex-col gap-3 text-center md:mb-14">
        <h1 className="font-outfit text-4xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-6xl">
          {copy.join_heading}
        </h1>
        {copy.join_subheading && (
          <p className="mx-auto max-w-2xl font-gabarito text-base text-voicesNext-cream/90 md:text-lg">
            {copy.join_subheading}
          </p>
        )}
      </header>

      {resolvedSearchParams.checkoutError && (
        <p
          role="alert"
          data-testid="form-error"
          className="mx-auto mb-8 max-w-2xl rounded-voices-sm border border-voicesNext-orange bg-voicesNext-surface px-4 py-3 text-center font-gabarito text-sm text-voicesNext-cream"
        >
          {resolvedSearchParams.checkoutError}
        </p>
      )}

      <ContributionSummary
        scale={scale}
        annual={annual}
        cadence={cadence}
        ctaBasePath={ctaBasePath}
        scaleBody={copy.join_scale_body}
      />

      <p className="mx-auto mt-10 max-w-2xl text-center font-asap text-sm leading-relaxed text-voicesNext-cream/70">
        {copy.join_ballot_disclaimer}
      </p>

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
