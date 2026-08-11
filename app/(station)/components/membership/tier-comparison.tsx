import Link from "next/link";
import CadenceToggle from "./cadence-toggle";
import TierCard from "./tier-card";
import type {
  MembershipCadence,
  MembershipTierView,
} from "@/lib/voices/membership/types";

function tierCtaHref(
  ctaBasePath: string,
  tierId: string,
  cadence: MembershipCadence,
) {
  return `${ctaBasePath}?tier=${tierId}&cadence=${cadence}`;
}

/**
 * Wide comparison at md+ is a real <table> (semantic tier comparison, per
 * the brief) with tier names as column headers and attributes as row
 * headers. Below md it becomes vertically stacked TierCards.
 */
export default function TierComparison({
  tiers,
  cadence,
  ctaBasePath = "/join/create-account",
}: {
  tiers: MembershipTierView[];
  cadence: MembershipCadence;
  /**
   * Where "Choose {tier}" sends a visitor. /join passes "/join/checkout"
   * for an already-signed-in visitor (skips account creation) and leaves
   * the default for a signed-out one.
   */
  ctaBasePath?: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <CadenceToggle cadence={cadence} />
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">
            Comparison of Voices Radio membership tiers, {cadence} billing
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sr-only">
                Attribute
              </th>
              {tiers.map((tier) => (
                <th
                  key={tier.id}
                  scope="col"
                  className="border-b border-voicesNext-border px-4 py-4 font-gabarito text-xl font-bold text-voicesNext-cream"
                >
                  {tier.name}
                  {tier.mostPopular && (
                    <span className="ml-2 inline-flex rounded-full bg-voicesNext-orangeButton px-2 py-0.5 align-middle font-asap text-[10px] font-bold uppercase tracking-[1px] text-white">
                      Most popular
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th
                scope="row"
                className="border-b border-voicesNext-border px-4 py-4 font-gabarito text-sm font-bold uppercase text-voicesNext-cream/70"
              >
                Price
              </th>
              {tiers.map((tier) => (
                <td
                  key={tier.id}
                  className="border-b border-voicesNext-border px-4 py-4 font-outfit text-2xl font-black text-voicesNext-cream"
                >
                  {cadence === "annual"
                    ? tier.annualPriceDisplay
                    : tier.monthlyPriceDisplay}
                  <span className="ml-1 font-gabarito text-sm font-medium text-voicesNext-cream/70">
                    {cadence === "annual" ? "/year" : "/month"}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="border-b border-voicesNext-border px-4 py-4 align-top font-gabarito text-sm font-bold uppercase text-voicesNext-cream/70"
              >
                What&rsquo;s included
              </th>
              {tiers.map((tier) => (
                <td
                  key={tier.id}
                  className="border-b border-voicesNext-border px-4 py-4 align-top"
                >
                  <ul className="flex flex-col gap-2 font-asap text-sm text-voicesNext-cream/90">
                    {tier.benefitBullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-voicesNext-orange"
                        >
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="px-4 py-4 font-gabarito text-sm font-bold uppercase text-voicesNext-cream/70"
              >
                Get started
              </th>
              {tiers.map((tier) => (
                <td key={tier.id} className="px-4 py-4">
                  <Link
                    href={tierCtaHref(ctaBasePath, tier.id, cadence)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                  >
                    Choose {tier.name}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden" data-testid="mobile-tier-cards">
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            cadence={cadence}
            ctaHref={tierCtaHref(ctaBasePath, tier.id, cadence)}
          />
        ))}
      </div>
    </div>
  );
}
