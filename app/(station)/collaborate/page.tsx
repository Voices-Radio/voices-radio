import { getCollaboratePage, getSettings } from "@/sanity.client";
import { resolveCollaboratePage } from "@/lib/voices/page-copy";
import { VOICES_APPLY_FOR_SHOW_URL } from "@/lib/voices/config";
import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_FALLBACK_URL = "mailto:info@voicesradio.co.uk";

export async function generateMetadata(): Promise<Metadata> {
  const page = resolveCollaboratePage(await getCollaboratePage());

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    openGraph: {
      title: `${page.seoTitle} | Voices Radio`,
      description: page.seoDescription,
    },
    twitter: {
      title: `${page.seoTitle} | Voices Radio`,
      description: page.seoDescription,
    },
    alternates: { canonical: "/collaborate" },
  };
}

export default async function CollaboratePage() {
  const [settings, cmsPage] = await Promise.all([
    getSettings(),
    getCollaboratePage(),
  ]);
  const page = resolveCollaboratePage(cmsPage);
  const applyLink = settings?.apply_link || VOICES_APPLY_FOR_SHOW_URL;
  const contactLink = settings?.contact_link || CONTACT_FALLBACK_URL;

  return (
    <main id="main-content" className="scroll-mt-24">
      <section className="border-b border-voicesNext-border">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:px-8 md:py-20">
          <div>
            <p className="mb-4 font-asap text-sm font-bold uppercase text-voicesNext-orange">
              {page.eyebrow}
            </p>
            <h1 className="max-w-4xl font-outfit text-5xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-7xl">
              {page.heading}
            </h1>
            <p className="mt-6 max-w-2xl font-gabarito text-lg leading-relaxed text-voicesNext-cream">
              {page.intro}
            </p>
          </div>

          <div className="flex flex-col justify-end gap-3">
            <a
              href={applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center border border-voicesNext-orange bg-voicesNext-orange px-6 font-gabarito text-lg font-bold text-voicesNext-background transition-colors hover:bg-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
            >
              {page.applyCtaText}
            </a>
            <a
              href={contactLink}
              className="inline-flex h-14 items-center justify-center border border-voicesNext-cream px-6 font-gabarito text-lg font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
            >
              {page.contactCtaText}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-px border-b border-voicesNext-border bg-voicesNext-border px-4 py-px md:grid-cols-3 md:px-8">
        {page.cards.map((card) => (
          <article
            key={card.title}
            className="min-h-[220px] bg-voicesNext-background p-6 md:p-8"
          >
            <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream">
              {card.title}
            </h2>
            <p className="mt-4 font-gabarito text-base leading-relaxed text-voicesNext-secondary">
              {card.copy}
            </p>
            {card.href && (
              <Link
                href={card.href}
                className="mt-6 inline-flex font-gabarito text-sm font-bold uppercase text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
              >
                {card.linkLabel || card.title}
              </Link>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
