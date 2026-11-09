"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[60vh] bg-voicesNext-background">
      <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
        <p className="font-asap text-sm font-bold uppercase text-voicesNext-orange">
          Something went wrong
        </p>
        <h1 className="mt-4 font-outfit text-5xl font-black uppercase text-voicesNext-cream">
          Could not load this page
        </h1>
        {/* Never render error.message: server errors can carry internals. */}
        <p className="mt-4 max-w-xl font-gabarito text-voicesNext-secondary">
          Something on our side didn&apos;t load. Try again, or head back to
          the homepage.
          {error.digest && (
            <span className="mt-2 block text-sm opacity-70">
              Reference: {error.digest}
            </span>
          )}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-voicesNext-orange px-5 py-3 font-asap text-sm font-bold uppercase text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream"
          >
            Retry
          </button>
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
