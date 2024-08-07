import { getPodcast } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import is from "@sindresorhus/is";
import { Metadata } from "next";
import Image from "next/image";
import type { PortableTextSpan } from "sanity";
import Link from "next/link";
import ScrollAfforance from "../../components/scroll-affordance";

export const metadata: Metadata = {
  title: "Podcast",
  openGraph: { title: "Podcast" },
  twitter: { title: "Podcast" },
  alternates: { canonical: "/podcast" },
};

export default async function PodcastPage() {
  const podcast = await getPodcast();
  
  return (
    <main>
      <section className="relative aspect-[4/3] md:aspect-[4/2]">
        <Image
          alt=""
          blurDataURL={podcast.hero_image.lqip}
          className="object-cover object-bottom"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(podcast.hero_image).url()}
        />

        <ScrollAfforance target="#how-we-got-here" />
      </section>

      <section
        className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20"
        id="how-we-got-here"
      >
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {podcast.heading_podcast_intro}
          </h2>

          <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
          {podcast.podcast_cta_text && podcast.podcast_cta_url && (
            <Link
              className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-red ring-4 ring-inset ring-red md:text-inter-text"
              href={podcast.podcast_cta_url}
            >
              {podcast.podcast_cta_text}
            </Link>
          )}
        </div>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={podcast.podcast_intro_content} />
          </div>

          <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
          {podcast.podcast_cta_text && podcast.podcast_cta_url && (
            <Link
              className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-blue ring-4 ring-inset ring-blue md:text-inter-text"
              href={podcast.podcast_cta_url}
            >
              {podcast.podcast_cta_text}
            </Link>
          )}
        </div>
        </div>
      </section>

      

      <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {podcast.podcast_main_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={podcast.podcast_main} />
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/3] md:aspect-[4/2]">
        <Image
          alt=""
          blurDataURL={podcast.podcast_main_image.lqip}
          className="object-cover object-center"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(podcast.podcast_main_image).url()}
        />

        <div className="pointer-events-none absolute -top-0.5 left-0 right-0 max-w-none">
          <svg
            className="rotate-180 text-voices-beige xl:h-[9.375rem] xl:w-full"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#wave-bottom" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {podcast.podcast_final_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={podcast.podcast_final} />
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/3] md:aspect-[4/2]">
        <Image
          alt=""
          blurDataURL={podcast.podcast_final_image.lqip}
          className="object-cover object-top"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(podcast.podcast_final_image).url()}
        />

        <div className="pointer-events-none absolute -top-0.5 left-0 right-0 max-w-none">
          <svg
            className="rotate-180 text-voices-beige xl:h-[9.375rem] xl:w-full"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#wave-bottom" fill="currentColor" />
          </svg>
        </div>
      </section>
    </main>
  );
}
