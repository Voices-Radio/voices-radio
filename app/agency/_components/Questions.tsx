import { faq } from "../content";

export function Questions() {
  return (
    <section
      id="questions"
      className="bg-white px-4 py-12 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-black leading-tight text-slate-900 sm:text-4xl md:mb-14 md:text-5xl">
          Questions
        </h2>

        <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-slate-50">
          {faq.map((item) => (
            <details key={item.question} className="group p-5 md:p-6">
              <summary className="cursor-pointer list-none text-base font-black text-slate-900 md:text-lg [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-voices-purple transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
