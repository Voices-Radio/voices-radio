import type { Benefit, BenefitState } from "./schemas";

export interface BenefitStateMeta {
  label: string;
  tone: "positive" | "warning" | "neutral";
  /** True when the benefit's redeem action should be offered. */
  actionable: boolean;
}

/**
 * Copy for all nine benefit states (contract §6 / brief). Ballot-style
 * benefits (requires_action → ballot_entered) deliberately never say
 * "claimed" — the brief requires eligibility-to-submit language, never a
 * promise of admission.
 */
export const BENEFIT_STATE_META: Record<BenefitState, BenefitStateMeta> = {
  available: { label: "Available", tone: "positive", actionable: true },
  claimed: { label: "Claimed", tone: "positive", actionable: false },
  used: { label: "Used", tone: "neutral", actionable: false },
  expired: { label: "Expired", tone: "neutral", actionable: false },
  not_yet_available: { label: "Not yet available", tone: "neutral", actionable: false },
  capacity_full: { label: "Full for now", tone: "neutral", actionable: false },
  ineligible: { label: "Not included in your tier", tone: "neutral", actionable: false },
  requires_action: { label: "Eligible to enter", tone: "positive", actionable: true },
  ballot_entered: {
    label: "Entry submitted — you'll hear back if selected",
    tone: "positive",
    actionable: false,
  },
};

const ACTION_LABEL: Record<NonNullable<Benefit["action"]>, string> = {
  show_code: "Show code",
  claim: "Claim",
  enter_ballot: "Enter ballot",
  submit: "Submit",
  book: "Book",
  view_offer: "View offer",
};

export function benefitActionLabel(action: Benefit["action"]): string {
  return action ? ACTION_LABEL[action] : "Claim";
}
