"use client";

import { useInterval } from "@/hooks/use-timer";
import { cn } from "@/lib/utils";
import { urlForImage } from "@/sanity.image";
import { LazyMotion, m } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Image as SanityImage } from "sanity";

const loadFeatures = () =>
  import("../../lib/load-features").then((res) => res.default);

export default function Carousel({
  images,
  delay = 4,
  flipped,
}: {
  delay?: number;
  images: SanityImage[];
  flipped?: boolean;
}) {
  let [index, setIndex] = useState(0);

  useInterval(() => {
    setIndex((_index) => {
      const newIndex = _index + 1;

      return newIndex >= 0
        ? newIndex % images.length
        : images.length + (newIndex % images.length);
    });
  }, delay * 1_000);

  return (
    <LazyMotion features={loadFeatures} strict>
      <div
        className={cn(
          "relative mx-auto flex h-full max-w-xl flex-col justify-center",
          flipped ? "mask-blob-flipped" : "mask-blob",
        )}
      >
        <div className="relative overflow-hidden">
          <m.div
            className="flex"
            animate={{ x: `-${index * 100}%` }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            {images.map((image, idx) => (
              <Image
                alt=""
                className="aspect-[3/2] select-none object-cover"
                draggable={false}
                height={384}
                key={idx}
                src={urlForImage(image)
                  .width(576)
                  .height(384)
                  .dpr(2)
                  .quality(75)
                  .url()}
                width={576}
                unoptimized
              />
            ))}
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
