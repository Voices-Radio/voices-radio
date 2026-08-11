import type { MembershipTier, MembershipPage } from "@/sanity.queries";
import type { MembershipTierView } from "./types";
import type { MembershipTierApi } from "./schemas";
import { formatMinorUnits } from "./format";

/**
 * Launch tier fallbacks from the membership brief. Used whenever Sanity is
 * unavailable, or the membershipTier documents haven't been created yet, so
 * /support and /join never render an empty page.
 */
export const MEMBERSHIP_FALLBACK_TIERS: MembershipTierView[] = [
  {
    id: "supporter",
    name: "Supporter",
    headline: "Keep the signal moving.",
    monthlyPriceDisplay: "£4",
    annualPriceDisplay: "£40",
    benefitBullets: ["Frictionless support", "Supporter recognition"],
  },
  {
    id: "member",
    name: "Member",
    headline: "Get closer to Voices.",
    monthlyPriceDisplay: "£8",
    annualPriceDisplay: "£80",
    benefitBullets: [
      "10% off Voices merch",
      "Event presales",
      "Partner Perks",
      "Latest Voices Note",
    ],
    mostPopular: true,
  },
  {
    id: "insider",
    name: "Insider",
    headline: "Step inside the station.",
    monthlyPriceDisplay: "£15",
    annualPriceDisplay: "£150",
    benefitBullets: [
      "Everything in Member",
      "Studio/live-session ballots",
      "Workshop priority",
    ],
  },
  {
    id: "patron",
    name: "Patron",
    headline: "Help build what comes next.",
    monthlyPriceDisplay: "£30",
    annualPriceDisplay: "£300",
    benefitBullets: [
      "Everything in Insider",
      "Annual supporter pack",
      "Patron open house & recognition",
    ],
  },
];

export const MEMBERSHIP_FALLBACK_COPY: MembershipPage = {
  support_heading: "Keep independent radio loud.",
  support_subheading:
    "Back Voices from £4 a month and help fund the people, space and ideas that keep London's community radio moving.",
  support_primary_cta_text: "Join Voices",
  support_secondary_cta_text: "See what membership funds",
  support_radio_stays_open_heading:
    "Radio stays open. Membership gets you closer.",
  support_radio_stays_open_body:
    "Listening to Voices is, and always will be, free. Membership doesn't unlock the stream — it gets you closer to the people, place and culture behind it, with more ways to participate.",
  join_heading: "Choose how you support Voices.",
  join_subheading:
    "Every tier keeps the station running. Higher tiers add more ways to get involved.",
  join_ballot_disclaimer:
    "Open Decks and Supporter Radio membership gives you eligibility to submit for editorial consideration — it does not guarantee airplay.",
  founding_member_badge_text: "FOUNDING MEMBER · VOICES · 2026",
  supporter_downgrade_offer_heading: "Switch to Supporter — £4/month",
  supporter_downgrade_offer_body: "Keep supporting Voices at our lowest level.",
};

/** Merge CMS copy over the launch-copy fallback so partial CMS content never blanks a field. */
export function withMembershipCopyFallback(
  cmsCopy: MembershipPage | null,
): MembershipPage {
  return { ...MEMBERSHIP_FALLBACK_COPY, ...(cmsCopy ?? {}) };
}

/** Normalize Sanity membershipTier documents, falling back to launch copy when the CMS has none yet. */
export function normalizeMembershipTiers(
  tiers: MembershipTier[] | null,
): MembershipTierView[] {
  if (!tiers || tiers.length === 0) {
    return MEMBERSHIP_FALLBACK_TIERS;
  }

  // Already ordered by sortOrder via membershipTiersQuery.
  return tiers.map((tier) => ({
    id: tier.tierId?.current || tier.name.toLowerCase(),
    name: tier.name,
    headline: tier.headline,
    description: tier.description,
    monthlyPriceDisplay: tier.monthlyPriceDisplay,
    annualPriceDisplay: tier.annualPriceDisplay,
    benefitBullets: tier.benefitBullets ?? [],
    mostPopular: tier.mostPopular ?? false,
  }));
}

/**
 * /join renders live, charged prices: the membership backend is the source
 * of truth for money (contract §2), Sanity is copy-only. This merges the
 * backend's authoritative id/name/price/mostPopular/order with Sanity's
 * headline/description/benefit-bullet copy — falling back to the launch
 * copy above when a tier has no CMS document yet, so a partially-populated
 * CMS never blanks a tier's description.
 *
 * Unlike normalizeMembershipTiers(), this never falls back to hardcoded
 * *prices* — callers only invoke this once GET /api/membership/tiers has
 * already succeeded, precisely so a visitor is never shown a price the
 * backend didn't actually confirm.
 */
export function mergeMembershipTiers(
  apiTiers: MembershipTierApi[],
  cmsTiers: MembershipTier[] | null,
): MembershipTierView[] {
  const cmsById = new Map(
    (cmsTiers ?? [])
      .filter((tier) => tier.tierId?.current)
      .map((tier) => [tier.tierId.current, tier] as const),
  );
  const fallbackById = new Map(
    MEMBERSHIP_FALLBACK_TIERS.map((tier) => [tier.id, tier] as const),
  );

  return [...apiTiers]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((apiTier) => {
      const cms = cmsById.get(apiTier.id);
      const fallback = fallbackById.get(apiTier.id);

      return {
        id: apiTier.id,
        name: apiTier.name,
        headline: cms?.headline ?? fallback?.headline ?? apiTier.name,
        description: cms?.description,
        monthlyPriceDisplay: formatMinorUnits(
          apiTier.monthlyPriceMinor,
          apiTier.currency,
        ),
        annualPriceDisplay: formatMinorUnits(
          apiTier.annualPriceMinor,
          apiTier.currency,
        ),
        benefitBullets: cms?.benefitBullets ?? fallback?.benefitBullets ?? [],
        mostPopular: apiTier.mostPopular,
      };
    });
}
