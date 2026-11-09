import Link from "next/link";
import { cn } from "@/lib/utils";
import { BENEFIT_STATE_META, benefitActionLabel } from "@/lib/voices/membership/benefit-copy";
import { formatMembershipDate } from "@/lib/voices/membership/format";
import type { Benefit } from "@/lib/voices/membership/schemas";
import RedeemButton from "../../account/benefits/redeem-button";

const TONE_CLASSES: Record<"positive" | "warning" | "neutral", string> = {
  positive: "text-voicesNext-orange",
  warning: "text-voicesNext-orange",
  neutral: "text-voicesNext-cream/60",
};

/** Renders all nine benefit states from the brief with a distinct copy + action per state. */
export default function BenefitCard({ benefit }: { benefit: Benefit }) {
  const meta = BENEFIT_STATE_META[benefit.state];
  const availableFrom = formatMembershipDate(benefit.availableFrom);

  return (
    <div className="flex flex-col gap-2 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/benefits/${benefit.slug}`}
          className="font-gabarito text-base font-bold text-voicesNext-cream hover:text-voicesNext-orange"
        >
          {benefit.name}
        </Link>
        <span
          className={cn(
            "shrink-0 font-asap text-xs font-bold uppercase tracking-wide",
            TONE_CLASSES[meta.tone],
          )}
        >
          {meta.label}
        </span>
      </div>

      {benefit.state === "not_yet_available" && availableFrom && (
        <p className="font-gabarito text-sm text-voicesNext-cream/70">
          Available from {availableFrom}.
        </p>
      )}

      {(benefit.state === "claimed" || benefit.state === "used") && (
        <Link
          href="/account/redemptions"
          className="w-fit font-gabarito text-sm font-bold text-voicesNext-cream underline underline-offset-2 hover:text-voicesNext-orange"
        >
          View your code
        </Link>
      )}

      {meta.actionable && (
        <div className="mt-1">
          <RedeemButton
            benefitId={benefit.id}
            benefitSlug={benefit.slug}
            label={benefitActionLabel(benefit.action)}
          />
        </div>
      )}
    </div>
  );
}
