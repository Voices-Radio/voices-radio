import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { EventPost, MainBlogPost } from "@/sanity.queries";

type EditorialItem = {
  id: string;
  type: "Blog" | "Event";
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  cta: string;
  meta: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return dateFormatter.format(parsed);
}

function isExternalUrl(href: string) {
  return /^https?:\/\//.test(href);
}

function EditorialLink({
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

function getBlogItem(post: MainBlogPost): EditorialItem {
  return {
    id: post._id,
    type: "Blog",
    title: post.title,
    description: post.excerpt,
    imageUrl: post.featuredImage?.asset?.url ?? "/studio-1.jpg",
    imageAlt: post.title,
    href: `/blog/${post.slug.current}`,
    cta: "Read story",
    meta: formatDate(post.publishedAt),
  };
}

function getEventItem(event: EventPost): EditorialItem {
  return {
    id: event._id,
    type: "Event",
    title: event.title,
    description: event.excerpt,
    imageUrl: event.artwork?.asset?.url ?? "/studio-3.jpg",
    imageAlt: event.artwork?.alt ?? event.title,
    href: event.ctaUrl || `/events/${event.slug.current}`,
    cta: event.ctaText || "View event",
    meta: [formatDate(event.eventDate), event.venue]
      .filter(Boolean)
      .join(" / "),
  };
}

export default function HomeEditorialRail({
  blogPosts,
  events,
}: {
  blogPosts: MainBlogPost[];
  events: EventPost[];
}) {
  const items = [
    ...events.map(getEventItem),
    ...blogPosts.map(getBlogItem),
  ].slice(0, 6);

  if (!items.length) return null;

  return (
    <section className="border-y border-voicesNext-border bg-voicesNext-background py-10 md:py-[42px]">
      <div className="mb-7 flex flex-col gap-3 px-4 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-orangeText">
            CMS preview
          </p>
          <h2 className="text-balance mt-2 font-gabarito text-[32px] font-bold leading-none text-voicesNext-cream md:text-[38px]">
            From the community
          </h2>
        </div>
        <p className="max-w-[420px] font-asap text-sm leading-snug text-voicesNext-secondary">
          Featured events and stories from Sanity, shown alongside the live show
          rails for local content checks.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-2 md:px-8">
        {items.map((item) => (
          <article
            key={`${item.type}-${item.id}`}
            className="grid h-[380px] w-[300px] shrink-0 grid-rows-[190px_minmax(0,1fr)] border border-voicesNext-border bg-voicesNext-surface md:w-[350px]"
          >
            <div className="relative">
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                sizes="(min-width: 768px) 350px, 300px"
                className="object-cover"
              />
              <span className="absolute left-3 top-3 bg-voicesNext-cream px-2 py-1 font-asap text-[11px] font-black uppercase leading-none text-voicesNext-background">
                {item.type}
              </span>
            </div>

            <div className="grid min-h-0 grid-rows-[auto_auto_1fr_auto] gap-3 p-4">
              <p className="font-asap text-[11px] font-bold uppercase leading-none text-voicesNext-orangeText">
                {item.meta || item.type}
              </p>
              <h3 className="line-clamp-2 font-gabarito text-[24px] font-bold leading-[1.02] text-voicesNext-cream">
                {item.title}
              </h3>
              <p className="line-clamp-3 font-asap text-sm leading-snug text-voicesNext-secondary">
                {item.description}
              </p>
              <EditorialLink
                href={item.href}
                className="inline-flex h-9 w-fit items-center justify-center rounded-full bg-voicesNext-orange px-4 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface"
              >
                {item.cta}
              </EditorialLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
