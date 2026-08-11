export type MembershipCadence = "monthly" | "annual";

export interface MembershipTierView {
  id: string;
  name: string;
  headline: string;
  description?: string;
  monthlyPriceDisplay: string;
  annualPriceDisplay: string;
  benefitBullets: string[];
  mostPopular?: boolean;
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
