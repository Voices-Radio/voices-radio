"use client";

import { getBookingNames } from "./about-content";
import styles from "./about-story.module.css";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import type { Image as SanityImage, PortableTextBlock } from "sanity";
import type { About } from "@/sanity.queries";

type AboutImage = SanityImage & { lqip: string };

export interface AboutStoryProps {
  about: About;
}

interface ChapterProps {
  children: ReactNode;
  heading: string;
  image: AboutImage;
  imagePosition: string;
  imageSide?: "left" | "right";
}

function StoryCopy({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="space-y-5 font-gabarito text-lg leading-[1.42] text-voicesNext-cream md:text-2xl md:leading-[1.36] [&_a]:text-voicesNext-orangeText [&_a]:underline [&_a]:decoration-voicesNext-orange [&_a]:underline-offset-4 [&_p]:max-w-[42rem] [&_strong]:font-bold">
      <PortableText value={value} />
    </div>
  );
}

function IntroChapter({
  heading,
  value,
}: {
  heading: string;
  value: PortableTextBlock[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contentY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : [72, 0, -18],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.24, 0.72, 1],
    reducedMotion ? [1, 1, 1, 1] : [0.38, 1, 1, 0.9],
  );

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-36"
    >
      <motion.div
        className="max-w-4xl border-l border-voicesNext-orange pl-5 md:pl-8"
        style={{ opacity, y: contentY }}
      >
        <p className="font-asap text-xs font-bold uppercase tracking-[0.18em] text-voicesNext-orangeText md:text-sm">
          Since 2021
        </p>
        <h2 className="mt-4 max-w-[11ch] font-outfit text-4xl font-black uppercase leading-[0.9] text-voicesNext-cream md:text-6xl lg:text-7xl">
          {heading}
        </h2>
        <div className="mt-8 max-w-3xl">
          <StoryCopy value={value} />
        </div>
      </motion.div>
    </section>
  );
}

function Chapter({
  children,
  heading,
  image,
  imagePosition,
  imageSide = "right",
}: ChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contentY = useTransform(
    scrollYProgress,
    [0, 0.46, 1],
    reducedMotion ? [0, 0, 0] : [72, 0, -18],
  );
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.24, 0.72, 1],
    reducedMotion ? [1, 1, 1, 1] : [0.38, 1, 1, 0.9],
  );
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [38, -38],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [1, 1, 1] : [1.08, 1.02, 1.06],
  );

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-20 md:grid-cols-2 md:items-center md:gap-16 md:px-8 md:py-36"
    >
      <motion.div
        className={imageSide === "left" ? "md:order-2" : ""}
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <p className="mb-4 font-asap text-xs font-bold uppercase tracking-[0.18em] text-voicesNext-orangeText md:text-sm">
          Voices Radio
        </p>
        <h2 className="max-w-[14ch] font-outfit text-4xl font-black uppercase leading-[0.9] text-voicesNext-cream md:text-6xl lg:text-7xl">
          {heading}
        </h2>
        <div className="mt-8">{children}</div>
      </motion.div>

      <div
        className={`${styles.photoFrame} relative aspect-[4/5] overflow-hidden bg-voicesNext-surface md:aspect-[4/5] ${
          imageSide === "left" ? "md:order-1" : ""
        }`}
      >
        <motion.div
          className="absolute -inset-y-[12%] inset-x-0"
          style={{ scale: imageScale, y: imageY }}
        >
          <Image
            alt=""
            blurDataURL={image.lqip}
            className={`object-cover ${imagePosition}`}
            draggable={false}
            fill
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            src={urlForImage(image).url()}
          />
        </motion.div>
      </div>
    </section>
  );
}

