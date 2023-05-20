import { getSettings } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import type { Metadata } from "next";
import PartnersSection from "./partners";
import { Suspense } from "react";
import NowPlaying from "@/components/now-playing";
import Schedule from "@/components/schedule";

export const runtime = "edge";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { title, description, ogImage } = await getSettings();

  const imageUrl = urlForImage(ogImage).width(1200).height(627).url();

  return {
    title,
    description,
    openGraph: {
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

export default async function Home() {
  return (
    <main>
      <section>
        <Suspense fallback={<p>Loading Now Playing...</p>}>
          {/* @ts-ignore */}
          <NowPlaying />
        </Suspense>
      </section>

      <section>
        <Suspense fallback={<p>Loading Schedule...</p>}>
          {/* @ts-ignore */}
          <Schedule />
        </Suspense>
      </section>

      {/* @ts-ignore */}
      <PartnersSection />
    </main>
  );
}
