import { describe, expect, it } from "vitest";
import { BENEFIT_STATE_META, benefitActionLabel } from "./benefit-copy";
import { benefitStateSchema } from "./schemas";

describe("BENEFIT_STATE_META", () => {
  it("has an entry for all nine benefit states in the contract's enum", () => {
    for (const state of benefitStateSchema.options) {
      expect(BENEFIT_STATE_META[state]).toBeDefined();
    }
  });

  it("ballot states never use 'claimed' language — eligibility to submit, not guaranteed admission", () => {
    expect(BENEFIT_STATE_META.requires_action.label.toLowerCase()).not.toContain(
      "claimed",
    );
    expect(BENEFIT_STATE_META.ballot_entered.label.toLowerCase()).not.toContain(
      "claimed",
    );
  });

  it("only available and requires_action are actionable", () => {
    const actionable = Object.entries(BENEFIT_STATE_META)
      .filter(([, meta]) => meta.actionable)
      .map(([state]) => state);
    expect(actionable.sort()).toEqual(["available", "requires_action"]);
  });
});

describe("benefitActionLabel", () => {
  it("maps each backend action to member-facing copy", () => {
    expect(benefitActionLabel("claim")).toBe("Claim");
    expect(benefitActionLabel("enter_ballot")).toBe("Enter ballot");
    expect(benefitActionLabel("submit")).toBe("Submit");
    expect(benefitActionLabel("book")).toBe("Book");
    expect(benefitActionLabel("view_offer")).toBe("View offer");
    expect(benefitActionLabel("show_code")).toBe("Show code");
  });

  it("falls back to 'Claim' when the backend sends no action", () => {
    expect(benefitActionLabel(null)).toBe("Claim");
  });
});
