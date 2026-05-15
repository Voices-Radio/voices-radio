import {
  getLocationPageBySlug,
  getLocationPageSlugs,
  getPodcast,
} from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/json-ld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getLocationPageSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getLocationPageBySlug(params.slug);
  if (!page) return {};

  const title = page.seoTitle ?? page.h1;
  const description =
    page.seoDescription ??
    `Book Voices Radio's professional podcast studio in ${page.localityName}. State-of-the-art recording and audio production available to hire.`;

  const ogImageUrl = page.ogImage
    ? urlForImage(page.ogImage).width(1200).height(627).url()
    : undefined;

  return {
    title,
    description,
    ...(page.keywords && { keywords: page.keywords.join(", ") }),
    alternates: { canonical: `/podcast-studio/${params.slug}` },
    openGraph: {
      title,
      description,
      ...(ogImageUrl && {
        images: [{ url: ogImageUrl, width: 1200, height: 627 }],
      }),
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: { slug: string };
}) {
  const [page, podcast] = await Promise.all([
    getLocationPageBySlug(params.slug),
    getPodcast(),
  ]);

  if (!page) notFound();

  // ── JSON-LD: LocalBusiness ─────────────────────────────────────────────
  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RecordingStudio",
    name: "Voices Radio Podcast Studio",
    description:
      page.seoDescription ??
      `Professional podcast studio for hire in ${page.localityName}.`,
    url: `https://voicesradio.co.uk/podcast-studio/${params.slug}`,
    ...(podcast?.phone && { telephone: podcast.phone }),
    address: {
      "@type": "PostalAddress",
      ...(podcast?.streetAddress && { streetAddress: podcast.streetAddress }),
      addressLocality: podcast?.locality ?? "London",
      ...(podcast?.postalCode && { postalCode: podcast.postalCode }),
      addressCountry: "GB",
    },
    ...(podcast?.geoLat &&
      podcast?.geoLng && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: podcast.geoLat,
          longitude: podcast.geoLng,
        },
      }),
    ...(podcast?.openingHours?.length && {
      openingHours: podcast.openingHours,
    }),
    ...(podcast?.priceRange && { priceRange: podcast.priceRange }),
    areaServed: page.localityName,
  };

  // ── JSON-LD: FAQPage ───────────────────────────────────────────────────
  const faqJsonLd = page.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  // ── JSON-LD: BreadcrumbList ────────────────────────────────────────────
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://voicesradio.co.uk",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Podcast Studio",
        item: "https://voicesradio.co.uk/podcast",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.h1,
        item: `https://voicesradio.co.uk/podcast-studio/${params.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={localBusiness} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <main>
        {/* Hero / H1 */}
        <section className="relative overflow-hidden bg-voices-beige px-6 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
            <h1 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
              {page.h1}
            </h1>

            {page.intro && (
              <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
                <PortableText value={page.intro} />
              </div>
            )}

            {page.ctaText && page.ctaUrl && (
              <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
                <Link
                  className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
                  href={page.ctaUrl}
                >
                  {page.ctaText}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Body */}
        {page.body && (
          <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
            <div className="mx-auto max-w-5xl space-y-4 text-mobile-inter-text md:text-inter-text">
              <PortableText value={page.body} />
            </div>
          </section>
        )}

        {/* FAQ */}
        {page.faq && page.faq.length > 0 && (
          <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
              <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
                Frequently Asked Questions
              </h2>

              <dl className="space-y-6">
                {page.faq.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <dt className="text-mobile-inter-text font-semibold md:text-inter-text">
                      {item.question}
                    </dt>
                    <dd className="text-mobile-inter-text md:text-inter-text">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* Internal nav */}
        <section className="bg-voices-beige px-6 pb-12 md:px-8 md:pb-20">
          <div className="mx-auto max-w-5xl space-y-4 text-mobile-inter-text md:text-inter-text">
            <p>
              <Link className="underline underline-offset-2" href="/podcast">
                Learn more about the Voices Radio podcast studio
              </Link>{" "}
              or{" "}
              <Link className="underline underline-offset-2" href="/services">
                view all our services
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
