import { getSettings } from "@/sanity.client";
import { VOICES_APPLY_FOR_SHOW_URL } from "@/lib/voices/config";
import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_FALLBACK_URL = "mailto:info@voicesradio.co.uk";

export const metadata: Metadata = {
  title: "Partner with Us",
  description:
    "Partner with Voices Radio on programming, community projects, brand work, and show ideas.",
  openGraph: {
    title: "Partner with Us | Voices Radio",
    description:
      "Partner with Voices Radio on programming, community projects, brand work, and show ideas.",
  },
  twitter: {
    title: "Partner with Us | Voices Radio",
    description:
      "Partner with Voices Radio on programming, community projects, brand work, and show ideas.",
  },
  alternates: { canonical: "/collaborate" },
};

export default async function CollaboratePage() {
  const settings = await getSettings();
  const applyLink = VOICES_APPLY_FOR_SHOW_URL;
  const contactLink = settings?.contact_link || CONTACT_FALLBACK_URL;

  return (
    <main>
      <section className="border-b border-voicesNext-border">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:px-8 md:py-20">
          <div>
            <p className="mb-4 font-asap text-sm font-bold uppercase text-voicesNext-orange">
              Partner with Us
            </p>
            <h1 className="max-w-4xl font-outfit text-5xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-7xl">
              Build with Voices
            </h1>
            <p className="mt-6 max-w-2xl font-gabarito text-lg leading-relaxed text-voicesNext-cream">
              For partnerships, programming, community projects, and creative
              ideas, use this page to reach the right part of the Voices team.
            </p>
          </div>

          <div className="flex flex-col justify-end gap-3">
            <a
              href={applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center border border-voicesNext-orange bg-voicesNext-orange px-6 font-gabarito text-lg font-bold text-voicesNext-background transition-colors hover:bg-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            >
              Apply for a show
            </a>
            <a
              href={contactLink}
              className="inline-flex h-14 items-center justify-center border border-voicesNext-cream px-6 font-gabarito text-lg font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            >
              Start a partnership conversation
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-px border-b border-voicesNext-border bg-voicesNext-border px-4 py-px md:grid-cols-3 md:px-8">
        {[
          {
            title: "Programming",
            copy: "Apply to host a show or share a programme idea with the station team.",
          },
          {
            title: "Partnerships",
            copy: "Start a conversation about community projects, brand work, venue programming, or station collaborations.",
          },
          {
            title: "Studio",
            copy: "For podcast production and studio bookings, head to the Podcast Studio page.",
            href: "/podcast",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="min-h-[220px] bg-voicesNext-background p-6 md:p-8"
          >
            <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream">
              {item.title}
            </h2>
            <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-secondary">
              {item.copy}
            </p>
            {item.href && (
              <Link
                href={item.href}
                className="mt-6 inline-flex font-gabarito text-sm font-bold uppercase text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
              >
                Podcast Studio
              </Link>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
