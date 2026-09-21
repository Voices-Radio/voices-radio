import { Quote } from "lucide-react";
import { testimonials } from "../content";

// Gated behind SHOW_TESTIMONIALS in page.tsx until quotes/attributions are
// signed off - do not render this unconditionally.
export function Testimonials() {
  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-black leading-tight text-slate-900 sm:text-4xl md:mb-14 md:text-5xl">
          What clients say
        </h2>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote className="h-6 w-6 text-voices-purple" />
              <blockquote className="mt-4 flex-1 text-sm font-semibold leading-relaxed text-slate-600">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm font-black text-slate-900">
                {item.name}
                <span className="block font-semibold text-slate-500">
                  {item.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
