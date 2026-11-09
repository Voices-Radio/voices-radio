export type MembershipCadence = "monthly" | "annual";

/**
 * The monthly sliding scale, as rendered by the contribution slider. There
 * is no tier name/headline here anymore — membership is a single
 * contribution, not a ladder of named products (see
 * docs/plans/sliding-scale-membership.md).
 */
export interface MembershipScaleView {
  minMinor: number;
  maxMinor: number;
  defaultMinor: number;
  /** £1 steps — a UI constant, mirrored from the backend's utils/membershipScale.js. */
  stepMinor: number;
  currency: string;
  /** Every valid monthly amount, ascending — the slider's discrete stops. */
  points: number[];
}

/**
 * The single fixed annual price. `discountPercent`/`savingMinor` are
 * server-derived (never computed client-side) and `null` when annual isn't
 * currently priced below monthly×12 — the discount badge should render
 * nothing in that case, not a stale or negative number.
 */
export interface MembershipAnnualView {
  amountMinor: number;
  currency: string;
  discountPercent: number | null;
  savingMinor: number | null;
}

export function isMembershipCadence(value: unknown): value is MembershipCadence {
  return value === "monthly" || value === "annual";
}

export function parseMembershipCadence(
  value: string | string[] | undefined,
): MembershipCadence {
  const raw = Array.isArray(value) ? value[0] : value;
  return isMembershipCadence(raw) ? raw : "monthly";
}

/** Parses a raw `?amount=` search param into pence, or undefined if absent/invalid. */
export function parseAmountMinor(
  value: string | string[] | undefined,
): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
