import { z } from "zod";

/**
 * Runtime validation for every membership backend response, matching
 * docs/voices-membership-backend-api-contract.md. Nothing from the backend
 * is trusted unparsed — a malformed payload fails once, here, with a
 * logged error, instead of surfacing as a confusing crash three components
 * deep.
 */

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
  tierId: z.string().nullable(),
  cadence: membershipCadenceApiSchema.nullable(),
  priceMinor: z.number().int().nonnegative().nullable(),
  currency: z.string().nullable(),
  renewsAt: z.string().nullable(),
  paidThroughAt: z.string().nullable(),
  scheduledChange: scheduledChangeSchema,
  isFoundingMember: z.boolean(),
  paymentIssue: paymentIssueSchema,
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

export const membershipProfileSchema = z.object({
  displayName: z.string().nullable(),
  supporterWallOptIn: z.boolean(),
  marketingConsent: z.boolean(),
  address: z.string().nullable(),
});
export type MembershipProfile = z.infer<typeof membershipProfileSchema>;

export const backendErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
