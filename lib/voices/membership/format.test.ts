import { describe, expect, it } from "vitest";
import {
  formatMembershipDate,
  formatMinorUnits,
  formatMinorUnitsWithCadence,
} from "./format";

describe("formatMinorUnits", () => {
  it("formats whole-pound amounts with no decimals", () => {
    expect(formatMinorUnits(800, "gbp")).toBe("£8");
  });

  it("formats fractional amounts with two decimals", () => {
    expect(formatMinorUnits(850, "gbp")).toBe("£8.50");
  });

  it("falls back to an uppercase currency-code prefix for an unknown currency", () => {
    expect(formatMinorUnits(500, "aud")).toBe("AUD 5");
  });

  it("is case-insensitive on the currency code", () => {
    expect(formatMinorUnits(400, "GBP")).toBe("£4");
  });
});

describe("formatMinorUnitsWithCadence", () => {
  it("appends /month for monthly", () => {
    expect(formatMinorUnitsWithCadence(800, "gbp", "monthly")).toBe("£8/month");
  });

  it("appends /year for annual", () => {
    expect(formatMinorUnitsWithCadence(8000, "gbp", "annual")).toBe("£80/year");
  });
});

describe("formatMembershipDate", () => {
  it("formats an ISO string as 'D Month YYYY'", () => {
    // Midday UTC avoids the date shifting across the local-timezone
    // boundary that date-fns' format() renders in (unlike a midnight
    // timestamp, which would render as the previous day west of UTC).
    expect(formatMembershipDate("2027-09-05T12:00:00Z")).toBe(
      "5 September 2027",
    );
  });

  it("returns null for null input", () => {
    expect(formatMembershipDate(null)).toBeNull();
  });

  it("returns null for an unparseable date string", () => {
    expect(formatMembershipDate("not-a-date")).toBeNull();
  });
});