function BookingChapter({
  heading,
  image,
  bookings,
}: {
  heading: string;
  image: AboutImage;
  bookings: PortableTextBlock[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const fieldY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : [64, 0, -22],
  );
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [48, -48],
  );
  const names = getBookingNames(bookings);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-36"
    >
      <div
        className={`${styles.photoFrame} relative overflow-hidden bg-voicesNext-surface px-5 py-16 md:px-12 md:py-24`}
      >
        <motion.div
          className="absolute -inset-y-[14%] inset-x-0"
          style={{ y: imageY }}
        >
          <Image
            alt=""
            blurDataURL={image.lqip}
            className="object-cover"
            draggable={false}
            fill
            placeholder="blur"
            sizes="100vw"
            src={urlForImage(image).url()}
          />
        </motion.div>
        <div
          aria-hidden="true"
          className={`${styles.bookingImageOverlay} absolute inset-0`}
        />

        <motion.div
          className="relative mx-auto max-w-6xl"
          style={{ y: fieldY }}
        >
          <p className="font-asap text-xs font-bold uppercase tracking-[0.18em] text-voicesNext-orangeText md:text-sm">
            A shared history
          </p>
          <h2 className="mt-4 max-w-[16ch] font-outfit text-4xl font-black uppercase leading-[0.9] text-voicesNext-cream md:text-6xl lg:text-7xl">
            {heading}
          </h2>
          <ul className="mt-10 columns-2 gap-x-4 font-gabarito text-base font-bold leading-tight text-voicesNext-cream sm:columns-3 md:mt-14 md:columns-4 md:gap-x-8 md:text-xl lg:columns-5">
            {names.map((name, index) => (
              <li
                className="mb-3 break-inside-avoid border-b border-voicesNext-cream/25 pb-2 md:mb-4 md:pb-3"
                key={`${name}-${index}`}
              >
                {name}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function Sun({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const reducedMotion = useReducedMotion();
  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["34vh", "7vh", "-11vh"],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0.78, 0.78, 0.78] : [0.72, 0.92, 1.08],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0.15, 0.15, 0.15] : [0.12, 0.22, 0.34],
  );

  return (
    <div aria-hidden="true" className={styles.sunStage}>
      <div className={styles.sunSticky}>
        <div className={styles.sunPosition}>
          <motion.div
            className={styles.sun}
            style={{
              opacity: reducedMotion ? 0.15 : opacity,
              scale: reducedMotion ? 0.78 : scale,
              y: reducedMotion ? 0 : y,
            }}
            data-testid="about-sun"
          >
            <span className={styles.sunRing} />
            <span className={styles.sunRingInner} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AboutStory({ about }: AboutStoryProps) {
  const pageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const heroImageY = useTransform(
    scrollYProgress,
    [0, 0.18],
    reducedMotion ? [0, 0] : [0, -72],
  );
  const heroCopyY = useTransform(
    scrollYProgress,
    [0, 0.18],
    reducedMotion ? [0, 0] : [28, -20],
  );

  return (
    <main
      ref={pageRef}
      className={`${styles.story} relative scroll-mt-24 bg-voicesNext-background text-voicesNext-cream`}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      id="main-content"
    >
      <Sun scrollYProgress={scrollYProgress} />

      <section className="relative flex min-h-[calc(100svh-8rem)] items-end overflow-hidden border-b border-voicesNext-border md:min-h-[calc(100svh-9rem)]">
        <motion.div
          className="absolute -inset-y-16 inset-x-0"
          style={{ y: heroImageY }}
        >
          <Image
            alt=""
            blurDataURL={about.hero_image.lqip}
            className="object-cover object-bottom"
            draggable={false}
            fill
            placeholder="blur"
            priority
            sizes="100vw"
            src={urlForImage(about.hero_image).url()}
          />
        </motion.div>
        <div
          aria-hidden="true"
          className={`${styles.heroImageOverlay} absolute inset-0`}
        />
        <motion.div
          className="relative mx-auto w-full max-w-[1440px] px-4 pb-10 pt-36 md:px-8 md:pb-16"
          style={{ y: heroCopyY }}
        >
          <p className="font-asap text-xs font-bold uppercase tracking-[0.2em] text-voicesNext-cream/80 md:text-sm">
            London community radio
          </p>
          <h1 className="mt-4 max-w-[9ch] font-outfit text-6xl font-black uppercase leading-[0.82] tracking-[-0.055em] text-voicesNext-cream sm:text-7xl md:text-8xl lg:text-9xl">
            About Voices Radio
          </h1>
        </motion.div>
      </section>

      <IntroChapter heading={about.got_here_heading} value={about.got_here} />

      <BookingChapter
        bookings={about.bookings}
        heading={about.bookings_heading}
        image={about.bookings_image}
      />

      <Chapter
        heading={about.our_values_heading}
        image={about.our_values_image}
        imagePosition="object-center"
      >
        <StoryCopy value={about.our_values} />
      </Chapter>

      <Chapter
        heading={about.community_heading}
        image={about.community_image}
        imagePosition="object-top"
        imageSide="left"
      >
        <StoryCopy value={about.community} />
      </Chapter>
    </main>
  );
}
