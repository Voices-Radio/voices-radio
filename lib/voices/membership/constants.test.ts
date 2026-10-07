import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_FALLBACK_COPY,
  MEMBERSHIP_FALLBACK_SCALE,
  mergeMembershipScale,
  mergeMembershipAnnual,
  withMembershipCopyFallback,
} from "./constants";
import type { MembershipScaleApi, MembershipAnnualApi } from "./schemas";

describe("MEMBERSHIP_FALLBACK_SCALE", () => {
  it("spans £3.99 to £15.99 with a £5.99 default, matching docs/plans/sliding-scale-membership.md", () => {
    expect(MEMBERSHIP_FALLBACK_SCALE.minMinor).toBe(399);
    expect(MEMBERSHIP_FALLBACK_SCALE.maxMinor).toBe(1599);
    expect(MEMBERSHIP_FALLBACK_SCALE.defaultMinor).toBe(599);
    expect(MEMBERSHIP_FALLBACK_SCALE.stepMinor).toBe(100);
  });

  it("has exactly 13 points, one per £1 step", () => {
    expect(MEMBERSHIP_FALLBACK_SCALE.points).toHaveLength(13);
    expect(MEMBERSHIP_FALLBACK_SCALE.points[0]).toBe(399);
    expect(
      MEMBERSHIP_FALLBACK_SCALE.points[
        MEMBERSHIP_FALLBACK_SCALE.points.length - 1
      ],
    ).toBe(1599);
  });
});

describe("mergeMembershipScale", () => {
  const apiScale: MembershipScaleApi = {
    minMinor: 399,
    maxMinor: 1599,
    defaultMinor: 599,
    currency: "gbp",
    points: [
      { amountMinor: 999, priceVersionId: "pv2" },
      { amountMinor: 399, priceVersionId: "pv1" },
      { amountMinor: 1599, priceVersionId: "pv3" },
    ],
  };

  it("sorts points ascending regardless of API order", () => {
    const result = mergeMembershipScale(apiScale);
    expect(result.points).toEqual([399, 999, 1599]);
  });

  it("passes min/max/default/currency straight through from the API — never a hardcoded fallback once the API has responded", () => {
    const result = mergeMembershipScale(apiScale);
    expect(result.minMinor).toBe(399);
    expect(result.maxMinor).toBe(1599);
    expect(result.defaultMinor).toBe(599);
    expect(result.currency).toBe("gbp");
  });

  it("derives stepMinor from the gap between the two lowest points", () => {
    const result = mergeMembershipScale(apiScale);
    // Lowest two sorted points are 399 and 999 in this fixture (deliberately
    // not a real £1 step) — the derivation is generic, not hardcoded to 100.
    expect(result.stepMinor).toBe(600);
  });

  it("falls back to the fallback scale's step when there are fewer than two points", () => {
    const result = mergeMembershipScale({
      ...apiScale,
      points: [{ amountMinor: 599, priceVersionId: "pv1" }],
    });
    expect(result.stepMinor).toBe(MEMBERSHIP_FALLBACK_SCALE.stepMinor);
  });
});

describe("mergeMembershipAnnual", () => {
  it("returns null when the API reports no active annual price", () => {
    expect(mergeMembershipAnnual(null)).toBeNull();
  });

  it("passes the server-derived discount through unchanged — never recomputed client-side", () => {
    const apiAnnual: MembershipAnnualApi = {
      amountMinor: 4099,
      currency: "gbp",
      priceVersionId: "pv_annual",
      comparedToMonthlyMinor: 4788,
      savingMinor: 689,
      discountPercent: 14,
    };
    expect(mergeMembershipAnnual(apiAnnual)).toEqual({
      amountMinor: 4099,
      currency: "gbp",
      discountPercent: 14,
      savingMinor: 689,
    });
  });

  it("normalises a missing discountPercent/savingMinor to null, not undefined", () => {
    const apiAnnual: MembershipAnnualApi = {
      amountMinor: 4099,
      currency: "gbp",
      priceVersionId: "pv_annual",
    };
    expect(mergeMembershipAnnual(apiAnnual)).toEqual({
      amountMinor: 4099,
      currency: "gbp",
      discountPercent: null,
      savingMinor: null,
    });
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

  it("mentions no stale tier names in the fallback copy", () => {
    // "Supporter Radio" and "Open Decks" are pre-existing Voices programme
    // names (join_ballot_disclaimer) unrelated to the old "Supporter" tier —
    // deliberately not asserted against here, since a bare substring check
    // would false-positive on them. "Insider"/"Patron" have no such
    // legitimate collision, so those two are safe to check directly.
    const copy = JSON.stringify(MEMBERSHIP_FALLBACK_COPY).toLowerCase();
    for (const stale of ["insider", "patron"]) {
      expect(copy).not.toContain(stale);
    }
  });
});
