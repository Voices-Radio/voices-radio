import { whyVoices } from "../content";

export function WhyVoices() {
  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-voices-purple md:text-sm">
          Why Voices
        </p>
        <h2 className="text-2xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
          Built inside a working music community.
        </h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 md:mt-14">
        {whyVoices.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
          >
            <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
