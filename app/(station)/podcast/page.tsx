import { getPodcast } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "../../components/json-ld";
import ScrollAfforance from "../../components/scroll-affordance";

const DEFAULT_TITLE = "London Podcast Studio in Kings Cross";
const DEFAULT_DESCRIPTION =
  "Book Voices Radio's professional podcast studio in Kings Cross, London. State-of-the-art recording, live streaming, and audio production — available to hire in central London.";

export async function generateMetadata(): Promise<Metadata> {
  const podcast = await getPodcast();

  const title = podcast.seoTitle ?? DEFAULT_TITLE;
  const description = podcast.seoDescription ?? DEFAULT_DESCRIPTION;

  const ogImageUrl = podcast.seoOgImage
    ? urlForImage(podcast.seoOgImage).width(1200).height(627).url()
    : undefined;

  return {
    title,
    description,
    ...(podcast.seoKeywords && { keywords: podcast.seoKeywords.join(", ") }),
    alternates: { canonical: "/podcast" },
    openGraph: {
      title,
      description,
      ...(ogImageUrl && { images: [{ url: ogImageUrl, width: 1200, height: 627 }] }),
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function PodcastPage() {
  const podcast = await getPodcast();

  // ── JSON-LD: LocalBusiness ─────────────────────────────────────────────
  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RecordingStudio",
    name: "Voices Radio Podcast Studio",
    description: podcast.seoDescription ?? DEFAULT_DESCRIPTION,
    url: "https://voicesradio.co.uk/podcast",
    ...(podcast.phone && { telephone: podcast.phone }),
    address: {
      "@type": "PostalAddress",
      ...(podcast.streetAddress && { streetAddress: podcast.streetAddress }),
      addressLocality: podcast.locality ?? "London",
      ...(podcast.postalCode && { postalCode: podcast.postalCode }),
      addressCountry: "GB",
    },
    ...(podcast.geoLat &&
      podcast.geoLng && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: podcast.geoLat,
          longitude: podcast.geoLng,
        },
      }),
    ...(podcast.openingHours?.length && { openingHours: podcast.openingHours }),
    ...(podcast.priceRange && { priceRange: podcast.priceRange }),
    areaServed: "London",
  };

  // ── JSON-LD: Services ──────────────────────────────────────────────────
  const serviceJsonLd =
    podcast.studioServices?.length
      ? podcast.studioServices.map((svc) => ({
          "@context": "https://schema.org",
          "@type": "Service",
          name: svc.name,
          ...(svc.description && { description: svc.description }),
          provider: { "@type": "RecordingStudio", name: "Voices Radio Podcast Studio" },
          areaServed: "London",
          ...(svc.priceFrom && {
            offers: { "@type": "Offer", price: svc.priceFrom, priceCurrency: "GBP" },
          }),
        }))
      : null;

  // ── JSON-LD: FAQPage ───────────────────────────────────────────────────
  const faqJsonLd =
    podcast.faq?.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: podcast.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const heroAlt =
    podcast.heroImageAlt ?? "Voices Radio podcast studio in Kings Cross, London";

  return (
    <>
      <JsonLd data={localBusiness} />
      {serviceJsonLd?.map((svc, i) => <JsonLd key={i} data={svc} />)}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <main>
        <section className="relative aspect-[4/3] md:aspect-[4/2]">
          <Image
            alt={heroAlt}
            blurDataURL={podcast.hero_image.lqip}
            className="object-cover object-bottom"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            sizes="100vw"
            src={urlForImage(podcast.hero_image).url()}
          />

          <ScrollAfforance target="#how-we-got-here" />
        </section>

        <section
          className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20"
          id="how-we-got-here"
        >
          <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
            {podcast.h1Override ? (
              <>
                <h1 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
                  {podcast.h1Override}
                </h1>
                <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
                  {podcast.heading_podcast_intro}
                </h2>
              </>
            ) : (
              <h1 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
                {podcast.heading_podcast_intro}
              </h1>
            )}

            <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
              <PortableText value={podcast.podcast_intro_content} />
            </div>

            {podcast.podcast_cta_text && podcast.podcast_cta_url && (
              <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
                <Link
                  className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
                  href={podcast.podcast_cta_url}
                >
                  {podcast.podcast_cta_text}
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
            <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
              {podcast.podcast_main_heading}
            </h2>

            <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
              <PortableText value={podcast.podcast_main} />
            </div>
          </div>
        </section>

        <section className="relative aspect-[4/3] md:aspect-[4/2]">
          <Image
            alt="Inside the Voices Radio podcast studio"
            blurDataURL={podcast.podcast_main_image.lqip}
            className="object-cover object-center"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            sizes="100vw"
            src={urlForImage(podcast.podcast_main_image).url()}
          />

          <div className="pointer-events-none absolute -top-0.5 left-0 right-0 max-w-none">
            <svg
              className="rotate-180 text-voices-beige xl:h-[9.375rem] xl:w-full"
              viewBox="0 0 1440 150"
              preserveAspectRatio="none"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <use href="#wave-bottom" fill="currentColor" />
            </svg>
          </div>
        </section>

        <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
            <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
              {podcast.podcast_final_heading}
            </h2>

            <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
              <PortableText value={podcast.podcast_final} />
            </div>
          </div>
        </section>

        <section className="relative aspect-[4/3] md:aspect-[4/2]">
          <Image
            alt="Voices Radio podcast studio booking area, Kings Cross London"
            blurDataURL={podcast.podcast_final_image.lqip}
            className="object-cover object-top"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            sizes="100vw"
            src={urlForImage(podcast.podcast_final_image).url()}
          />

          <div className="pointer-events-none absolute -top-0.5 left-0 right-0 max-w-none">
            <svg
              className="rotate-180 text-voices-beige xl:h-[9.375rem] xl:w-full"
              viewBox="0 0 1440 150"
              preserveAspectRatio="none"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <use href="#wave-bottom" fill="currentColor" />
            </svg>
          </div>
        </section>

        {/* Internal links to location landing pages */}
        <section className="bg-voices-beige px-6 pb-12 md:px-8 md:pb-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-mobile-inter-text text-black md:text-inter-text">
              Looking for a{" "}
              <Link className="underline underline-offset-2" href="/podcast-studio/london">
                podcast studio in London
              </Link>
              ? Our{" "}
              <Link className="underline underline-offset-2" href="/podcast-studio/kings-cross">
                Kings Cross podcast studio
              </Link>{" "}
              is centrally located and easy to reach.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
