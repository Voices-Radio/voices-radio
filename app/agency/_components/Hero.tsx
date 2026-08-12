import { ArrowDown, ArrowRight } from "lucide-react";
import { briefHref } from "../content";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[640px] items-center overflow-hidden bg-slate-950 px-4 pb-12 pt-24 text-white sm:min-h-screen sm:px-6 sm:pb-0 lg:px-8"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, rgba(95, 92, 243, 0.35), transparent 28%), linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.76)), url('/studio-2.jpg')",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-center text-center">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-white/90">
            London music programming
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-7xl">
            We program music
            <span className="block text-voices-purple">to suit your needs.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-slate-200 md:text-2xl">
            Music programming and talent curation for venues, hospitality
            groups, brands and cultural spaces. From a single date to a fully
            managed multi-space calendar, 150 to 2,000 capacity.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={briefHref}
              className="min-h-12 inline-flex w-full items-center justify-center gap-2 rounded-full bg-voices-purple px-8 py-4 text-base font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
            >
              Start a brief
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#work"
              className="min-h-12 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white px-8 py-4 text-base font-black text-white transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
            >
              See our work
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 hidden justify-center sm:flex">
        <a
          href="#offer"
          aria-label="Scroll to offer"
          className="text-white/85 flex flex-col items-center gap-2 transition hover:text-voices-purple"
        >
          <span className="text-xs font-black uppercase tracking-[0.18em]">
            Scroll
          </span>
          <ArrowDown className="h-7 w-7 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
