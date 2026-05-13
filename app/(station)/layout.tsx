import { getSettings } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";
import { JsonLd } from "../components/json-ld";
import Navigation from "../components/navigation";
import Footer from "../components/navigation/footer";
import SpriteSheet from "../components/sprite-sheet";


export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  // Fallback values when settings are not available
  const title = settings?.title || "Voices Radio";
  const description = settings?.description || "Community Radio in London";
  const ogImage = settings?.ogImage;

  const imageUrl = ogImage ? urlForImage(ogImage).width(1200).height(627).url() : "/voices.svg";

  return {
    metadataBase: new URL("https://voicesradio.co.uk"),
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: new URL("https://voicesradio.co.uk"),
      title: { default: title, template: `%s | ${title}` },
      description,
      siteName: title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 627,
        },
      ],
    },
    twitter: {
      title: { default: title, template: `%s | ${title}` },
      description,
      images: [{ url: imageUrl, width: 1200, height: 627 }],
      card: "summary_large_image",
    },
  };
}

export default async function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  const sameAs = [
    settings.twitter_link,
    settings.instagram_link,
    settings.facebook_link,
    settings.linkedin_link,
    settings.mixcloud_link,
  ].filter(Boolean);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.title,
    url: "https://voicesradio.co.uk",
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <Navigation />

      {children}

      <Footer />

      <SpriteSheet />
    </>
  );
}
