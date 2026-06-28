"use client";

import { Video } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function LiveStationCard({
  station,
  title,
  artwork,
  artworkAlt,
  streamUrl,
  videoUrl,
  className,
}: {
  station: "KX" | "EAST";
  title: string;
  artwork?: string;
  artworkAlt?: string;
  streamUrl?: string;
  videoUrl?: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    try {
      setError(false);
      if (playing) {
        audio.pause();
        setPlaying(false);
        return;
      }
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError(true);
    }
  }

  return (
    <article
      className={cn(
        "relative h-[316px] overflow-hidden bg-voicesNext-background",
        className,
      )}
    >
      <audio ref={audioRef} src={streamUrl} preload="none" />
      <div className="flex h-[34px] items-center justify-between bg-voicesNext-cream px-[14px] text-voicesNext-background">
        <button
          type="button"
          className="font-outfit text-[24px] font-black uppercase leading-none tracking-[1px] transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange disabled:cursor-not-allowed disabled:text-voicesNext-border"
          onClick={toggleAudio}
          disabled={!streamUrl}
          aria-label={playing ? `Pause ${station}` : `Play ${station}`}
        >
          {station}
        </button>
        <a
          href={videoUrl ?? "#video-placeholder"}
          className={cn(
            "inline-flex h-[26px] w-[31px] items-center justify-center transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange",
            !videoUrl && "pointer-events-none text-voicesNext-border",
          )}
          aria-disabled={!videoUrl}
          aria-label={`${station} video`}
        >
          <Video aria-hidden="true" size={26} strokeWidth={2.6} />
        </a>
      </div>

      <div className="h-[13px] overflow-hidden border-y border-voicesNext-cream bg-voicesNext-background font-outfit text-[10px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-secondary">
        <div className="voices-on-air-marquee flex w-max items-center gap-[6px] px-1">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="flex shrink-0 items-center gap-[6px]">
              <span>On air</span>
              <span className="h-2 w-2 rounded-full bg-voicesNext-live" />
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[269px]">
        <Image
          src={artwork ?? "/VOICESLOGO_LIGHTBOX.png"}
          alt={artworkAlt ?? `${station} live show artwork`}
          fill
          sizes="316px"
          className="object-cover"
          priority={station === "KX"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[57%] to-voicesNext-background/60" />
        <h2 className="absolute bottom-3 left-[10px] right-6 font-gabarito text-[20px] font-bold leading-[1.08] text-voicesNext-cream">
          {title}
        </h2>
      </div>

      {error && (
        <p className="bg-voicesNext-background/85 absolute bottom-3 left-3 right-3 p-2 font-gabarito text-xs text-voicesNext-orange">
          Stream unavailable. Check the audio stream config.
        </p>
      )}
    </article>
  );
}
