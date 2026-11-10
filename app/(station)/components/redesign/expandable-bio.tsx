"use client";

import { useEffect, useId, useRef, useState } from "react";

type ExpandableBioProps = {
  bio: string;
};

// Mobile artist bio: clamped to five lines, with a toggle that shows the rest.
// The toggle only renders when the clamp actually hides text, so short bios
// do not get a "Read more" that does nothing.
export default function ExpandableBio({ bio }: ExpandableBioProps) {
  const textId = useId();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    const measure = () =>
      setOverflows(element.scrollHeight > element.clientHeight + 1);

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bio, expanded]);

  return (
    <>
      <p
        id={textId}
        ref={textRef}
        className={`mt-5 max-w-[313px] whitespace-pre-line font-asap text-[16px] leading-normal text-voicesNext-cream ${
          expanded ? "" : "line-clamp-5"
        }`}
      >
        {bio}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-[10px] font-asap text-[16px] font-bold leading-none text-voicesNext-orange"
        >
          {expanded ? "(Read less)" : "(Read more)"}
        </button>
      )}
    </>
  );
}
