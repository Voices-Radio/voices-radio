import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMembershipBenefit } from "@/sanity.client";
import { getSession } from "@/lib/voices/membership/session";
import { getBenefits } from "@/lib/voices/membership/membership-client";
import {
  BENEFIT_STATE_META,
  benefitActionLabel,
} from "@/lib/voices/membership/benefit-copy";
import RedeemButton from "../../account/benefits/redeem-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const benefit = await getMembershipBenefit(slug);
  return { title: benefit?.name ?? "Membership benefit" };
}

/**
 * Public detail page — copy comes from Sanity (eligibility, terms,
 * redemption instructions), but entitlement is never inferred here: a
 * signed-in member's actual state/action comes from GET
 * /api/membership/benefits, never from the tier they merely appear to hold.
 */
export default async function BenefitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [benefit, user] = await Promise.all([
    getMembershipBenefit(slug),
    getSession(),
  ]);

  if (!benefit) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream md:text-4xl">
        {benefit.name}
      </h1>
      <p className="mt-3 font-gabarito text-base text-voicesNext-cream/90">
        {benefit.summary}
      </p>

      {benefit.fullDescription && (
        <p className="mt-6 font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
          {benefit.fullDescription}
        </p>
      )}

      {benefit.eligibilityExplanation && (
        <div className="mt-6 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface p-4">
          <h2 className="font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-cream/70">
            Eligibility
          </h2>
          <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/90">
            {benefit.eligibilityExplanation}
          </p>
        </div>
      )}

      {benefit.redemptionInstructions && (
        <div className="mt-6">
          <h2 className="font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-cream/70">
            How to redeem
          </h2>
          <p className="mt-2 font-gabarito text-sm text-voicesNext-cream/90">
            {benefit.redemptionInstructions}
          </p>
        </div>
      )}

      {benefit.terms && (
        <p className="mt-6 font-asap text-xs text-voicesNext-cream/50">
          {benefit.terms}
        </p>
      )}

      <BenefitLiveState slug={slug} signedIn={Boolean(user)} />
    </div>
  );
}

async function BenefitLiveState({
  slug,
  signedIn,
}: {
  slug: string;
  signedIn: boolean;
}) {
  if (!signedIn) {
    return (
      <div className="mt-8 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-5">
        <p className="font-gabarito text-sm text-voicesNext-cream/90">
          Sign in to see whether you can use this benefit.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/benefits/${slug}`)}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background"
          >
            Sign in
          </Link>
          <Link
            href="/join"
            className="inline-flex h-11 items-center justify-center rounded-full border border-voicesNext-border px-5 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange"
          >
            Join Voices
          </Link>
        </div>
      </div>
    );
  }

  const result = await getBenefits();
  if (!result.ok) {
    return (
      <p
        role="alert"
        className="mt-8 font-gabarito text-sm text-voicesNext-cream/90"
      >
        {result.message}
      </p>
    );
  }

  const benefit = result.data.find((entry) => entry.slug === slug);
  if (!benefit) {
    return (
      <p className="mt-8 font-gabarito text-sm text-voicesNext-cream/70">
        This benefit isn&rsquo;t part of your current tier.
      </p>
    );
  }

  const meta = BENEFIT_STATE_META[benefit.state];

  return (
    <div className="mt-8 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-5">
      <p className="font-asap text-xs font-bold uppercase tracking-wide text-voicesNext-orange">
        {meta.label}
      </p>
      {meta.actionable && (
        <div className="mt-3">
          <RedeemButton
            benefitId={benefit.id}
            benefitSlug={benefit.slug}
            label={benefitActionLabel(benefit.action)}
          />
        </div>
      )}
    </div>
  );
}
