import {
  MEMBER_BENEFITS,
  MEMBER_BENEFITS_COMING_SOON,
  type MemberBenefitCopy,
} from "@/lib/voices/membership/member-benefits";
import { cn } from "@/lib/utils";

/**
 * One row of the running order: a track number, then title and description.
 * Numbers are zero-padded and tabular so the titles line up down the list.
 */
function BenefitRow({
  item,
  number,
  muted,
}: {
  item: MemberBenefitCopy;
  number: number;
  muted: boolean;
}) {
  return (
    <li className="flex gap-4 py-4">
      <span
        data-testid="benefit-number"
        aria-hidden="true"
        className={cn(
          "w-7 shrink-0 pt-0.5 font-outfit text-sm font-black tabular-nums",
          muted ? "text-voicesNext-secondary" : "text-voicesNext-orangeText",
        )}
      >
        {String(number).padStart(2, "0")}
      </span>
      <div>
        <h3
          className={cn(
            "font-gabarito text-lg font-bold leading-snug",
            muted ? "text-voicesNext-cream/70" : "text-voicesNext-cream",
          )}
        >
          {item.title}
        </h3>
        <p className="mt-1 font-asap text-sm leading-relaxed text-voicesNext-cream/70">
          {item.description}
        </p>
      </div>
    </li>
  );
}

/**
 * What a contribution gets the member, laid out like a running order. Every
 * amount unlocks the same list. "Coming soon" items carry on the numbering
 * but sit under their own label in muted type, so none reads as live.
 */
export default function MemberBenefits() {
  return (
    <section aria-labelledby="member-benefits-heading">
      <h2
        id="member-benefits-heading"
        className="scroll-mt-24 font-outfit text-3xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-4xl"
      >
        What you get
      </h2>
      <p className="mt-3 max-w-md font-gabarito text-base text-voicesNext-cream/90">
        Every member gets all of this, whatever amount you choose.
      </p>

      <ol className="mt-6 divide-y divide-voicesNext-border/40 border-y border-voicesNext-border/40">
        {MEMBER_BENEFITS.map((item, index) => (
          <BenefitRow
            key={item.title}
            item={item}
            number={index + 1}
            muted={false}
          />
        ))}
      </ol>

      <h2 className="mt-10 font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-orangeText">
        Coming soon
      </h2>
      <ol className="mt-3 divide-y divide-voicesNext-border/40 border-y border-voicesNext-border/40">
        {MEMBER_BENEFITS_COMING_SOON.map((item, index) => (
          <BenefitRow
            key={item.title}
            item={item}
            number={MEMBER_BENEFITS.length + index + 1}
            muted
          />
        ))}
      </ol>
    </section>
  );
}
