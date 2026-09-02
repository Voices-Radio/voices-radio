import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPostDate } from "@/lib/voices/blog";
import type { MainBlogPost } from "@/sanity.queries";
import BlogMeta from "./blog-meta";
import CategoryStamp from "./category-stamp";
import PostImage from "./post-image";

/**
 * One lead post at the top of the index — artwork left, copy right on
 * desktop, stacked on mobile.
 *
 * One lead, not the old pair of "Featured Posts": two equally-weighted hero
 * tiles side by side give a reader arriving cold two competing entry points
 * and no recommendation. A single dominant tile answers "start here", and
 * everything else is the grid below it.
 */
export default function BlogLeadCard({ post }: { post: MainBlogPost }) {
  const date = formatPostDate(post.publishedAt);

  return (
    <article className="group relative grid border border-voicesNext-border bg-voicesNext-surface md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-voicesNext-orange transition-transform duration-200 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
      />

      <div className="relative h-[220px] overflow-hidden md:h-full md:min-h-[340px]">
        <PostImage
          post={post}
          sizes="(min-width: 768px) 55vw, 100vw"
          priority
          className="transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
        />
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <CategoryStamp category="Latest" />
          {post.categories?.slice(0, 1).map((category) => (
            <CategoryStamp key={category} category={category} />
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 border-t border-voicesNext-border p-5 md:border-l md:border-t-0 md:p-8">
        {date && (
          <p className="font-asap text-[12px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-orangeText">
            {date}
          </p>
        )}

        <h2 className="text-balance line-clamp-3 font-gabarito text-[28px] font-bold leading-[1.02] text-voicesNext-cream md:text-[40px]">
          <Link
            href={`/blog/${post.slug.current}`}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline focus-visible:decoration-voicesNext-orange focus-visible:decoration-2 focus-visible:underline-offset-4"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="line-clamp-3 font-gabarito text-base leading-relaxed text-voicesNext-cream/90 md:text-lg">
            {post.excerpt}
          </p>
        )}

        <BlogMeta author={post.author} />

        <span
          aria-hidden="true"
          className="mt-1 inline-flex items-center gap-2 font-gabarito text-sm font-bold uppercase tracking-[0.5px] text-voicesNext-orangeText transition-colors group-hover:text-voicesNext-cream"
        >
          Read story
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
          />
        </span>
      </div>
    </article>
  );
}
