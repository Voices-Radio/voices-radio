"use client";

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
        <p className="mt-4 max-w-xl font-gabarito text-voicesNext-secondary">
          {error.message || "The page failed to load."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-voicesNext-orange px-5 py-3 font-asap text-sm font-bold uppercase text-voicesNext-background"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
