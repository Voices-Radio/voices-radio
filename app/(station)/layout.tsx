import { getSettings } from "@/sanity.client";
import { getBaseUrl } from "@/lib/site-url";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";
import RedesignShell from "./components/redesign/redesign-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const settings = await getSettings();

  // Fallback values when settings are not available
  const title = settings?.title || "Voices Radio";
  const description = settings?.description || "Community Radio in London";
  const ogImage = settings?.ogImage;

  const imageUrl = ogImage
    ? urlForImage(ogImage).width(1200).height(627).url()
    : "/voices.svg";

  return {
    metadataBase: new URL(baseUrl),
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: new URL(baseUrl),
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
  return <RedesignShell>{children}</RedesignShell>;
}
