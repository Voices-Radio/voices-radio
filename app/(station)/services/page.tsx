import { getServices } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Services",
  openGraph: { title: "Services" },
  twitter: { title: "Services" },
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="bg-voices-beige">
      {/* Section 0 */}
      <section className="relative">
        {/* Hero Image */}
        <div className="relative aspect-[4/3] md:aspect-[4/2] ">
          <Image
            alt=""
            blurDataURL={services.hero_image.lqip}
            className="object-cover object-bottom"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            sizes="100vw"
            src={urlForImage(services.hero_image).url()}
          />
        </div>

  {/* Content Section */}
  <section className="bg-voices-beige px-6 py-8 md:px-8 md:py-12" id="button-section">
    <div className="mx-auto max-w-5xl space-y-8 md:space-y-5 text-center">
      {/* Header */}
      <h2 className="font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
        {services.services_heading}
      </h2>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-6 py-4">
        <a href="#section1">
          <div className="cursor-pointer whitespace-nowrap rounded-full bg-black text-white px-6 py-3 text-center">
            {services.services_heading1}
          </div>
        </a>
        <a href="#section2">
          <div className="cursor-pointer whitespace-nowrap rounded-full bg-black text-white px-6 py-3 text-center">
            {services.services_heading2}
          </div>
        </a>
        <a href="#section3">
          <div className="cursor-pointer whitespace-nowrap rounded-full bg-black text-white px-6 py-3 text-center">
            {services.services_heading3}
          </div>
        </a>
        <a href="#section4">
          <div className="cursor-pointer whitespace-nowrap rounded-full bg-black text-white px-6 py-3 text-center">
            {services.services_heading4}
          </div>
        </a>
      </div>
    </div>
  </section>
</section>



      <section
        id="section1"
        className="flex flex-col md:flex-row py-8 items-center gap-8"
      >
        {/* Image */}
        <div className="relative w-full md:w-1/2 h-[40vh] md:h-[60vh]">
          <Image
            alt="Service 1 Image"
            blurDataURL={services.services_main1_image?.lqip}
            style={{ objectPosition: '50% 20%' }}
            className="object-cover object-center rounded-lg shadow-md"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            src={urlForImage(services.services_main1_image).url()}
          />
        </div>

        {/* Text */}
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10 px-6 md:w-1/2">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {services.services_heading1}
          </h2>
          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={services.services_main1} />
          </div>
        </div>
      </section>

      <section
        id="section2"
        className="flex flex-col md:flex-row-reverse py-8 items-center gap-8"
      >
        {/* Image */}
        <div className="relative w-full md:w-1/2 h-[40vh] md:h-[60vh]">
          <Image
            alt="Service 2 Image"
            blurDataURL={services.services_main2_image?.lqip}
            style={{ objectPosition: '50% 20%' }}
            className="object-cover object-center rounded-lg shadow-md"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            src={urlForImage(services.services_main2_image).url()}
          />
        </div>

        {/* Text */}
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10 px-6 md:w-1/2">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {services.services_heading2}
          </h2>
          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={services.services_main2} />
          </div>
        </div>
      </section>

      <section
        id="section3"
        className="flex flex-col md:flex-row py-8 items-center gap-8"
      >
        {/* Image */}
        <div className="relative w-full md:w-1/2 h-[40vh] md:h-[60vh]">
          <Image
            alt="Service 3 Image"
            blurDataURL={services.services_main3_image?.lqip}
            style={{ objectPosition: '50% 20%' }}
            className="object-cover object-center rounded-lg shadow-md"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            src={urlForImage(services.services_main3_image).url()}
          />
        </div>

        {/* Text */}
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10 px-6 md:w-1/2">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {services.services_heading3}
          </h2>
          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={services.services_main3} />
          </div>
        </div>
      </section>

      <section
        id="section4"
        className="flex flex-col md:flex-row-reverse py-8 items-center gap-8"
      >
        {/* Image */}
        <div className="relative w-full md:w-1/2 h-[40vh] md:h-[60vh]">
          <Image
            alt="Service 4 Image"
            blurDataURL={services.services_main4_image?.lqip}
            className="object-cover object-center rounded-lg shadow-md"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            src={urlForImage(services.services_main4_image).url()}
          />
        </div>

        {/* Text */}
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-10 px-6 md:w-1/2">
          <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
            {services.services_heading4}
          </h2>
          <div className="space-y-4 text-mobile-inter-text md:text-inter-text">
            <PortableText value={services.services_main4} />
          </div>
        </div>
      </section>


      {/* Final Section: Full Width Image */}
      <section id="section5" className="relative w-full min-h-[70vh] py-32">
        <div className="absolute inset-0">
          <Image
            alt="Final Image"
            blurDataURL={services.services_final_image.lqip}
            className="object-cover"
            draggable={false}
            fill
            placeholder="blur"
            priority
            quality={85}
            src={urlForImage(services.services_final_image).url()}
          />
        </div>
      </section>
    </main>
  );
}