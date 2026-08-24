import { formats } from "../content";
import { SectionHeader } from "./SectionHeader";

export function EngagementFormats() {
  return (
    <section
      id="formats"
      className="bg-white px-4 py-12 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Engagement formats"
          title="One brief, one programming partner."
        >
          <p>
            Whether it&rsquo;s a single date, a recurring residency, a full
            calendar or a site-wide activation, it runs through one point of
            contact.
          </p>
        </SectionHeader>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {formats.map((format, index) => (
            <article
              key={format.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-6"
            >
              <p className="font-mono text-sm font-black text-voices-purple">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-lg font-black text-slate-900 md:text-xl">
                {format.label}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                {format.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
