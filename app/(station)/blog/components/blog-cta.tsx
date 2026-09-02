import Link from "next/link";

/**
 * The closing band on both blog surfaces.
 *
 * Replaces two `from-voices-red to-red-600` gradient sections. Red is the
 * station's on-air colour — spending it on a marketing panel devalues the
 * one place it has to mean something. This is the same bordered section the
 * /support page uses: one orange primary, one quiet secondary, nothing
 * competing.
 */
export default function BlogCta({
  heading = "Join the Voices community",
  body = "Back independent community radio in London, apply to host a show, or just tune in and find something you haven't heard before.",
  secondaryHref = "/blog",
  secondaryLabel = "More stories",
}: {
  heading?: string;
  body?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-t border-voicesNext-border">
      <div className="mx-auto max-w-[1120px] px-4 py-12 md:px-8 md:py-16">
        <h2 className="text-balance max-w-2xl font-outfit text-3xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-5xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-2xl font-gabarito text-base leading-relaxed text-voicesNext-cream/90 md:text-lg">
          {body}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support"
            className="inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            Support the station
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex h-12 items-center justify-center rounded-full border border-voicesNext-border px-6 font-gabarito text-base font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orangeText focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
