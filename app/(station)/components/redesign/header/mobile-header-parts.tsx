import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function WavyMenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[21px] w-[29px]"
      fill="none"
      viewBox="0 0 29 21"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 4.5c3.2-2.5 6.4-2.5 9.6 0 3.2 2.4 6.4 2.4 9.6 0 2.5-1.9 4.8-2.3 6.8-1.1M1.5 10.5c3.2-2.5 6.4-2.5 9.6 0 3.2 2.4 6.4 2.4 9.6 0 2.5-1.9 4.8-2.3 6.8-1.1M1.5 16.5c3.2-2.5 6.4-2.5 9.6 0 3.2 2.4 6.4 2.4 9.6 0 2.5-1.9 4.8-2.3 6.8-1.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

export function MobileHeaderArtwork() {
  return (
    <>
      <Link
        href="/"
        className="block h-[37px] w-[37px] justify-self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        aria-label="Voices Radio home"
      >
        <Image
          src="/VOICESLOGO_LIGHTBOX.png"
          alt=""
          width={37}
          height={37}
          className="h-[37px] w-[37px] object-contain"
          priority
        />
      </Link>
      <Link
        href="/"
        className="block h-[28px] w-[41px] justify-self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        aria-label="Voices Radio home"
      >
        {/* Text only — the circular mark is already the top-left logo. */}
        <Image
          src="/voices-wordmark-text.svg"
          alt=""
          width={41}
          height={28}
          className="h-[28px] w-[41px] object-contain"
          priority
        />
      </Link>
    </>
  );
}

export function MobileOnAirTicker() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="h-[15px] overflow-hidden bg-voicesNext-background font-outfit text-[9px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-secondary md:hidden">
      {/* Decorative loop — one sr-only label stands in for the repeats. */}
      <span className="sr-only">On air</span>
      <div aria-hidden="true" className="h-full">
        <Marquee autoFill speed={30} play={!reducedMotion} gradient={false}>
          <span className="flex h-[15px] items-center gap-[6px] pr-[6px]">
            <span>On air</span>
            <span className="size-2 rounded-full bg-voicesNext-live" />
          </span>
        </Marquee>
      </div>
    </div>
  );
}
