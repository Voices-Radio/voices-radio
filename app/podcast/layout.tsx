import { getPodcast } from "@/sanity.client";
import { getBaseUrl } from "@/lib/site-url";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";
import { JsonLd } from "../components/json-ld";
import SpriteSheet from "../components/sprite-sheet";
import {
  DEFAULT_PRICE_RANGE,
  STUDIO_ADDRESS,
  STUDIO_EMAIL,
  resolveServices,
} from "@/lib/podcast-studio-facts";

const DEFAULT_TITLE = "London Podcast Studio in Kings Cross";
const DEFAULT_DESCRIPTION =
  "Book Voices Radio's professional podcast studio in Kings Cross, London. State-of-the-art recording, live streaming, and audio production — available to hire in central London.";

export async function generateMetadata(): Promise<Metadata> {
  const podcast = await getPodcast();

  const title = podcast?.seoTitle ?? DEFAULT_TITLE;
  const description = podcast?.seoDescription ?? DEFAULT_DESCRIPTION;
  const ogImageUrl = podcast?.seoOgImage
    ? urlForImage(podcast.seoOgImage).width(1200).height(627).url()
    : undefined;

  return {
    title,
    description,
    ...(podcast?.seoKeywords && { keywords: podcast.seoKeywords.join(", ") }),
    // No `alternates.canonical` here on purpose - see app/layout.tsx. The
    // /podcast canonical lives on app/podcast/page.tsx.
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

export default async function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const podcast = await getPodcast();

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RecordingStudio",
    name: "Voices Radio Podcast Studio",
    description: podcast?.seoDescription ?? DEFAULT_DESCRIPTION,
    url: `${getBaseUrl()}/podcast`,
    email: STUDIO_EMAIL,
    ...(podcast?.phone && { telephone: podcast.phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: podcast?.streetAddress ?? STUDIO_ADDRESS.streetAddress,
      addressLocality: podcast?.locality ?? STUDIO_ADDRESS.locality,
      postalCode: podcast?.postalCode ?? STUDIO_ADDRESS.postalCode,
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
    ...(podcast?.openingHours?.length && { openingHours: podcast.openingHours }),
    priceRange: podcast?.priceRange ?? DEFAULT_PRICE_RANGE,
    areaServed: "London",
  };

  const serviceJsonLd = resolveServices(podcast).map((svc) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.name,
    ...(svc.description && { description: svc.description }),
    provider: { "@type": "RecordingStudio", name: "Voices Radio Podcast Studio" },
    areaServed: "London",
    ...(svc.priceFrom && {
      offers: {
        "@type": "Offer",
        price: svc.priceFrom.replace(/[^\d.]/g, ""),
        priceCurrency: "GBP",
      },
    }),
  }));

  return (
    <>
      <JsonLd data={localBusiness} />
      {serviceJsonLd.map((svc, i) => (
        <JsonLd key={i} data={svc} />
      ))}

      {children}

      <SpriteSheet />
    </>
  );
}
