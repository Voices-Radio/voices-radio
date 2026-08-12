import { MapPin } from "lucide-react";
import { caseStudies } from "../content";

const fields = (study: (typeof caseStudies)[number]) =>
  [
    ["Brief", study.brief],
    ["Delivered", study.delivered],
    ["Scale", study.scale],
    ...(study.proof ? [["Proof point", study.proof]] : []),
  ] as const;

export function SelectedWork() {
  return (
    <section
      id="work"
      className="bg-slate-950 px-4 py-12 text-white sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-14">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-voices-purple md:text-sm">
            Selected work
          </p>
          <h2 className="text-2xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            Six programmes, four years, one point of contact.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {caseStudies.map((study) => (
            <article
              key={study.title}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl"
            >
              <details className="group md:hidden">
                <summary className="cursor-pointer list-none bg-slate-900 p-5 text-white [&::-webkit-details-marker]:hidden">
                  <CaseStudyHeader study={study} />
                  <span className="mt-5 inline-flex h-11 items-center rounded-full bg-voices-purple px-4 text-sm font-black text-white">
                    <span className="group-open:hidden">View details</span>
                    <span className="hidden group-open:inline">
                      Hide details
                    </span>
                  </span>
                </summary>

                <div className="grid gap-4 p-5">
                  <CaseStudyFields study={study} />
                </div>
              </details>

              <div className="hidden md:block">
                <div className="min-h-56 relative overflow-hidden bg-slate-900 p-6 text-white">
                  {/* TODO: swap for supplied client photography once available */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(95, 92, 243, 0.55), rgba(15, 23, 42, 0.96)), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.24), transparent 24%)",
                    }}
                  />
                  <div className="relative z-10 pt-20">
                    <CaseStudyHeader study={study} />
                  </div>
                </div>

                <div className="grid gap-5 p-8">
                  <CaseStudyFields study={study} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyHeader({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] md:text-xs md:tracking-[0.16em]">
          {study.type}
        </span>
        <span className="font-mono text-sm font-black text-white/70">
          {study.index}
        </span>
      </div>
      <h3 className="mt-7 text-2xl font-black leading-tight md:text-3xl">
        {study.title}
      </h3>
      <p className="mt-2 text-base font-bold text-white/80 md:text-lg">
        {study.headline}
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-white/75 md:text-sm">
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-voices-purple" />
          {study.location}
        </span>
      </div>
    </>
  );
}

function CaseStudyFields({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <>
      {fields(study).map(([label, text]) => (
        <div key={label}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-voices-purple">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
            {text}
          </p>
        </div>
      ))}
    </>
  );
}
