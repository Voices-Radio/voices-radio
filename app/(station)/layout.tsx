import { getSettings } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";
import Navigation from "../components/navigation";
import Footer from "../components/navigation/footer";
import SpriteSheet from "../components/sprite-sheet";
import ChatbotWidget from "../podcast/chatbot-widget";

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

      <SpriteSheet />
      
      {/* Global chatbot management */}
      <ChatbotWidget />
    </>
  );
}
