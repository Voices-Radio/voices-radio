import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPostDate } from "@/lib/voices/blog";
import type { MainBlogPost } from "@/sanity.queries";
import BlogMeta from "./blog-meta";
import CategoryStamp from "./category-stamp";
import PostImage from "./post-image";

/**
 * The blog index's grid cell, and the related-posts card on an article.
 *
 * Extends the card already used by the home "From the community" rail —
 * square corners, hairline border, surface panel, cream stamp on the artwork
 * — so a reader who taps "Read story" on the home page lands somewhere
 * visibly made of the same parts. Content cards on this site are square;
 * only pills and chips are rounded.
 *
 * The whole card is the target. The old "Read More" link was a ~90px word at
 * the bottom of a 350px tile, which is a small target for the primary (and
 * only) action on the card.
 */
export default function BlogPostCard({
  post,
  sizes = "(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw",
  className,
}: {
  post: MainBlogPost;
  sizes?: string;
  className?: string;
}) {
  const date = formatPostDate(post.publishedAt);
  const [category] = post.categories ?? [];

  return (
    <article
      className={cn(
        "group relative grid grid-rows-[190px_minmax(0,1fr)] border border-voicesNext-border bg-voicesNext-surface transition-transform duration-200 hover:-translate-y-[2px] focus-within:-translate-y-[2px] motion-reduce:transform-none",
        className,
      )}
    >
      {/* The system's established interactive-surface treatment: a thin
          orange accent that wipes in from the left on hover/focus. No
          shadow — depth here is surface shift plus hairline border. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-voicesNext-orange transition-transform duration-200 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
      />

      <div className="relative overflow-hidden">
        <PostImage
          post={post}
          sizes={sizes}
          compact
          className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        {category && (
          <CategoryStamp
            category={category}
            className="absolute left-3 top-3 z-10"
          />
        )}
      </div>

      <div className="grid min-h-0 grid-rows-[auto_auto_1fr_auto] gap-3 border-t border-voicesNext-border p-4">
        {date && (
          <p className="font-asap text-[11px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-orangeText">
            {date}
          </p>
        )}

        <h3 className="line-clamp-2 font-gabarito text-[22px] font-bold leading-[1.05] text-voicesNext-cream md:text-[24px]">
          {/* Stretched link: the accessible name stays the post title while
              the whole card takes the click. */}
          <Link
            href={`/blog/${post.slug.current}`}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline focus-visible:decoration-voicesNext-orange focus-visible:decoration-2 focus-visible:underline-offset-4"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="line-clamp-3 font-asap text-sm leading-snug text-voicesNext-secondary">
            {post.excerpt}
          </p>
        )}

        <BlogMeta author={post.author} />
      </div>
    </article>
  );
}
