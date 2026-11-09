import { cn } from "@/lib/utils";
import { formatCategoryLabel } from "@/lib/voices/blog";

/**
 * The cream hardware label the station stamps on artwork — LONDON / KX on the
 * home feature panel, BLOG / EVENT on the editorial rail. Carrying the blog
 * category in the same mark is why the blog reads as part of the site rather
 * than a CMS template: one device, used everywhere something needs naming.
 *
 * `tone="stamp"` is the solid cream label for use over an image.
 * `tone="quiet"` is the outlined version for tag rows on the dark canvas,
 * where a row of solid cream blocks would shout louder than the headline.
 */
export default function CategoryStamp({
  category,
  tone = "stamp",
  className,
}: {
  category: string;
  tone?: "stamp" | "quiet";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-asap text-[11px] font-black uppercase leading-none tracking-[0.5px]",
        tone === "stamp"
          ? "bg-voicesNext-cream px-2 py-1 text-voicesNext-background"
          : "rounded-full border border-voicesNext-border px-[10px] py-[5px] text-voicesNext-secondary",
        className,
      )}
    >
      {formatCategoryLabel(category)}
    </span>
  );
}
