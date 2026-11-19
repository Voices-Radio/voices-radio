"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/** Same speed for every title length, so a long title is not rushed. */
const SPEED_PX_PER_SECOND = 35;
/** Each loop rests at the start so the reader sees the first words. */
const HOLD_MS = 1500;
/** Sub-pixel rounding must not start a scroll for a title that fits. */
const FIT_TOLERANCE_PX = 0.5;

const START = "translate3d(0px, 0, 0)";

type OverflowMarqueeProps = {
  text: string;
  /** Typography and spacing for the line. */
  className?: string;
  /** Extra classes for the still text when the device asks for less motion. */
  fallbackClassName?: string;
};

type Widths = { text: number; viewport: number };

/**
 * One line of text that scrolls right to left only when it is too wide for
 * its box. The scroll is a Web Animations transform, so the compositor runs
 * it and it stays smooth while the main thread is busy.
 */
export default function OverflowMarquee({
  text,
  className,
  fallbackClassName,
}: OverflowMarqueeProps) {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const tapPausedRef = useRef(false);
  const hoveredRef = useRef(false);
  const [widths, setWidths] = useState<Widths>({ text: 0, viewport: 0 });

  const scrolling =
    !reducedMotion && widths.text > widths.viewport + FIT_TOLERANCE_PX;

  useEffect(() => {
    if (reducedMotion) return;
    const viewport = viewportRef.current;
    const textEl = textRef.current;
    if (!viewport || !textEl) return;

    const measure = () =>
      setWidths({
        text: textEl.getBoundingClientRect().width,
        viewport: viewport.getBoundingClientRect().width,
      });

    measure();
    // Re-measure on rotation, resize and late web-font loads.
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(textEl);
    return () => observer.disconnect();
  }, [reducedMotion, text]);

  useEffect(() => {
    if (!scrolling) return;
    const animation = startLoop(
      trackRef.current,
      textRef.current,
      copyRef.current,
    );
    if (!animation) return;
    animationRef.current = animation;
    if (tapPausedRef.current) animation.pause();
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [scrolling, text, widths.text]);

  if (reducedMotion) {
    return (
      <div className={cn(className, fallbackClassName)} title={text}>
        {text}
      </div>
    );
  }

  const syncPause = () => {
    const animation = animationRef.current;
    if (!animation) return;
    if (tapPausedRef.current || hoveredRef.current) animation.pause();
    else animation.play();
  };

  const onHover = (hovered: boolean) => (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    hoveredRef.current = hovered;
    syncPause();
  };

  return (
    <div
      ref={viewportRef}
      data-marquee="viewport"
      title={text}
      className={cn(className, "overflow-hidden whitespace-nowrap")}
      onClick={() => {
        tapPausedRef.current = !tapPausedRef.current;
        syncPause();
      }}
      onPointerEnter={onHover(true)}
      onPointerLeave={onHover(false)}
    >
      <span
        ref={trackRef}
        className={cn("flex w-max", scrolling && "will-change-transform")}
      >
        <span ref={textRef} data-marquee="text">
          {text}
        </span>
        {scrolling && (
          <>
            <span aria-hidden="true" className="w-10 shrink-0" />
            <span ref={copyRef} data-marquee="copy" aria-hidden="true">
              {text}
            </span>
          </>
        )}
      </span>
    </div>
  );
}

/**
 * Holds, then moves the track left by exactly one loop (text + gap). The
 * second copy then sits where the first began, so the restart has no jump.
 */
function startLoop(
  track: HTMLElement | null,
  textEl: HTMLElement | null,
  copy: HTMLElement | null,
): Animation | null {
  if (!track || !textEl || !copy || typeof track.animate !== "function") {
    return null;
  }
  // Measured from the copy's position, not rounded widths, so the loop
  // distance is exact to the sub-pixel.
  const loop =
    copy.getBoundingClientRect().left - textEl.getBoundingClientRect().left;
  if (loop <= 0) return null;

  const duration = HOLD_MS + (loop / SPEED_PX_PER_SECOND) * 1000;
  return track.animate(
    [
      { transform: START, offset: 0 },
      { transform: START, offset: HOLD_MS / duration },
      { transform: `translate3d(-${loop}px, 0, 0)`, offset: 1 },
    ],
    { duration, iterations: Infinity, easing: "linear" },
  );
}
