"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { HomeFeatureItem } from "@/lib/voices/home";

const AUTO_SLIDE_DELAY_MS = 7000;
// Distance × velocity has to clear this before a drag release counts as an
// intentional swipe rather than an incidental nudge — framer-motion's own
// carousel recipe.
const SWIPE_CONFIDENCE_THRESHOLD = 8000;

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

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
        <div className="bg-voicesNext-background/35 absolute inset-0" />
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
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const item = featureItems[activeIndex] ?? featureItems[0];
  const stationLabel =
    item.type === "show" && item.show.station === "east" ? "EAST" : "KX";
  const locationLabel =
    item.type === "show" && item.show.locationTags.includes("world")
      ? "WORLD"
      : "LONDON";
  const genres =
    item.type === "show" && item.show.genres.length
      ? item.show.genres.slice(0, 3)
      : [item.label];
  const hasMultipleItems = featureItems.length > 1;
  // Reduced-motion users get a static slide (no forced motion); everyone
  // else can still pause explicitly, or implicitly by hovering/focusing
  // inside the carousel — matches "autoplay >5s needs pause/stop" guidance.
  // isDragging keeps a swipe in progress from racing the auto-advance timer:
  // the interval effect below simply can't fire mid-drag, so a user's swipe
  // always wins over an auto-slide that would have landed at the same time.
  const isAutoPlaying =
    hasMultipleItems &&
    !shouldReduceMotion &&
    !manuallyPaused &&
    !isHovering &&
    !isFocusWithin &&
    !isDragging;

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
    if (!isAutoPlaying) return;

    const interval = window.setInterval(() => {
      setDirection(1);
      setActiveIndex(
        (currentIndex) => (currentIndex + 1) % featureItems.length,
      );
    }, AUTO_SLIDE_DELAY_MS);

    return () => window.clearInterval(interval);
  }, [autoSlideResetKey, featureItems.length, isAutoPlaying]);

  return (
    <section
      className="relative h-[388px] overflow-hidden bg-voicesNext-background md:h-[632px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
    >
      <div className="absolute inset-x-1 top-0 h-[377px] overflow-hidden rounded-[4px] md:inset-x-0 md:h-[632px] md:rounded-none md:border-2 md:border-voicesNext-cream">
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
            drag={hasMultipleItems ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_event, info: PanInfo) => {
              setIsDragging(false);
              const swipe = swipePower(info.offset.x, info.velocity.x);
              if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
                showNext();
              } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
                showPrevious();
              }
            }}
          >
            <FeatureImage item={item} priority={activeIndex === 0} />

            <div className="absolute right-2 top-2 flex flex-col items-end gap-2 font-outfit text-[14px] font-black uppercase leading-none tracking-[1px] text-voicesNext-background md:text-[18px]">
              <span className="bg-voicesNext-cream px-1 py-[2px] md:min-w-[124px] md:px-4 md:py-[9px] md:text-center">
                {locationLabel}
              </span>
              <span className="bg-voicesNext-cream px-1 py-[2px] md:min-w-[124px] md:px-4 md:py-[9px] md:text-center">
                {stationLabel}
              </span>
            </div>

            <FeatureLink
              href={item.href}
              className="absolute bottom-[32px] left-0 block w-[320px] rounded-r-[10px] bg-voicesNext-orange/90 pb-4 pl-4 pr-3 pt-[10px] text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream md:hidden"
            >
              <h2 className="truncate font-gabarito text-[24px] font-bold leading-none">
                {item.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-[7px] font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-orange">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-voicesNext-cream px-2 py-1"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </FeatureLink>

            <div className="absolute bottom-0 left-0 hidden w-full md:block md:w-[620px]">
              <div className="relative grid min-h-[122px] grid-cols-[110px_minmax(0,1fr)] items-stretch text-voicesNext-cream md:min-h-[132px] md:grid-cols-[120px_minmax(0,1fr)]">
                <FeatureLink
                  href={item.href}
                  className="group/feature-cta grid grid-rows-[38px_1fr] border-r-2 border-t-2 border-voicesNext-cream bg-voicesNext-background/30 font-outfit text-[18px] font-black uppercase leading-none tracking-[1px] transition-[background-color,color,box-shadow] duration-300 hover:bg-voicesNext-cream hover:text-voicesNext-background hover:shadow-[0_0_36px_rgba(248,239,224,0.36)] focus:outline-none focus-visible:bg-voicesNext-cream focus-visible:text-voicesNext-background focus-visible:ring-2 focus-visible:ring-voicesNext-cream md:text-[20px]"
                >
                  <span className="flex items-center justify-center">
                    {item.cta}
                  </span>
                  <span className="flex items-center justify-center self-stretch">
                    {/* Only a show has something to play. Blog and event
                        slides read "Read"/"View", so a play glyph there
                        promises audio that doesn't exist — they get a "go"
                        arrow instead. Same 36px footprint either way, so the
                        CTA block keeps its proportions and the carousel
                        doesn't jump between slides. */}
                    {item.type === "show" ? (
                      <Play
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover/feature-cta:scale-110 group-focus/feature-cta:scale-110"
                        size={36}
                        fill="currentColor"
                      />
                    ) : (
                      <ArrowRight
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover/feature-cta:translate-x-1 group-focus/feature-cta:translate-x-1"
                        size={36}
                      />
                    )}
                  </span>
                </FeatureLink>

                <div className="min-w-0 px-4 py-[13px] [text-shadow:0_1px_8px_rgba(0,0,0,0.75)] md:px-5">
                  <h2 className="line-clamp-2 font-gabarito text-[25px] font-bold leading-none md:text-[30px]">
                    {item.title}
                  </h2>
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

        {/* Mobile transport row: dots · counter · play/pause read as one
            cluster, in the same order as the desktop row below. It lives
            inside the image frame rather than the section so `bottom` is
            measured against the artwork — the frame's overflow-hidden then
            makes it impossible for a control to hang off the bottom edge.
            The wrapper is pointer-events-none so a swipe across the bottom
            band still reaches the draggable slide; only the controls
            themselves take pointer events. */}
        {hasMultipleItems && (
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex items-center justify-center gap-2 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] md:hidden">
            <div className="pointer-events-auto flex items-center gap-1">
              {featureItems.map((featureItem, index) => (
                <button
                  key={featureItem.id}
                  type="button"
                  className="flex h-6 w-4 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-cream"
                  onClick={() => {
                    setDirection(index > activeIndex ? 1 : -1);
                    setAutoSlideResetKey((resetKey) => resetKey + 1);
                    setActiveIndex(index);
                  }}
                  aria-label={`Show featured item ${index + 1}`}
                  aria-current={index === activeIndex}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      // h-/w- rather than `size-`: this project is on Tailwind
                      // 3.3, which predates the `size-*` utility, so `size-1.5`
                      // silently generated nothing and the dots rendered 0x0.
                      "h-1.5 w-1.5 rounded-full bg-voicesNext-cream shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-[transform,opacity] duration-200",
                      index === activeIndex
                        ? "scale-125 opacity-100"
                        : "opacity-55 scale-75",
                    )}
                  />
                </button>
              ))}
            </div>
            <span
              className="font-asap text-[11px] font-bold tabular-nums leading-none text-voicesNext-cream"
              aria-live="polite"
            >
              {activeIndex + 1}/{featureItems.length}
            </span>
            {!shouldReduceMotion && (
              <button
                type="button"
                // No chrome behind the glyph — a drop-shadow (not text-shadow;
                // this is an SVG) gives it the same legibility treatment the
                // dots and counter already use over arbitrary artwork.
                className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center text-voicesNext-cream transition-colors [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.7))] focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream active:text-voicesNext-orange"
                onClick={() => setManuallyPaused((paused) => !paused)}
                aria-label={
                  manuallyPaused
                    ? "Play featured slideshow"
                    : "Pause featured slideshow"
                }
                aria-pressed={manuallyPaused}
              >
                {manuallyPaused ? (
                  <Play aria-hidden="true" size={12} fill="currentColor" />
                ) : (
                  <Pause aria-hidden="true" size={12} fill="currentColor" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-5 hidden h-[22px] w-auto items-center justify-center gap-3 font-asap text-[12px] font-bold leading-none text-voicesNext-cream md:flex">
        <button
          type="button"
          className="inline-flex h-5 w-3 items-center justify-center transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream disabled:cursor-default disabled:text-voicesNext-cream/40"
          onClick={showPrevious}
          disabled={!hasMultipleItems}
          aria-label="Show previous featured post"
        >
          <span aria-hidden="true">‹</span>
        </button>
        {hasMultipleItems && !shouldReduceMotion && (
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream"
            onClick={() => setManuallyPaused((paused) => !paused)}
            aria-label={
              manuallyPaused
                ? "Play featured slideshow"
                : "Pause featured slideshow"
            }
            aria-pressed={manuallyPaused}
          >
            {manuallyPaused ? (
              <Play aria-hidden="true" size={11} fill="currentColor" />
            ) : (
              <Pause aria-hidden="true" size={11} fill="currentColor" />
            )}
          </button>
        )}
        <span className="min-w-[24px] text-center tabular-nums">
          {activeIndex + 1}/{featureItems.length}
        </span>
        <button
          type="button"
          className="inline-flex h-5 w-3 items-center justify-center transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-cream disabled:cursor-default disabled:text-voicesNext-cream/40"
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
