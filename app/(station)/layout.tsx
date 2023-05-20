import NowPlaying from "@/components/now-playing";
import { getSettings } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { Metadata } from "next";
import Link from "next/link";

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
      title,
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
  };
}

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="p-8">
        <nav className="flex gap-4 justify-between">
          {/* @ts-ignore */}
          <NowPlaying />

          <div className="flex gap-4">
            <Link href="/">Home</Link>

            <Link href="/about">About</Link>
          </div>
        </nav>
      </header>

      {children}
    </div>
  );
}
