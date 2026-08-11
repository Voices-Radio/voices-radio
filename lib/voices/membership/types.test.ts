import { describe, expect, it } from "vitest";
import { isMembershipCadence, parseMembershipCadence } from "./types";

describe("isMembershipCadence", () => {
  it("accepts monthly and annual", () => {
    expect(isMembershipCadence("monthly")).toBe(true);
    expect(isMembershipCadence("annual")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isMembershipCadence("weekly")).toBe(false);
    expect(isMembershipCadence("")).toBe(false);
    expect(isMembershipCadence(undefined)).toBe(false);
    expect(isMembershipCadence(null)).toBe(false);
    expect(isMembershipCadence(42)).toBe(false);
  });
});

describe("parseMembershipCadence", () => {
  it("defaults to monthly when nothing is provided", () => {
    expect(parseMembershipCadence(undefined)).toBe("monthly");
  });

  it("defaults to monthly for an invalid value", () => {
    expect(parseMembershipCadence("yearly")).toBe("monthly");
  });

  it("passes through a valid cadence", () => {
    expect(parseMembershipCadence("annual")).toBe("annual");
    expect(parseMembershipCadence("monthly")).toBe("monthly");
  });

  it("reads the first entry when Next hands back an array (repeated query param)", () => {
    expect(parseMembershipCadence(["annual", "monthly"])).toBe("annual");
  });

  it("defaults to monthly when the array's first entry is invalid", () => {
    expect(parseMembershipCadence(["bogus", "annual"])).toBe("monthly");
  });
});
