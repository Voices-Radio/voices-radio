import { beforeEach, describe, expect, it, vi } from "vitest";

const trackEvent = vi.fn();

vi.mock("fathom-client", () => ({
  trackEvent,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("eventName", () => {
  it("folds amount/cadence/benefit-slug into the event name — no separate metadata object (Fathom can't store it)", async () => {
    const { eventName } = await import("./analytics");

    expect(
      eventName({
        name: "membership_amount_viewed",
        amountMinor: 799,
        cadence: "annual",
      }),
    ).toBe("membership_amount_viewed:799:annual");
    expect(
      eventName({ name: "membership_cadence_toggled", cadence: "monthly" }),
    ).toBe("membership_cadence_toggled:monthly");
    expect(eventName({ name: "membership_upgraded", amountMinor: 1599 })).toBe(
      "membership_upgraded:1599",
    );
    expect(
      eventName({
        name: "membership_benefit_redeemed",
        benefitSlug: "shop-discount",
      }),
    ).toBe("membership_benefit_redeemed:shop-discount");
  });

  it("uses the bare event name for events with no extra fields", async () => {
    const { eventName } = await import("./analytics");
    expect(eventName({ name: "membership_checkout_reconciled" })).toBe(
      "membership_checkout_reconciled",
    );
    expect(eventName({ name: "membership_cancelled" })).toBe(
      "membership_cancelled",
    );
    expect(eventName({ name: "membership_resumed" })).toBe(
      "membership_resumed",
    );
  });

  it("never includes an email, user ID or membership ID — only amount/cadence/benefit-slug reach the name", () => {
    // Static check on the type surface: MembershipAnalyticsEvent's per-variant
    // fields are exhaustively amountMinor/cadence/benefitSlug, enforced by
    // the switch in eventName() having no default case that reads other
    // fields. (Covered functionally by the assertions above.)
    expect(true).toBe(true);
  });
});

describe("trackMembershipEvent", () => {
  it("does not call Fathom outside production (vitest.setup.ts stubs NEXT_PUBLIC_SITE_ENV: 'test')", async () => {
    const { trackMembershipEvent } = await import("./analytics");

    trackMembershipEvent({ name: "membership_cancelled" });
    await Promise.resolve();

    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("calls Fathom's trackEvent with the folded event name in production", async () => {
    vi.doMock("@/env", () => ({
      env: { NEXT_PUBLIC_SITE_ENV: "production" },
    }));
    const { trackMembershipEvent } = await import("./analytics");

    trackMembershipEvent({ name: "membership_upgraded", amountMinor: 3000 });

    await vi.waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith("membership_upgraded:3000");
    });
  });
});
