import type { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /**
   * Optional readout pinned to the right of the title on desktop. The hero's
   * title column is capped for measure, so on a wide screen the right half
   * is otherwise empty — a station-style status line puts something useful
   * in it without stretching the headline.
   */
  meta?: ReactNode;
}) {
  return (
    <section className="border-b border-voicesNext-border">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between md:gap-10 md:px-8 md:py-16">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-4 font-asap text-sm font-bold uppercase text-voicesNext-orangeText">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance max-w-4xl font-outfit text-5xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-3xl font-gabarito text-lg leading-relaxed text-voicesNext-cream">
              {description}
            </p>
          )}
        </div>

        {meta && <div className="shrink-0 md:pb-2">{meta}</div>}
      </div>
    </section>
  );
}
