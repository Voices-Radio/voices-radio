import { format } from "date-fns";

const CURRENCY_SYMBOLS: Record<string, string> = { gbp: "£", usd: "$", eur: "€" };

/** Integer minor units (contract §0) → "£8". No decimals for whole pounds. */
export function formatMinorUnits(minor: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toLowerCase()] ?? `${currency.toUpperCase()} `;
  const major = minor / 100;
  const display = Number.isInteger(major) ? major.toString() : major.toFixed(2);
  return `${symbol}${display}`;
}

export function formatMinorUnitsWithCadence(
  minor: number,
  currency: string,
  cadence: "monthly" | "annual",
): string {
  return `${formatMinorUnits(minor, currency)}/${cadence === "monthly" ? "month" : "year"}`;
}

/** ISO date string → "5 September 2027". Returns null unchanged (caller decides copy). */
export function formatMembershipDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "d MMMM yyyy");
}
