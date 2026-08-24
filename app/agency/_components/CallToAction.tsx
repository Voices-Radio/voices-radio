import { ArrowRight, ClipboardList } from "lucide-react";
import { briefHref } from "../content";

export function CallToAction() {
  return (
    <section
      id="brief"
      className="bg-white px-4 py-12 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center shadow-lg md:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-voices-purple/10 text-voices-purple">
          <ClipboardList className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 md:text-5xl">
          Tell us what you&rsquo;re programming.
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
          Tell us what you&rsquo;re working with and we&rsquo;ll come back with
          an approach.
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
          Useful to include: the space and its capacity, the audience, the dates
          or frequency, the atmosphere you&rsquo;re after, your budget range,
          and anything you need on production or content.
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-black text-slate-900">
          We reply to every brief within two working days.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={briefHref}
            className="min-h-12 inline-flex w-full items-center justify-center gap-2 rounded-full bg-voices-purple px-8 py-4 text-base font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-voices-purple focus:ring-offset-2 focus:ring-offset-white sm:w-auto"
          >
            Start your brief
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="mailto:bookings@voicesradio.co.uk"
            className="min-h-12 inline-flex w-full items-center justify-center gap-2 break-all rounded-full border-2 border-slate-900 px-6 py-4 text-sm font-black text-slate-900 transition hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white sm:w-auto sm:px-8 sm:text-base"
          >
            bookings@voicesradio.co.uk
          </a>
        </div>
      </div>
    </section>
  );
}
