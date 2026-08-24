import { Building2, Megaphone, Music2, Radio } from "lucide-react";
import { services } from "../content";
import { SectionHeader } from "./SectionHeader";

const icons = [Building2, Music2, Megaphone, Radio];

export function Proposition() {
  return (
    <section
      id="offer"
      className="bg-slate-50 px-4 py-12 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="The proposition"
          title="Programming a venue is more than just music, it's an operations challenge."
        >
          <p>
            A room&rsquo;s music has to work with the ebbs and flow of the
            trade, the licence, the neighbours and the margins, not just the
            vibe. We start with how the space actually works, then build a
            programme that fits it and keeps customers coming back.
          </p>
        </SectionHeader>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = icons[index];
            return (
              <article
                key={service.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-6"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-voices-purple/10 p-3 text-voices-purple md:mb-5">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 md:text-xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
