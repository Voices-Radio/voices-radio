import { getAbout } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import is from "@sindresorhus/is";
import { Metadata } from "next";
import Image from "next/image";
import type { PortableTextSpan } from "sanity";
import ScrollAfforance from "../../components/scroll-affordance";

export const metadata: Metadata = {
  title: "About",
  openGraph: { title: "About" },
  twitter: { title: "About" },
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await getAbout();

  if (!about) {
    return (
      <main>
        <section className="relative aspect-[4/3] md:aspect-[4/2] bg-slate-800 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">About Voices Radio</h1>
            <p>Content loading...</p>
          </div>
        </section>
      </main>
    );
  }

  const bookings = about.bookings
    ?.flatMap((block) => block.children)
    .map((span) => (span as PortableTextSpan)?.text)
    .filter(is.string)
    .sort() || [];

  return (
    <main>
      <section className="relative aspect-[4/3] md:aspect-[4/2]">
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
        className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20"
        id="how-we-got-here"
      >
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {about.got_here_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={about.got_here} />
          </div>
        </div>
      </section>

      <section className=",md:pb-28 relative z-auto overflow-hidden bg-voices-purple px-8 py-20 text-white md:py-40">
        <Image
          alt=""
          blurDataURL={about.bookings_image.lqip}
          className="object-cover"
          draggable={false}
          fill
          placeholder="blur"
          quality={1}
          sizes="100vw"
          src={urlForImage(about.bookings_image).url()}
        />

        <div className="absolute inset-0 backdrop-blur-xl" />

        <div className="relative mx-auto max-w-5xl space-y-8 md:space-y-10">
          <h2 className="text-center text-mobile-inter-text">
            {about.bookings_heading}
          </h2>

          <div className="flex flex-wrap justify-center gap-1.5 text-mobile-inter-small md:gap-2.5 md:text-mobile-inter-text">
            {bookings.map((booking) => (
              <span
                className="inline-block whitespace-nowrap rounded-full border border-current px-2 py-0.5 md:border-2 md:px-4 md:py-1.5"
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

      <section className="relative overflow-hidden bg-voices-beige px-6 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {about.our_values_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={about.our_values} />
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/3] md:aspect-[4/2]">
        <Image
          alt=""
          blurDataURL={about.our_values_image.lqip}
          className="object-cover object-center"
          draggable={false}
          fill
          placeholder="blur"
          priority
          quality={85}
          sizes="100vw"
          src={urlForImage(about.our_values_image).url()}
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
            {about.community_heading}
          </h2>

          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={about.community} />
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/3] md:aspect-[4/2]">
        <Image
          alt=""
          blurDataURL={about.community_image.lqip}
          className="object-cover object-top"
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
    </main>
  );
}
