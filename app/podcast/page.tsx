import type { Metadata } from "next";
import { getLocationPageSlugs, getPodcast } from "@/sanity.client";
import { getBaseUrl } from "@/lib/site-url";
import { resolveFaq } from "@/lib/podcast-studio-facts";
import { JsonLd } from "../components/json-ld";
import PodcastPageClient from "./podcast-page-client";

/**
 * Server wrapper around the client page so that /podcast can declare its
 * own canonical. The canonical used to live on app/podcast/layout.tsx, where
 * it was silently inherited by /podcast/blog and every post beneath it.
 *
 * Title, description and Open Graph still come from the layout's
 * generateMetadata, which reads them from Sanity. FAQ and breadcrumb JSON-LD
 * live here (not in the layout) so they only appear alongside the visible FAQ.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/podcast" },
};

export const revalidate = 3600;

export default async function PodcastPage() {
  const [podcast, locationRows] = await Promise.all([
    getPodcast(),
    getLocationPageSlugs().catch(() => []),
  ]);

  const baseUrl = getBaseUrl();
  const faq = resolveFaq(podcast);
  const locationLinks = locationRows.map(({ slug }) => ({
    href: `/podcast-studio/${slug}`,
    label: `Podcast studio in ${slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")}`,
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Podcast Studio",
        item: `${baseUrl}/podcast`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <PodcastPageClient
        h1Override={podcast?.h1Override}
        heroImageAlt={podcast?.heroImageAlt}
        faq={faq}
        locationLinks={locationLinks}
      />
    </>
  );
}
