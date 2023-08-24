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

      <section className="z-auto relative overflow-hidden bg-voices-purple text-white px-8 py-40 pb-28">
        <div className="absolute inset-0 backdrop-blur-xl" />

        <div className="relative max-w-5xl mx-auto space-y-8 md:space-y-10">
          <h2 className="text-mobile-inter-text text-center">
            {about.bookings_heading}
          </h2>

          <div className="text-mobile-inter-text flex gap-4 justify-center flex-wrap">
            {about.bookings.map((booking) => (
              <span
                className="border-2 px-4 py-2 rounded-full border-current inline-block whitespace-nowrap"
                key={booking}
              >
                {booking}
              </span>
            ))}
          </div>
        </div>

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
          blurDataURL={about.community_image.lqip}
          className="object-cover object-center"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(about.community_image).url()}
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
