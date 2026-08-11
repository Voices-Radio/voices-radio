import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_FALLBACK_COPY,
  MEMBERSHIP_FALLBACK_TIERS,
  mergeMembershipTiers,
  normalizeMembershipTiers,
  withMembershipCopyFallback,
} from "./constants";
import type { MembershipTier } from "@/sanity.queries";
import type { MembershipTierApi } from "./schemas";

describe("normalizeMembershipTiers", () => {
  it("falls back to launch tiers when Sanity returns null", () => {
    expect(normalizeMembershipTiers(null)).toEqual(MEMBERSHIP_FALLBACK_TIERS);
  });

  it("falls back to launch tiers when Sanity returns an empty array", () => {
    expect(normalizeMembershipTiers([])).toEqual(MEMBERSHIP_FALLBACK_TIERS);
  });

  it("exactly one fallback tier is marked most popular, and it's Member", () => {
    const popular = MEMBERSHIP_FALLBACK_TIERS.filter((t) => t.mostPopular);
    expect(popular).toHaveLength(1);
    expect(popular[0].id).toBe("member");
  });

  it("maps CMS tier documents, preserving query order", () => {
    const cmsTiers: MembershipTier[] = [
      {
        _id: "1",
        tierId: { current: "member" },
        name: "Member",
        headline: "Get closer to Voices.",
        monthlyPriceDisplay: "£8",
        annualPriceDisplay: "£80",
        benefitBullets: ["Perk one", "Perk two"],
        mostPopular: true,
        sortOrder: 1,
      },
      {
        _id: "2",
        tierId: { current: "patron" },
        name: "Patron",
        headline: "Help build what comes next.",
        monthlyPriceDisplay: "£30",
        annualPriceDisplay: "£300",
        benefitBullets: [],
        mostPopular: false,
        sortOrder: 2,
      },
    ];

    const result = normalizeMembershipTiers(cmsTiers);

    expect(result).toEqual([
      {
        id: "member",
        name: "Member",
        headline: "Get closer to Voices.",
        description: undefined,
        monthlyPriceDisplay: "£8",
        annualPriceDisplay: "£80",
        benefitBullets: ["Perk one", "Perk two"],
        mostPopular: true,
      },
      {
        id: "patron",
        name: "Patron",
        headline: "Help build what comes next.",
        description: undefined,
        monthlyPriceDisplay: "£30",
        annualPriceDisplay: "£300",
        benefitBullets: [],
        mostPopular: false,
      },
    ]);
  });

  it("falls back to a lowercased name when tierId is missing", () => {
    const cmsTiers = [
      {
        _id: "1",
        name: "Insider",
        headline: "Step inside the station.",
        monthlyPriceDisplay: "£15",
        annualPriceDisplay: "£150",
        benefitBullets: [],
        sortOrder: 1,
      },
    ] as unknown as MembershipTier[];

    expect(normalizeMembershipTiers(cmsTiers)[0].id).toBe("insider");
  });
});

describe("mergeMembershipTiers", () => {
  const apiTiers: MembershipTierApi[] = [
    {
      id: "patron",
      name: "Patron",
      monthlyPriceMinor: 3000,
      annualPriceMinor: 30000,
      currency: "gbp",
      mostPopular: false,
      sortOrder: 4,
    },
    {
      id: "member",
      name: "Member",
      monthlyPriceMinor: 800,
      annualPriceMinor: 8000,
      currency: "gbp",
      mostPopular: true,
      sortOrder: 2,
    },
  ];

  it("orders by the backend's sortOrder, not the input array order", () => {
    const result = mergeMembershipTiers(apiTiers, null);
    expect(result.map((tier) => tier.id)).toEqual(["member", "patron"]);
  });

  it("prices always come from the API, formatted — never a hardcoded fallback", () => {
    const result = mergeMembershipTiers(apiTiers, null);
    const member = result.find((tier) => tier.id === "member")!;
    expect(member.monthlyPriceDisplay).toBe("£8");
    expect(member.annualPriceDisplay).toBe("£80");
  });

  it("uses CMS copy for headline/benefits when a matching CMS tier exists", () => {
    const cmsTiers: MembershipTier[] = [
      {
        _id: "1",
        tierId: { current: "member" },
        name: "Member",
        headline: "CMS headline for Member",
        monthlyPriceDisplay: "ignored",
        annualPriceDisplay: "ignored",
        benefitBullets: ["CMS perk"],
        mostPopular: true,
        sortOrder: 1,
      },
    ];

    const result = mergeMembershipTiers(apiTiers, cmsTiers);
    const member = result.find((tier) => tier.id === "member")!;
    expect(member.headline).toBe("CMS headline for Member");
    expect(member.benefitBullets).toEqual(["CMS perk"]);
    // Price still comes from the API, not the (ignored) CMS display strings.
    expect(member.monthlyPriceDisplay).toBe("£8");
  });

  it("falls back to launch copy when a tier has no CMS document yet", () => {
    const result = mergeMembershipTiers(apiTiers, null);
    const member = result.find((tier) => tier.id === "member")!;
    expect(member.headline).toBe(
      MEMBERSHIP_FALLBACK_TIERS.find((t) => t.id === "member")!.headline,
    );
  });

  it("falls back to the tier's own name when neither CMS nor launch copy has a headline", () => {
    const unknownTier: MembershipTierApi = {
      id: "brand-new-tier",
      name: "Brand New Tier",
      monthlyPriceMinor: 100,
      annualPriceMinor: 1000,
      currency: "gbp",
      mostPopular: false,
      sortOrder: 1,
    };
    const result = mergeMembershipTiers([unknownTier], null);
    expect(result[0].headline).toBe("Brand New Tier");
    expect(result[0].benefitBullets).toEqual([]);
  });

  it("mostPopular always comes from the API, even if CMS disagrees", () => {
    const cmsTiers: MembershipTier[] = [
      {
        _id: "1",
        tierId: { current: "member" },
        name: "Member",
        headline: "x",
        monthlyPriceDisplay: "x",
        annualPriceDisplay: "x",
        benefitBullets: [],
        mostPopular: false,
        sortOrder: 1,
      },
    ];
    const result = mergeMembershipTiers(apiTiers, cmsTiers);
    expect(result.find((t) => t.id === "member")!.mostPopular).toBe(true);
  });
});

describe("withMembershipCopyFallback", () => {
  it("returns the full launch-copy fallback when the CMS has nothing", () => {
    expect(withMembershipCopyFallback(null)).toEqual(MEMBERSHIP_FALLBACK_COPY);
  });

  it("lets partial CMS content override individual fields without blanking the rest", () => {
    const result = withMembershipCopyFallback({
      support_heading: "Custom heading from CMS",
    } as any);

    expect(result.support_heading).toBe("Custom heading from CMS");
    // Everything else still comes from the fallback.
    expect(result.support_subheading).toBe(
      MEMBERSHIP_FALLBACK_COPY.support_subheading,
    );
    expect(result.join_ballot_disclaimer).toBe(
      MEMBERSHIP_FALLBACK_COPY.join_ballot_disclaimer,
    );
  });
});
