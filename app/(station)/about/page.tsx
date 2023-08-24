import Carousel from "@/components/carousel";
import ScrollAfforance from "@/components/scroll-affordance";
import { getAbout } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const runtime = "edge";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "About",
  openGraph: { title: "About" },
  twitter: { title: "About" },
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <main>
      <section className="relative aspect-[4/3] md:aspect-[16/8]">
        <Image
          alt=""
          blurDataURL={about.hero_image.lqip}
          className="object-cover object-bottom"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(about.hero_image).url()}
        />

        <ScrollAfforance target="#how-we-got-here" />
      </section>

      <section
        className="relative overflow-hidden bg-voices-beige px-6 pb-12 pt-6 md:px-8 md:py-28"
        id="how-we-got-here"
      >
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
          <h2 className="font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline text-center">
            {about.got_here_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={about.got_here} />
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/3] md:aspect-[16/8]">
        <Image
          alt=""
          blurDataURL={about.community_image.lqip}
          className="object-cover object-bottom"
          draggable={false}
          fill
          placeholder="blur"
          quality={85}
          sizes="100vw"
          src={urlForImage(about.community_image).url()}
        />
      </section>

      <section className="relative overflow-hidden bg-voices-beige px-6 pb-12 pt-6 md:px-8 md:py-28">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
          <h2 className="font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline text-center">
            {about.our_values_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={about.our_values} />
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/3] md:aspect-[16/8]">
        <Image
          alt=""
          blurDataURL={about.hero_image.lqip}
          className="object-cover object-bottom"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(about.hero_image).url()}
        />
      </section>

      <section className="relative overflow-hidden bg-voices-beige px-6 pb-12 pt-6 md:px-8 md:py-28">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
          <h2 className="font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline text-center">
            {about.community_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={about.community} />
          </div>
        </div>
      </section>
    </main>
  );
}
