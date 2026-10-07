import {
  MEMBER_BENEFITS,
  MEMBER_BENEFITS_COMING_SOON,
  type MemberBenefitCopy,
} from "@/lib/voices/membership/member-benefits";

function BenefitList({
  items,
  muted = false,
}: {
  items: readonly MemberBenefitCopy[];
  muted?: boolean;
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface p-4"
        >
          <span
            aria-hidden="true"
            className={
              muted
                ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-voicesNext-secondary"
                : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-voicesNext-orange"
            }
          />
          <div>
            <h3 className="font-gabarito text-base font-bold text-voicesNext-cream">
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
 * What a contribution gets the member. Every amount unlocks the same list;
 * "coming soon" items sit apart so none is promised as live.
 */
export default function MemberBenefits() {
  return (
    <section
      aria-labelledby="member-benefits-heading"
      className="mx-auto mt-14 max-w-3xl"
    >
      <h2
        id="member-benefits-heading"
        className="text-center font-outfit text-3xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-4xl"
      >
        What you get
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center font-gabarito text-base text-voicesNext-cream/90">
        Every member gets all of this, whatever amount you choose.
      </p>

      <div className="mt-8">
        <BenefitList items={MEMBER_BENEFITS} />
      </div>

      <h2 className="mt-12 text-center font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-orangeText">
        Coming soon
      </h2>
      <div className="mt-4">
        <BenefitList items={MEMBER_BENEFITS_COMING_SOON} muted />
      </div>
    </section>
  );
}
