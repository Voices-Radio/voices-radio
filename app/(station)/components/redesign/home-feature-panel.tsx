"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { HomeFeatureItem } from "@/lib/voices/home";

const AUTO_SLIDE_DELAY_MS = 7000;

const fallbackItem: HomeFeatureItem = {
  id: "fallback",
  type: "show",
  label: "Show",
  title: "Jammin w/ Matt Odyssey",
  description: "",
  imageUrl: "/optimized/studio-5.jpg",
  imageAlt: "Voices Radio studio",
  imageFit: "cover",
  href: "/explore",
  cta: "Listen",
  meta: "18/06/26",
  show: {
    id: "fallback",
    title: "Jammin w/ Matt Odyssey",
    description: "",
    artwork: {
      alt: "Voices Radio studio",
      source: "fallback",
      src: "/optimized/studio-5.jpg",
    },
    featured: false,
    genres: ["Hip Hop", "Indie Rock", "Ambient"],
    locationTags: [],
    station: "unknown",
  },
};

function isExternalUrl(href: string) {
  return /^https?:\/\//.test(href);
}

function FeatureLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FeatureImage({
  item,
  priority,
}: {
  item: HomeFeatureItem;
  priority: boolean;
}) {
  if (item.imageFit === "contain") {
    return (
      <>
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1920px) 1920px, calc(100vw - 40px)"
          quality={85}
          priority={priority}
          className="scale-110 object-cover opacity-50 blur-2xl"
          style={{
            objectPosition: item.imagePosition ?? "50% 50%",
          }}
        />
        <div className="absolute inset-0 bg-voicesNext-background/35" />
        <Image
          src={item.imageUrl}
          alt={item.imageAlt}
          fill
          sizes="(min-width: 1920px) 1200px, calc(100vw - 40px)"
          quality={100}
          priority={priority}
          className="object-contain"
          style={{
            objectPosition: item.imagePosition ?? "50% 50%",
          }}
        />
      </>
    );
  }

  return (
    <Image
      src={item.imageUrl}
      alt={item.imageAlt}
      fill
      sizes="(min-width: 1920px) 1920px, calc(100vw - 40px)"
      quality={100}
      priority={priority}
      className="object-cover"
    />
  );
}

export default function HomeFeaturePanel({
  items,
}: {
  items: HomeFeatureItem[];
}) {
  const featureItems = useMemo(
    () => (items.length ? items : [fallbackItem]),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoSlideResetKey, setAutoSlideResetKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const item = featureItems[activeIndex] ?? featureItems[0];
  const genres =
    item.type === "show" && item.show.genres.length
      ? item.show.genres.slice(0, 3)
      : [item.label];
  const hasMultipleItems = featureItems.length > 1;

  function showPrevious() {
    setDirection(-1);
    setAutoSlideResetKey((resetKey) => resetKey + 1);
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + featureItems.length) % featureItems.length,
    );
  }

  function showNext() {
    setDirection(1);
    setAutoSlideResetKey((resetKey) => resetKey + 1);
    setActiveIndex((currentIndex) => (currentIndex + 1) % featureItems.length);
  }

  useEffect(() => {
    if (activeIndex < featureItems.length) return;

    setActiveIndex(0);
  }, [activeIndex, featureItems.length]);

  useEffect(() => {
    if (!hasMultipleItems) return;

    const interval = window.setInterval(() => {
      setDirection(1);
      setActiveIndex(
        (currentIndex) => (currentIndex + 1) % featureItems.length,
      );
    }, AUTO_SLIDE_DELAY_MS);

    return () => window.clearInterval(interval);
  }, [autoSlideResetKey, featureItems.length, hasMultipleItems]);

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-voicesNext-background md:h-[632px] md:min-h-0">
      <div className="absolute inset-x-5 top-5 h-[calc(100%-42px)] overflow-hidden border-2 border-voicesNext-cream md:h-[590px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={item.id}
            className="absolute inset-0"
            custom={direction}
            initial={{
              opacity: shouldReduceMotion ? 0 : 1,
              x: shouldReduceMotion ? 0 : `${direction * 100}%`,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: shouldReduceMotion ? 0 : 1,
              x: shouldReduceMotion ? 0 : `${direction * -100}%`,
            }}
            transition={{
              duration: shouldReduceMotion ? 0.18 : 0.58,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <FeatureImage item={item} priority={activeIndex === 0} />

            <div className="absolute right-0 top-0 flex flex-col items-end gap-[10px] font-outfit text-[14px] font-black uppercase leading-none tracking-[1px] text-voicesNext-background">
              <span className="bg-voicesNext-cream px-1 py-[2px]">Radio</span>
              <span className="bg-voicesNext-cream px-1 py-[2px]">London</span>
            </div>

            <div className="absolute bottom-0 left-0 w-full md:w-[620px]">
              <div className="relative grid min-h-[122px] grid-cols-[110px_minmax(0,1fr)] items-stretch text-voicesNext-cream md:min-h-[132px] md:grid-cols-[120px_minmax(0,1fr)]">
                <FeatureLink
                  href={item.href}
                  className="hover:bg-voicesNext-background/45 grid grid-rows-[38px_1fr] border-r-2 border-t-2 border-voicesNext-cream bg-voicesNext-background/25 font-outfit text-[18px] font-black uppercase leading-none tracking-[1px] transition-colors focus:outline-none focus:ring-2 focus:ring-voicesNext-cream md:text-[20px]"
                >
                  <span className="flex items-center justify-center">
                    {item.cta}
                  </span>
                  <span className="flex items-center justify-center self-stretch">
                    <Play aria-hidden="true" size={36} fill="currentColor" />
                  </span>
                </FeatureLink>

                <div className="min-w-0 px-4 py-[13px] [text-shadow:0_1px_8px_rgba(0,0,0,0.75)] md:px-5">
                  <h1 className="line-clamp-2 font-gabarito text-[25px] font-bold leading-none md:text-[30px]">
                    {item.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-[7px] font-asap text-[12px] font-bold uppercase leading-none">
                    {genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-voicesNext-cream px-2 py-1"
                      >
                        {genre}
                      </span>
                    ))}
                    <span className="text-[14px] font-normal">
                      {item.meta || item.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 right-5 hidden h-[22px] w-[70px] items-center justify-center gap-3 font-asap text-[12px] font-bold leading-none text-voicesNext-cream md:flex">
        <button
          type="button"
          className="inline-flex h-5 w-3 items-center justify-center transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-cream disabled:cursor-default disabled:text-voicesNext-cream/40"
          onClick={showPrevious}
          disabled={!hasMultipleItems}
          aria-label="Show previous featured post"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <span className="min-w-[24px] text-center">
          {activeIndex + 1}/{featureItems.length}
        </span>
        <button
          type="button"
          className="inline-flex h-5 w-3 items-center justify-center transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-cream disabled:cursor-default disabled:text-voicesNext-cream/40"
          onClick={showNext}
          disabled={!hasMultipleItems}
          aria-label="Show next featured post"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}
