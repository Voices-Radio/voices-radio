import type { Metadata } from "next";
import { getRedemptions } from "@/lib/voices/membership/membership-client";
import { formatMembershipDate } from "@/lib/voices/membership/format";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your redemptions",
};

export default async function AccountRedemptionsPage() {
  const result = await getRedemptions();

  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Your redemptions
      </h1>

      {!result.ok ? (
        <p
          role="alert"
          className="mt-4 font-gabarito text-sm text-voicesNext-cream/90"
        >
          {result.message}
        </p>
      ) : result.data.length === 0 ? (
        <p className="mt-4 font-gabarito text-sm text-voicesNext-cream/70">
          Nothing redeemed yet.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {result.data.map((redemption) => (
            <li
              key={`${redemption.benefitName}-${redemption.code}`}
              className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-gabarito text-base font-bold text-voicesNext-cream">
                  {redemption.benefitName}
                </h2>
                <span className="font-asap text-xs font-bold uppercase tracking-wide text-voicesNext-cream/60">
                  {redemption.status}
                </span>
              </div>

              {/* Member-facing code only — never an internal redemption ID (contract §8).
                  orangeText, not orange — plain orange fails 4.5:1 as text on this
                  card (axe-flagged; see tailwind.config.js), and this is a code
                  people actually need to read and type out. */}
              <p className="mt-2 font-outfit text-lg font-black tracking-wide text-voicesNext-orangeText">
                {redemption.code}
              </p>

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-gabarito text-xs text-voicesNext-cream/70">
                {redemption.claimedAt && (
                  <div className="flex gap-1">
                    <dt>Claimed</dt>
                    <dd>{formatMembershipDate(redemption.claimedAt)}</dd>
                  </div>
                )}
                {redemption.usedAt && (
                  <div className="flex gap-1">
                    <dt>Used</dt>
                    <dd>{formatMembershipDate(redemption.usedAt)}</dd>
                  </div>
                )}
                {redemption.expiresAt && (
                  <div className="flex gap-1">
                    <dt>Expires</dt>
                    <dd>{formatMembershipDate(redemption.expiresAt)}</dd>
                  </div>
                )}
              </dl>

              {redemption.instructions && (
                <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/90">
                  {redemption.instructions}
                </p>
              )}

              {redemption.terms && (
                <p className="mt-2 font-asap text-xs text-voicesNext-cream/50">
                  {redemption.terms}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
