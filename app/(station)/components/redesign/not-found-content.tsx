import Link from "next/link";

export default function NotFoundContent() {
  return (
    <main
      id="main-content"
      className="min-h-[60vh] scroll-mt-24 bg-voicesNext-background"
    >
      <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
        <p className="font-asap text-sm font-bold uppercase text-voicesNext-orange">
          404
        </p>
        <h1 className="mt-4 font-outfit text-5xl font-black uppercase text-voicesNext-cream">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl font-gabarito text-voicesNext-secondary">
          That show, artist or page isn&apos;t here — it may have moved or been
          removed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-voicesNext-orange px-5 py-3 font-asap text-sm font-bold uppercase text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream"
          >
            Explore shows
          </Link>
          <Link
            href="/"
            className="rounded-full border border-voicesNext-cream px-5 py-3 font-asap text-sm font-bold uppercase text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
