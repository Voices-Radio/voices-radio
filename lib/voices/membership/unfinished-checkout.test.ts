import { describe, expect, it } from "vitest";
import {
  SETTLING_WINDOW_MS,
  getResumableCheckout,
  isSettling,
} from "./unfinished-checkout";

const NOW = Date.parse("2026-10-08T12:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const checkout = (startedAt: string | null) => ({
  amountMinor: 599,
  cadence: "monthly" as const,
  startedAt,
});

describe("getResumableCheckout", () => {
  it("offers to resume a checkout that lapsed unpaid, with the same choice", () => {
    expect(
      getResumableCheckout({ status: null, checkout: checkout(ago(3_600_000)) }, NOW),
    ).toEqual({
      amountMinor: 599,
      cadence: "monthly",
      href: "/join/checkout?amount=599&cadence=monthly",
    });
  });

  it("does not offer to resume a payment that is probably still settling", () => {
    const state = {
      status: "pending_reconciliation" as const,
      checkout: checkout(ago(SETTLING_WINDOW_MS - 1000)),
    };
    expect(getResumableCheckout(state, NOW)).toBeNull();
    expect(isSettling(state, NOW)).toBe(true);
  });

  it("offers to resume a pending checkout once it is older than the settling window", () => {
    const state = {
      status: "pending_reconciliation" as const,
      checkout: checkout(ago(SETTLING_WINDOW_MS + 1000)),
    };
    expect(getResumableCheckout(state, NOW)).not.toBeNull();
    expect(isSettling(state, NOW)).toBe(false);
  });

  it("treats an unknown start time as old rather than spinning forever", () => {
    expect(
      getResumableCheckout({ status: "pending_reconciliation", checkout: checkout(null) }, NOW),
    ).not.toBeNull();
  });

  it("never offers to resume for a real membership or when there is no checkout", () => {
    expect(getResumableCheckout({ status: "active", checkout: checkout(ago(9e6)) }, NOW)).toBeNull();
    expect(getResumableCheckout({ status: "expired", checkout: checkout(ago(9e6)) }, NOW)).toBeNull();
    expect(getResumableCheckout({ status: null, checkout: null }, NOW)).toBeNull();
  });
});
