import { getAbout } from "@/sanity.client";
import { Metadata } from "next";
import Image from "next/image";
import ApplySection from "../apply";
import PartnersSection from "../partners";
import Carousel from "@/components/carousel";
import Link from "next/link";
import ScrollAfforance from "@/components/scroll-affordance";

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
          className="object-cover"
          draggable={false}
          fill
          priority
          src="/brutalism.jpeg"
        />

        <ScrollAfforance target="#about-us" />
      </section>

      <section
        className="relative overflow-hidden bg-voices-beige px-6 pb-12 pt-6 md:px-8 md:py-28"
        id="about-us"
      >
        <div className="mx-auto mb-16 flex max-w-[90rem] flex-col items-center gap-8 lg:flex-row-reverse">
          <div className="flex-1">
            <Carousel images={about.carousel} />
          </div>

          <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
            <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
              {about.heading}
            </h2>

            <p className="max-w-lg text-center text-mobile-inter-text md:text-inter-text">
              {about.subheading}
            </p>

            {about.cta_url && about.cta_text && (
              <Link
                className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
                href={about.cta_url}
              >
                {about.cta_text}
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-8 lg:flex-row">
          <div className="flex-1">
            <Carousel images={about.carousel_2} classNames="-scale-x-100" />
          </div>

          <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
            <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
              {about.heading_2}
            </h2>

            <p className="max-w-lg text-center text-mobile-inter-text md:text-inter-text">
              {about.subheading_2}
            </p>

            {about.cta_url_2 && about.cta_text_2 && (
              <Link
                className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
                href={about.cta_url_2}
              >
                {about.cta_text_2}
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto mb-16 flex max-w-[90rem] flex-col items-center gap-8 lg:flex-row-reverse">
          <div className="flex-1">
            <Carousel images={about.carousel_3} />
          </div>

          <div className="flex flex-1 flex-col items-center gap-8 md:gap-10">
            <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
              {about.heading_3}
            </h2>

            <p className="max-w-lg text-center text-mobile-inter-text md:text-inter-text">
              {about.subheading_3}
            </p>

            {about.cta_url_3 && about.cta_text_3 && (
              <Link
                className="rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-black ring-4 ring-inset ring-black md:text-inter-text"
                href={about.cta_url_3}
              >
                {about.cta_text_3}
              </Link>
            )}
          </div>
        </div>
      </section>

      <ApplySection />

      <PartnersSection />
    </main>
  );
}
