import type { PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";

/**
 * Article body styling.
 *
 * Replaces `prose prose-lg`, whose defaults are built for dark text on a
 * light page — on `voicesNext-background` it fought the theme at every
 * heading, rule and link. Everything is styled explicitly instead, in the
 * station's own type stack: Gabarito body at a comfortable long-read
 * measure, Asap Condensed captions, and the orange rule used as a section
 * marker so a long post stays scannable.
 */
export const blogPortableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = value?.asset?.url;
      if (!url) return null;

      return (
        <figure className="my-10">
          <div className="relative overflow-hidden border border-voicesNext-border">
            <Image
              src={url}
              alt={value.alt || ""}
              width={1200}
              height={800}
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-auto w-full object-cover"
              {...(value?.asset?.metadata?.lqip
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: value.asset.metadata.lqip,
                  }
                : {})}
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 font-asap text-[13px] leading-snug text-voicesNext-secondary">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="mb-6 font-gabarito text-[17px] leading-[1.7] text-voicesNext-cream/90 md:text-[18px]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      // The orange tick is the section marker — it does the job the old
      // `prose` heading sizes did, at a glance, while scrolling.
      <h2 className="relative mb-4 mt-12 pl-4 font-gabarito text-[26px] font-bold leading-tight text-voicesNext-cream before:absolute before:left-0 before:top-[0.3em] before:h-[0.8em] before:w-[3px] before:bg-voicesNext-orange before:content-[''] md:text-[30px]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-9 font-gabarito text-[21px] font-bold leading-tight text-voicesNext-cream md:text-[24px]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-7 font-gabarito text-[18px] font-bold leading-tight text-voicesNext-cream">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-9 border-l-[3px] border-voicesNext-orange bg-voicesNext-surface px-5 py-5 font-gabarito text-[19px] font-bold leading-snug text-voicesNext-cream md:text-[22px]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href ?? "";
      const external = /^https?:\/\//.test(href);

      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-voicesNext-orangeText underline decoration-voicesNext-orange decoration-2 underline-offset-4 transition-colors hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          href={href || "/"}
          className="font-medium text-voicesNext-orangeText underline decoration-voicesNext-orange decoration-2 underline-offset-4 transition-colors hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
        >
          {children}
        </Link>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-voicesNext-cream">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded-voices-xs border border-voicesNext-border bg-voicesNext-surface px-[6px] py-[2px] font-mono text-[0.9em] text-voicesNext-cream">
        {children}
      </code>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 font-gabarito text-[17px] leading-[1.7] text-voicesNext-cream/90 marker:text-voicesNext-orange md:text-[18px]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 font-gabarito text-[17px] leading-[1.7] text-voicesNext-cream/90 marker:text-voicesNext-orange md:text-[18px]">
        {children}
      </ol>
    ),
  },
};
