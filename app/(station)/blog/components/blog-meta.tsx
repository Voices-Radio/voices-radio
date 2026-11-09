import { cn } from "@/lib/utils";
import { formatPostDate, toIsoDate } from "@/lib/voices/blog";

/**
 * Author · date · reading time.
 *
 * Deliberately icon-free. The lucide User / Calendar / Clock glyphs this
 * replaces added nothing next to "Jack", "12 Aug 2026" and "5 min read" —
 * an icon that carries no meaning when removed is decoration, and three of
 * them in a row was the loudest generic-dashboard signal on the page.
 * Asap Condensed and middots do the same work more quietly.
 */
export default function BlogMeta({
  author,
  publishedAt,
  readingTime,
  className,
}: {
  author?: string;
  publishedAt?: string;
  readingTime?: number;
  className?: string;
}) {
  const date = formatPostDate(publishedAt);
  const isoDate = toIsoDate(publishedAt);

  const parts = [
    author ? <span key="author">{author}</span> : null,
    date ? (
      <time key="date" dateTime={isoDate || undefined}>
        {date}
      </time>
    ) : null,
    readingTime ? <span key="reading">{readingTime} min read</span> : null,
  ].filter(Boolean);

  if (!parts.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-asap text-[12px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary",
        className,
      )}
    >
      {parts.map((part, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-voicesNext-border">
              ·
            </span>
          )}
          {part}
        </span>
      ))}
    </div>
  );
}
