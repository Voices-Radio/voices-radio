import { getHome } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import Image from "next/image";

export default async function ApplySection() {
  const home = await getHome();

  return (
    <section className="relative z-auto overflow-hidden px-8 py-40">
      <Image
        alt=""
        blurDataURL={home.apply_background.lqip}
        className="object-cover"
        draggable={false}
        fill
        placeholder="blur"
        quality={1}
        sizes="100vw"
        src={urlForImage(home.apply_background).url()}
      />

      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative flex flex-col items-center gap-8 px-6 text-white">
        <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase md:text-kinfolk-headline">
          {home.apply_heading}
        </h2>

        <p className="max-w-2xl text-center text-mobile-inter-text md:text-inter-text">
          {home.apply_subheading}
        </p>

        <a
          href={home.apply_cta_url}
          className="whitespace-nowrap rounded-full bg-transparent px-20 py-[1.125rem] text-mobile-inter-text text-white ring-4 ring-inset ring-white md:text-inter-text"
          target="_blank"
          rel="noopener"
        >
          {home.apply_cta_text}
        </a>
      </div>

      <div className="pointer-events-none absolute -bottom-0.5 left-0 right-0 max-w-none">
        <svg
          className="text-voices-gray xl:h-[9.375rem] xl:w-full"
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href="#wave-top" fill="currentColor" />
        </svg>
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
  );
}
