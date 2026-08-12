import { describe, expect, it } from "vitest";
import {
  benefitsResponseSchema,
  membershipStateSchema,
  tiersResponseSchema,
} from "./schemas";

/**
 * Nothing from the backend is trusted unparsed (contract-wide principle).
 * These tests exist so a malformed payload is caught here, at the
 * boundary, rather than three components deep — matching the intent
 * documented in membership-client.ts.
 */
describe("tiersResponseSchema", () => {
  it("accepts a well-formed tiers response", () => {
    const result = tiersResponseSchema.safeParse({
      tiers: [
        {
          id: "member",
          name: "Member",
          monthlyPriceMinor: 800,
          annualPriceMinor: 8000,
          currency: "gbp",
          mostPopular: true,
          sortOrder: 2,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative price", () => {
    const result = tiersResponseSchema.safeParse({
      tiers: [
        {
          id: "member",
          name: "Member",
          monthlyPriceMinor: -100,
          annualPriceMinor: 8000,
          currency: "gbp",
          mostPopular: true,
          sortOrder: 2,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a response with no tiers array at all", () => {
    expect(tiersResponseSchema.safeParse({}).success).toBe(false);
    expect(tiersResponseSchema.safeParse(null).success).toBe(false);
  });
});

describe("membershipStateSchema", () => {
  const base = {
    tierId: "member",
    cadence: "monthly" as const,
    priceMinor: 800,
    currency: "gbp",
    renewsAt: "2027-01-01T00:00:00Z",
    paidThroughAt: "2027-01-01T00:00:00Z",
    scheduledChange: null,
    isFoundingMember: false,
    paymentIssue: null,
  };

  it("accepts status: null — the 'never subscribed' state distinct from expired", () => {
    expect(
      membershipStateSchema.safeParse({ ...base, status: null }).success,
    ).toBe(true);
  });

  it("accepts every documented status string", () => {
    for (const status of [
      "active",
      "cancelling",
      "grace",
      "complimentary",
      "expired",
      "pending_reconciliation",
    ]) {
      expect(membershipStateSchema.safeParse({ ...base, status }).success).toBe(
        true,
      );
    }
  });

  it("rejects an unrecognised status string", () => {
    expect(
      membershipStateSchema.safeParse({ ...base, status: "some_new_status" })
        .success,
    ).toBe(false);
  });

  // Verbatim from GET /api/membership/me on 2026-08-12, immediately after
  // checkout. The backend omits renewsAt entirely in this state even though
  // the contract documents it; requiring it made /account render a generic
  // error at the exact moment a member had just paid.
  it("accepts the live pending_reconciliation payload, which omits renewsAt", () => {
    const result = membershipStateSchema.safeParse({
      status: "pending_reconciliation",
      tierId: "supporter",
      cadence: "monthly",
      priceMinor: 300,
      currency: "gbp",
      paidThroughAt: null,
      scheduledChange: null,
      isFoundingMember: false,
      paymentIssue: null,
    });

    expect(result.success).toBe(true);
    // An omitted nullable field must normalise to null, not undefined, so
    // downstream `=== null` checks behave the same either way.
    expect(result.success && result.data.renewsAt).toBeNull();
  });

  it("treats every omitted nullable field as null", () => {
    const result = membershipStateSchema.safeParse({
      status: null,
      isFoundingMember: false,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.tierId).toBeNull();
    expect(result.data.cadence).toBeNull();
    expect(result.data.priceMinor).toBeNull();
    expect(result.data.currency).toBeNull();
    expect(result.data.paidThroughAt).toBeNull();
    expect(result.data.scheduledChange).toBeNull();
    expect(result.data.paymentIssue).toBeNull();
  });

  it("still rejects a wrong type in a nullable field", () => {
    expect(
      membershipStateSchema.safeParse({ ...base, priceMinor: "300" }).success,
    ).toBe(false);
  });

  it("accepts a populated scheduledChange", () => {
    const result = membershipStateSchema.safeParse({
      ...base,
      status: "active",
      scheduledChange: {
        type: "downgrade",
        toTierId: "supporter",
        effectiveAt: "2027-02-01T00:00:00Z",
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("benefitsResponseSchema", () => {
  it("accepts all nine benefit states", () => {
    const states = [
      "available",
      "claimed",
      "used",
      "expired",
      "not_yet_available",
      "capacity_full",
      "ineligible",
      "requires_action",
      "ballot_entered",
    ];

    const result = benefitsResponseSchema.safeParse({
      benefits: states.map((state, index) => ({
        id: `b${index}`,
        slug: `benefit-${index}`,
        name: "A benefit",
        state,
        capacityRemaining: null,
        action: null,
        availableFrom: null,
        expiresAt: null,
      })),
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unrecognised action verb", () => {
    const result = benefitsResponseSchema.safeParse({
      benefits: [
        {
          id: "b1",
          slug: "benefit-1",
          name: "A benefit",
          state: "available",
          capacityRemaining: null,
          action: "do_a_backflip",
          availableFrom: null,
          expiresAt: null,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
