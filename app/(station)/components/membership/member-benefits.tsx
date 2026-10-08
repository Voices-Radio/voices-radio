import {
  MEMBER_BENEFITS,
  MEMBER_BENEFITS_COMING_SOON,
  type MemberBenefitCopy,
} from "@/lib/voices/membership/member-benefits";

function Tick() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-voicesNext-background"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  );
}

function BenefitList({
  items,
  muted = false,
}: {
  items: readonly MemberBenefitCopy[];
  muted?: boolean;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface p-4"
        >
          <span
            aria-hidden="true"
            className={
              muted
                ? "mt-0.5 h-1.5 w-1.5 shrink-0 translate-y-1.5 rounded-full bg-voicesNext-secondary"
                : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-voicesNext-orange"
            }
          >
            {!muted && <Tick />}
          </span>
          <div>
            <h3 className="font-gabarito text-base font-bold leading-snug text-voicesNext-cream">
              {item.title}
            </h3>
            <p className="mt-1 font-asap text-sm leading-relaxed text-voicesNext-cream/70">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * What a contribution gets the member. Every amount unlocks the same list.
 * Sits beside the amount picker on /join so the offer and the price are seen
 * together, rather than the offer sitting below the fold.
 */
export default function MemberBenefits() {
  return (
    <section aria-labelledby="member-benefits-heading">
      <h2
        id="member-benefits-heading"
        className="font-outfit text-3xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-4xl"
      >
        What you get
      </h2>
      <p className="mt-3 max-w-xl font-gabarito text-base text-voicesNext-cream/90">
        Every member gets all of this, whatever amount you choose.
      </p>

      <div className="mt-6">
        <BenefitList items={MEMBER_BENEFITS} />
      </div>
    </section>
  );
}

/** Promised but not live yet — kept apart so nothing reads as available that isn't. */
export function MemberBenefitsComingSoon() {
  return (
    <section aria-labelledby="member-benefits-coming-soon-heading">
      <h2
        id="member-benefits-coming-soon-heading"
        className="font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-orangeText"
      >
        Coming soon
      </h2>
      <div className="mt-4">
        <BenefitList items={MEMBER_BENEFITS_COMING_SOON} muted />
      </div>
    </section>
  );
}
