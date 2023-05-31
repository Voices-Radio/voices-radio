"use client";

import { urlForImage } from "@/sanity.image";
import { LazyMotion, m } from "framer-motion";
import Image from "next/image";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";
import { Image as SanityImage } from "sanity";

function useInterval(cb: () => void, ms: number) {
  const id = useRef<any>(null);

  const onInterval = useEffectEvent(cb);

  const handleClearInterval = () => {
    window.clearInterval(id.current);
  };

  useEffect(() => {
    id.current = window.setInterval(onInterval, ms);
    return handleClearInterval;
  }, [ms]);

  return handleClearInterval;
}

const loadFeatures = () =>
  import("../lib/load-features").then((res) => res.default);

export default function Carousel({ images }: { images: SanityImage[] }) {
  let [index, setIndex] = useState(0);

  useInterval(() => {
    setIndex((_index) => {
      const newIndex = _index + 1;

      return newIndex >= 0
        ? newIndex % images.length
        : images.length + (newIndex % images.length);
    });
  }, 2 * 1_000);

  return (
    <LazyMotion features={loadFeatures} strict>
      <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
        <div className="relative overflow-hidden">
          <m.div
            className="flex"
            animate={{ x: `-${index * 100}%` }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            {images.map((image, idx) => (
              <Image
                key={idx}
                src={urlForImage(image).url()}
                width={650}
                height={440}
                className="aspect-[3/2] object-cover"
                alt=""
              />
            ))}
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
