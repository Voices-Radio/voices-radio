import { getPodcast } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";
import { JsonLd } from "../components/json-ld";
import SpriteSheet from "../components/sprite-sheet";
import ChatbotWidget from "./chatbot-widget";

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
    url: "https://voicesradio.co.uk/podcast",
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
    ...(podcast?.openingHours?.length && { openingHours: podcast.openingHours }),
    ...(podcast?.priceRange && { priceRange: podcast.priceRange }),
    areaServed: "London",
  };

  const serviceJsonLd = podcast?.studioServices?.length
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

  const faqJsonLd =
    podcast?.faq?.length
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

  return (
    <>
      <JsonLd data={localBusiness} />
      {serviceJsonLd?.map((svc, i) => <JsonLd key={i} data={svc} />)}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {children}

      <SpriteSheet />

      {/* Global chatbot management */}
      <ChatbotWidget />
    </>
  );
}
