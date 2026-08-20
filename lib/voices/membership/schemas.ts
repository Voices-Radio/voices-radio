import { z } from "zod";

/**
 * Runtime validation for every membership backend response, matching
 * docs/voices-membership-backend-api-contract.md. Nothing from the backend
 * is trusted unparsed — a malformed payload fails once, here, with a
 * logged error, instead of surfacing as a confusing crash three components
 * deep.
 */

/**
 * A field the contract documents as nullable. Treats an omitted key exactly
 * like an explicit `null`, because the two mean the same thing to us and the
 * backend is not consistent about which it sends — `GET /api/membership/me`
 * omits `renewsAt` entirely while a membership is `pending_reconciliation`.
 *
 * Being strict here is worse than useless: it turns one absent optional field
 * into a hard parse failure, which the UI can only render as a generic error.
 * That is a real state every member passes through the instant they pay.
 * Strictness still applies to the fields that actually carry meaning.
 */
function nullish<T extends z.ZodTypeAny>(schema: T) {
  // .default(null) makes the key optional on the way in but keeps it
  // required-and-nullable on the way out, so consumers still get a plain
  // `string | null` rather than having to handle undefined everywhere.
  return schema.nullable().default(null);
}

export const membershipCadenceApiSchema = z.enum(["monthly", "annual"]);

export const membershipTierApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthlyPriceMinor: z.number().int().nonnegative(),
  annualPriceMinor: z.number().int().nonnegative(),
  currency: z.string(),
  mostPopular: z.boolean(),
  sortOrder: z.number(),
});
export type MembershipTierApi = z.infer<typeof membershipTierApiSchema>;

export const tiersResponseSchema = z.object({
  tiers: z.array(membershipTierApiSchema),
});

export const checkoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  sessionId: z.string(),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

// Contract §4: status is one of these strings, or `null` for "never
// subscribed" — distinct from "expired" ("was a member, isn't now").
export const membershipStatusSchema = z
  .enum([
    "active",
    "cancelling",
    "grace",
    "complimentary",
    "expired",
    "pending_reconciliation",
  ])
  .nullable();
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

export const scheduledChangeSchema = z
  .object({
    type: z.enum(["downgrade", "change_cadence"]),
    toTierId: z.string().optional(),
    toCadence: membershipCadenceApiSchema.optional(),
    effectiveAt: z.string(),
  })
  .nullable();
export type ScheduledChange = z.infer<typeof scheduledChangeSchema>;

export const paymentIssueSchema = z
  .object({
    code: z.string(),
    gracePeriodEndsAt: z.string().optional(),
  })
  .nullable();
export type PaymentIssue = z.infer<typeof paymentIssueSchema>;

export const membershipStateSchema = z.object({
  status: membershipStatusSchema,
  tierId: nullish(z.string()),
  cadence: nullish(membershipCadenceApiSchema),
  priceMinor: nullish(z.number().int().nonnegative()),
  currency: nullish(z.string()),
  renewsAt: nullish(z.string()),
  paidThroughAt: nullish(z.string()),
  scheduledChange: nullish(scheduledChangeSchema),
  isFoundingMember: z.boolean(),
  paymentIssue: nullish(paymentIssueSchema),
});
export type MembershipState = z.infer<typeof membershipStateSchema>;

export const benefitStateSchema = z.enum([
  "available",
  "claimed",
  "used",
  "expired",
  "not_yet_available",
  "capacity_full",
  "ineligible",
  "requires_action",
  "ballot_entered",
]);

export const benefitActionSchema = z
  .enum(["show_code", "claim", "enter_ballot", "submit", "book", "view_offer"])
  .nullable();

export const benefitSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  state: benefitStateSchema,
  capacityRemaining: z.number().nullable(),
  action: benefitActionSchema,
  availableFrom: z.string().nullable(),
  expiresAt: z.string().nullable(),
  requiresAddress: z.boolean().optional(),
});
export type Benefit = z.infer<typeof benefitSchema>;
export type BenefitState = z.infer<typeof benefitStateSchema>;

export const benefitsResponseSchema = z.object({
  benefits: z.array(benefitSchema),
});

export const previewChangeResponseSchema = z.object({
  effectiveAt: z.string(),
  priceMinor: z.number().int().nonnegative(),
  proratedAmountMinor: z.number().int().optional(),
  description: z.string(),
});
export type PreviewChangeResponse = z.infer<typeof previewChangeResponseSchema>;

export const immediateChangeResponseSchema = z.object({
  applied: z.literal("immediate"),
  tierId: z.string(),
  cadence: membershipCadenceApiSchema,
  scheduledChange: z.null(),
  unlockedBenefits: z.array(benefitSchema),
});

export const scheduledChangeResponseSchema = z.object({
  applied: z.literal("scheduled"),
  tierId: z.string(),
  cadence: membershipCadenceApiSchema,
  scheduledChange: scheduledChangeSchema,
});

export const cancelResponseSchema = z.object({
  status: z.literal("cancelling"),
  paidThroughAt: z.string(),
});

export const resumeResponseSchema = z.object({
  status: z.literal("active"),
});

export const portalSessionResponseSchema = z.object({
  url: z.string().url(),
});

export const redemptionSchema = z.object({
  benefitName: z.string(),
  status: z.string(),
  claimedAt: z.string().nullable(),
  usedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  instructions: z.string().nullable(),
  code: z.string(),
  terms: z.string().nullable(),
});
export type Redemption = z.infer<typeof redemptionSchema>;

export const redemptionsResponseSchema = z.object({
  redemptions: z.array(redemptionSchema),
});

/**
 * A structured postal address, matching what the backend actually stores
 * (routes/membership/profile.js persists line1/line2/city/postcode/country).
 * Every part is optional: the backend returns a bare `{}` for a member who
 * has never supplied one, and `address` is never a required field.
 */
export const membershipAddressSchema = z.object({
  line1: nullish(z.string()),
  line2: nullish(z.string()),
  city: nullish(z.string()),
  postcode: nullish(z.string()),
  country: nullish(z.string()),
});
export type MembershipAddress = z.infer<typeof membershipAddressSchema>;

export const membershipProfileSchema = z.object({
  displayName: nullish(z.string()),
  supporterWallOptIn: z.boolean(),
  marketingConsent: z.boolean(),
  address: nullish(membershipAddressSchema),
});
export type MembershipProfile = z.infer<typeof membershipProfileSchema>;

export const backendErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const artistSocialLinksSchema = z
  .object({
    instagram: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    twitter: z.string().nullable().optional(),
    facebook: z.string().nullable().optional(),
  })
  .default({});
export type ArtistSocialLinks = z.infer<typeof artistSocialLinksSchema>;

export const artistProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: nullish(z.string()),
  imageUrl: nullish(z.string()),
  bannerUrl: nullish(z.string()),
  genres: z.array(z.string()).default([]),
  mixcloudUsername: nullish(z.string()),
  soundcloudUsername: nullish(z.string()),
  programmingEmail: nullish(z.string()),
  socialLinks: artistSocialLinksSchema,
});
export type ArtistProfile = z.infer<typeof artistProfileSchema>;
