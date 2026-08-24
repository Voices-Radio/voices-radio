import { process } from "../content";
import { SectionHeader } from "./SectionHeader";

export function HowItWorks() {
  return (
    <section
      id="process"
      className="bg-white px-4 py-12 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="How it works"
          title="From first brief to delivery."
        >
          <p>
            Clients get one accountable point of contact from curation through
            delivery, with clear programming decisions and consolidated
            communication.
          </p>
        </SectionHeader>

        <div className="grid gap-4 md:grid-cols-5">
          {process.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5"
            >
              <p className="font-mono text-sm font-black text-voices-purple">
                0{index + 1}
              </p>
              <h3 className="mt-5 text-xl font-black text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
