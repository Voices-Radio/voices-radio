import Image from "next/image";
import { cn } from "@/lib/utils";
import { pickFallbackTileVariant } from "@/lib/voices/blog";
import type { MainBlogPost } from "@/sanity.queries";

/**
 * Colourways for the typographic fallback tile. Posts without a featured
 * image used to share one `/studio-1.jpg`, so an index of image-less posts
 * rendered as a grid of identical photos — three tape-label treatments,
 * picked deterministically from the document id, keep that grid varied.
 */
const FALLBACK_VARIANTS = [
  {
    panel: "bg-voicesNext-surface",
    title: "text-voicesNext-cream",
    rule: "bg-voicesNext-orange",
  },
  {
    panel: "bg-voicesNext-cream",
    title: "text-voicesNext-background",
    rule: "bg-voicesNext-orange",
  },
  {
    panel: "bg-voicesNext-orange",
    title: "text-voicesNext-cream",
    rule: "bg-voicesNext-cream",
  },
] as const;

function FallbackTile({
  id,
  title,
  compact,
}: {
  id: string;
  title: string;
  compact: boolean;
}) {
  const variant = FALLBACK_VARIANTS[pickFallbackTileVariant(id)];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full flex-col justify-end gap-3 p-4 md:p-5",
        variant.panel,
      )}
    >
      <span className={cn("h-[3px] w-10 shrink-0", variant.rule)} />
      <span
        className={cn(
          "font-outfit font-black uppercase leading-[0.95]",
          compact ? "line-clamp-3 text-[22px]" : "line-clamp-4 text-[30px]",
          variant.title,
        )}
      >
        {title}
      </span>
    </div>
  );
}

/**
 * A post's featured image, or the typographic tile when there isn't one.
 *
 * The GROQ queries already fetch `featuredImage.asset.metadata.lqip` and
 * nothing was using it — wiring it up as the blur placeholder matters most
 * here, where an empty image box on a dark page reads as broken.
 */
export default function PostImage({
  post,
  sizes,
  priority = false,
  compact = false,
  className,
}: {
  post: MainBlogPost;
  sizes: string;
  priority?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const asset = post.featuredImage?.asset;

  if (!asset?.url) {
    return <FallbackTile id={post._id} title={post.title} compact={compact} />;
  }

  const lqip = asset.metadata?.lqip;

  return (
    <Image
      src={asset.url}
      alt={post.title}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      {...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {})}
    />
  );
}
