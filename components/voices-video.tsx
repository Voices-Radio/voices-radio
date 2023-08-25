"use client";

import Image from "next/image";
import poster from "@/public/VIDEO.jpg";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import Stop from "@/icons/stop";
import Play from "@/icons/play";

export default function VoicesVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  const [playing, playingSet] = useState(true);

  const toggleVideo = () => {
    const el = ref.current;

    if (!el) {
      return;
    }

    if (playing) {
      el.pause();

      playingSet(false);
    } else {
      el.play();

      playingSet(true);
    }
  };

  return (
    <div className={cn("relative aspect-square lg:aspect-auto", className)}>
      <button
        className="absolute bottom-4 left-4 hidden motion-safe:block z-[1] text-white"
        onClick={toggleVideo}
      >
        {playing ? (
          <>
            <Stop />
            <div className="sr-only">Stop</div>
          </>
        ) : (
          <>
            <Play />
            <div className="sr-only">Play</div>
          </>
        )}
      </button>

      <video
        ref={ref}
        autoPlay
        className="absolute inset-0 h-full w-full object-cover hidden motion-safe:block"
        loop
        muted
        playsInline
        preload="none"
      >
        <source src="/VIDEO.webm" type="video/webm" />
        <source src="/VIDEO.mp4" type="video/mp4" />
      </video>

      <Image
        src={poster}
        className="object-cover motion-safe:hidden"
        placeholder="blur"
        fill
        alt=""
      />
    </div>
  );
}
