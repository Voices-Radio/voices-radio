import type { MembershipPage } from "@/sanity.queries";
import type { MembershipScaleView, MembershipAnnualView } from "./types";
import type { MembershipScaleApi, MembershipAnnualApi } from "./schemas";

/**
 * Launch scale fallback, matching docs/plans/sliding-scale-membership.md.
 * Used whenever the backend is unreachable, so /support and /join never
 * render an empty page — but note mergeMembershipScale() below never falls
 * back to these *prices* once the API has actually responded; this is only
 * for the API-unreachable case.
 */
export const MEMBERSHIP_FALLBACK_SCALE: MembershipScaleView = {
  minMinor: 399,
  maxMinor: 1999,
  defaultMinor: 599,
  stepMinor: 100,
  currency: "gbp",
  points: [
    399, 499, 599, 699, 799, 899, 999, 1099, 1199, 1299, 1399, 1499, 1599,
    1699, 1799, 1899, 1999,
  ],
};

export const MEMBERSHIP_FALLBACK_ANNUAL: MembershipAnnualView = {
  amountMinor: 4099,
  currency: "gbp",
  discountPercent: 14,
  savingMinor: 689,
};

export const MEMBERSHIP_FALLBACK_COPY: MembershipPage = {
  support_heading: "Keep independent radio loud.",
  support_subheading:
    "Back Voices from £3.99 a month and help fund the people, space and ideas that keep London's community radio moving.",
  support_primary_cta_text: "Join Voices",
  support_secondary_cta_text: "See what membership funds",
  support_radio_stays_open_heading:
    "Radio stays open. Membership gets you closer.",
  support_radio_stays_open_body:
    "Listening to Voices is, and always will be, free. Membership doesn't unlock the stream — it gets you closer to the people, place and culture behind it, with more ways to participate.",
  join_heading: "Choose what you give.",
  join_subheading:
    "Slide to set your monthly contribution, or save by paying annually. Every amount keeps the station running.",
  join_scale_body:
    "There's no tier to pick — just the amount that feels right, from £3.99 to £19.99 a month.",
  founding_member_badge_text: "FOUNDING MEMBER · VOICES · 2026",
  retention_offer_heading: "Reduce to £3.99/month",
  retention_offer_body: "Keep supporting Voices at our lowest level.",
};

/** Merge CMS copy over the launch-copy fallback so partial CMS content never blanks a field. */
export function withMembershipCopyFallback(
  cmsCopy: MembershipPage | null,
): MembershipPage {
  return { ...MEMBERSHIP_FALLBACK_COPY, ...(cmsCopy ?? {}) };
}

/**
 * Merges the backend's authoritative scale (contract §2) into the view
 * shape components render. Unlike the old tier merge, there is no CMS
 * layer here — the scale has no marketing copy per-amount, so once the API
 * has responded these numbers are used as-is, never replaced by the
 * fallback.
 */
export function mergeMembershipScale(
  apiScale: MembershipScaleApi,
): MembershipScaleView {
  const points = apiScale.points
    .map((p) => p.amountMinor)
    .sort((a, b) => a - b);
  const stepMinor =
    points.length > 1 ? points[1] - points[0] : MEMBERSHIP_FALLBACK_SCALE.stepMinor;

  return {
    minMinor: apiScale.minMinor,
    maxMinor: apiScale.maxMinor,
    defaultMinor: apiScale.defaultMinor,
    stepMinor,
    currency: apiScale.currency,
    points,
  };
}

export function mergeMembershipAnnual(
  apiAnnual: MembershipAnnualApi,
): MembershipAnnualView | null {
  if (!apiAnnual) return null;
  return {
    amountMinor: apiAnnual.amountMinor,
    currency: apiAnnual.currency,
    discountPercent: apiAnnual.discountPercent ?? null,
    savingMinor: apiAnnual.savingMinor ?? null,
  };
}
