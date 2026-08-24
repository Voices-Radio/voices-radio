import { briefHref } from "../content";

export function Footer() {
  return (
    <footer className="bg-slate-900 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-black">Voices Agency</p>
          <p className="mt-2 max-w-xl text-sm font-semibold text-slate-300">
            Music programming and talent curation for venues, brands and events.
            Operated through the Voices commercial platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-300 md:gap-4">
          <a
            href="#offer"
            className="inline-flex h-11 items-center px-2 transition hover:text-voices-purple"
          >
            Offer
          </a>
          <a
            href="#work"
            className="inline-flex h-11 items-center px-2 transition hover:text-voices-purple"
          >
            Work
          </a>
          <a
            href={briefHref}
            className="inline-flex h-11 items-center px-2 transition hover:text-voices-purple"
          >
            Start a brief
          </a>
        </div>
      </div>
    </footer>
  );
}
