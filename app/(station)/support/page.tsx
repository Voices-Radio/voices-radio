import Link from "next/link";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { getMembershipPage } from "@/sanity.client";
import { withMembershipCopyFallback } from "@/lib/voices/membership/constants";

export const metadata: Metadata = {
  title: "Support Voices Radio",
  description:
    "Back independent community radio in London from £4 a month. The stream stays free — membership gets you closer to the people, place and culture behind it.",
};

export default async function SupportPage() {
  const cmsCopy = await getMembershipPage();
  const copy = withMembershipCopyFallback(cmsCopy);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-8 md:py-16">
      {/* Impact */}
      <section className="flex flex-col items-start gap-6 border-b border-voicesNext-border pb-12">
        <h1 className="w-full max-w-3xl break-words font-outfit text-5xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-7xl">
          {copy.support_heading}
        </h1>
        <p className="w-full max-w-2xl font-gabarito text-lg leading-relaxed text-voicesNext-cream/90">
          {copy.support_subheading}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/join"
            className="inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          >
            {copy.support_primary_cta_text}
          </Link>
          <a
            href="#what-membership-funds"
            className="inline-flex h-12 items-center justify-center rounded-full border border-voicesNext-border px-6 font-gabarito text-base font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
          >
            {copy.support_secondary_cta_text}
          </a>
        </div>
      </section>

      {/* Radio stays open / benefits */}
      <section
        id="what-membership-funds"
        className="border-b border-voicesNext-border py-12"
      >
        <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream md:text-3xl">
          {copy.support_radio_stays_open_heading}
        </h2>
        <p className="mt-4 max-w-3xl font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          {copy.support_radio_stays_open_body}
        </p>

        {copy.support_impact_body && copy.support_impact_body.length > 0 && (
          <div className="mt-8 max-w-3xl">
            {copy.support_impact_heading && (
              <h3 className="font-gabarito text-lg font-bold text-voicesNext-cream">
                {copy.support_impact_heading}
              </h3>
            )}
            <div className="mt-3 flex flex-col gap-3 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
              <PortableText value={copy.support_impact_body} />
            </div>
          </div>
        )}
      </section>

      {/* Pricing (deferred to /join) */}
      <section className="py-12">
        <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream md:text-3xl">
          Ready to join?
        </h2>
        <p className="mt-3 max-w-2xl font-gabarito text-base text-voicesNext-cream/90">
          Compare all four tiers, monthly or annual, and pick the level
          that&rsquo;s right for you.
        </p>
        <Link
          href="/join"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        >
          Compare membership tiers
        </Link>
      </section>
    </div>
  );
}
