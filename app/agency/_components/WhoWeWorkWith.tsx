import { whoWeWorkWith } from "../content";

export function WhoWeWorkWith() {
  return (
    <section
      id="who-we-work-with"
      className="bg-slate-50 px-4 py-12 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-black leading-tight text-slate-900 sm:text-4xl md:mb-14 md:text-5xl">
          Who we work with
        </h2>

        <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white shadow-sm">
          {whoWeWorkWith.map((item) => (
            <div key={item.title} className="p-6 md:p-8">
              <h3 className="text-lg font-black text-slate-900 md:text-xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
