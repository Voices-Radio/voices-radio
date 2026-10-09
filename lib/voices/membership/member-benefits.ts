export interface MemberBenefitCopy {
  title: string;
  description: string;
}

/**
 * What every member gets, whatever they contribute — there are no tiers, so
 * this is one flat list shown on /join (see
 * docs/plans/sliding-scale-membership.md §2.3). Kept in code rather than
 * Sanity: it is the commercial promise made at the point of payment, so a
 * change to it should go through review.
 */
export const MEMBER_BENEFITS: readonly MemberBenefitCopy[] = [
  {
    title: "Save your favourite artists & shows",
    description:
      "Save your Favourite Artists & Shows to your account, so they're always easy to find.",
  },
  {
    title: "Merch discount",
    description: "Money off Voices merch in the shop.",
  },
  {
    title: "Event discounts",
    description: "A discount code for Voices events, sent to you as a member.",
  },
  {
    title: "Early release tickets",
    description: "Get access to event tickets before they go on general sale.",
  },
  {
    title: "Exclusive DJ sets from events",
    description: "Sets recorded at Voices events, for members only.",
  },
  {
    title: "Behind the scenes content",
    description: "A look at what goes on behind the station.",
  },
  {
    title: "Giving back",
    description:
      "Your contribution is spent on philanthropy and building a better community, not on shareholders.",
  },
];

/** Promised but not live yet — shown separately so nothing reads as available that isn't. */
export const MEMBER_BENEFITS_COMING_SOON: readonly MemberBenefitCopy[] = [
  {
    title: "Tracklists of shows",
    description: "See what was played on the shows you love.",
  },
  {
    title: "Members newsletter",
    description: "News and updates from the station, straight to your inbox.",
  },
];
