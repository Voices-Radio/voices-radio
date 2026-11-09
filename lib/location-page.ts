import type { Metadata } from "next";
import type { LocationPage, Podcast } from "@/sanity.queries";
import {
  DEFAULT_PRICE_RANGE,
  STUDIO_ADDRESS,
  STUDIO_EMAIL,
} from "./podcast-studio-facts";

type JsonLdObject = Record<string, unknown>;

const OG_IMAGE_SIZE = { width: 1200, height: 627 } as const;

export function buildLocationMetadata(
  page: LocationPage,
  slug: string,
  ogImageUrl?: string,
): Metadata {
  const title = page.seoTitle ?? page.h1;
  const description =
    page.seoDescription ??
    `Book Voices Radio's professional podcast studio in ${page.localityName}. State-of-the-art recording and audio production available to hire.`;

  return {
    title,
    description,
    ...(page.keywords?.length && { keywords: page.keywords.join(", ") }),
    alternates: { canonical: `/podcast-studio/${slug}` },
    openGraph: {
      title,
      description,
      ...(ogImageUrl && { images: [{ url: ogImageUrl, ...OG_IMAGE_SIZE }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export function buildLocationJsonLd({
  page,
  podcast,
  baseUrl,
  slug,
}: {
  page: LocationPage;
  podcast: Podcast | null;
  baseUrl: string;
  slug: string;
}) {
  const url = `${baseUrl}/podcast-studio/${slug}`;

  const localBusiness: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "RecordingStudio",
    name: "Voices Radio Podcast Studio",
    description:
      page.seoDescription ??
      `Professional podcast studio for hire in ${page.localityName}.`,
    url,
    email: STUDIO_EMAIL,
    ...(podcast?.phone && { telephone: podcast.phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: podcast?.streetAddress ?? STUDIO_ADDRESS.streetAddress,
      addressLocality: podcast?.locality ?? STUDIO_ADDRESS.locality,
      postalCode: podcast?.postalCode ?? STUDIO_ADDRESS.postalCode,
      addressCountry: "GB",
    },
    ...(podcast?.geoLat != null &&
      podcast?.geoLng != null && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: podcast.geoLat,
          longitude: podcast.geoLng,
        },
      }),
    ...(podcast?.openingHours?.length && {
      openingHours: podcast.openingHours,
    }),
    priceRange: podcast?.priceRange ?? DEFAULT_PRICE_RANGE,
    areaServed: page.localityName,
  };

  const faq: JsonLdObject | null = page.faq?.length
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

  const breadcrumb: JsonLdObject = {
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
      { "@type": "ListItem", position: 3, name: page.h1, item: url },
    ],
  };

  return { localBusiness, faq, breadcrumb };
}
