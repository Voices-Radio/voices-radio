import { groq } from "next-sanity";
import type { Image, PortableTextBlock } from "sanity";

// Membership Queries

/** Reusable GROQ filter clause: only content with no effectiveFrom, or one that has already passed. */
const notFutureDated = groq`(!defined(effectiveFrom) || effectiveFrom <= now())`;

export const membershipPageQuery = groq`*[_type == "membershipPage"][0]`;

export interface MembershipFaq {
  question: string;
  answer: PortableTextBlock[];
}

export interface MembershipPage {
  support_heading: string;
  support_subheading: string;
  support_primary_cta_text?: string;
  support_secondary_cta_text?: string;
  support_radio_stays_open_heading: string;
  support_radio_stays_open_body: string;
  support_impact_heading?: string;
  support_impact_body?: PortableTextBlock[];

  join_heading: string;
  join_subheading?: string;
  /** Shown near the slider — what a member's contribution funds, tier-free copy. */
  join_scale_body?: string;

  faqs?: MembershipFaq[];

  dashboard_announcement?: string;
  founding_member_badge_text: string;
  cancellation_copy?: string;
  /**
   * The cancel-flow retention offer, renamed from
   * supporter_downgrade_offer_* — there is no "Supporter" tier to switch
   * to anymore, just an offer to reduce to the scale minimum (£3.99).
   */
  retention_offer_heading?: string;
  retention_offer_body?: string;
}

export const membershipBenefitsQuery = groq`*[_type == "membershipBenefit" && ${notFutureDated}]`;

export const membershipBenefitQuery = groq`*[_type == "membershipBenefit" && slug.current == $slug && ${notFutureDated}][0]`;

export interface MembershipBenefit {
  _id: string;
  slug: { current: string };
  name: string;
  summary: string;
  fullDescription?: string;
  eligibilityExplanation?: string;
  redemptionInstructions?: string;
  terms?: string;
  isCapacityLimited?: boolean;
}

export const listingPagesQuery = groq`*[_type == "listingPages"][0]`;

export interface ListingPagesCopy {
  shows?: { eyebrow?: string; title?: string; description?: string };
  artists?: {
    title?: string;
    description?: string;
    kxTitle?: string;
    kxDescription?: string;
    eastTitle?: string;
    eastDescription?: string;
  };
  music?: { title?: string };
  blog?: { eyebrow?: string; title?: string; description?: string };
}

export const collaboratePageQuery = groq`*[_type == "collaboratePage"][0]`;

export interface CollaboratePageCopy {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  applyCtaText?: string;
  contactCtaText?: string;
  cards?: Array<{
    _key?: string;
    title?: string;
    copy?: string;
    href?: string;
    linkLabel?: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
}
