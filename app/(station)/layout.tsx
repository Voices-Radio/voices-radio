import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { getSettings } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description, ogImage } = await getSettings();

  const imageUrl = urlForImage(ogImage).width(1200).height(627).url();

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

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />

      {children}

      <Footer />
    </>
  );
}
