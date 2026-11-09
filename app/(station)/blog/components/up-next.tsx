import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPostDate } from "@/lib/voices/blog";
import type { MainBlogPost } from "@/sanity.queries";
import PostImage from "./post-image";

/**
 * One recommended next post at the end of an article.
 *
 * An article used to end on three equal related cards, which hands a reader
 * who has just finished a decision instead of a next step. A single "up
 * next" tile is the ending the Peak-End rule asks for: the last thing on
 * screen is one obvious continuation, with the smaller related row kept
 * below for anyone who wants to choose after all.
 */
export default function UpNext({ post }: { post: MainBlogPost }) {
  return (
    <section className="border-t border-voicesNext-border pt-10">
      <p className="font-outfit text-[13px] font-black uppercase leading-none tracking-[1px] text-voicesNext-orangeText">
        Up next
      </p>

      <article className="group relative mt-4 grid border border-voicesNext-border bg-voicesNext-surface sm:grid-cols-[200px_minmax(0,1fr)]">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-voicesNext-orange transition-transform duration-200 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
        />

        <div className="relative h-[160px] overflow-hidden sm:h-full sm:min-h-[170px]">
          <PostImage
            post={post}
            sizes="(min-width: 640px) 200px, 100vw"
            compact
            className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        </div>

        <div className="flex flex-col justify-center gap-3 border-t border-voicesNext-border p-5 sm:border-l sm:border-t-0 sm:p-6">
          {formatPostDate(post.publishedAt) && (
            <p className="font-asap text-[11px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary">
              {formatPostDate(post.publishedAt)}
            </p>
          )}

          <h2 className="line-clamp-2 font-gabarito text-[22px] font-bold leading-[1.05] text-voicesNext-cream md:text-[26px]">
            <Link
              href={`/blog/${post.slug.current}`}
              className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline focus-visible:decoration-voicesNext-orange focus-visible:decoration-2 focus-visible:underline-offset-4"
            >
              {post.title}
            </Link>
          </h2>

          {post.excerpt && (
            <p className="line-clamp-2 font-asap text-sm leading-snug text-voicesNext-secondary">
              {post.excerpt}
            </p>
          )}

          <span
            aria-hidden="true"
            className="inline-flex items-center gap-2 font-gabarito text-sm font-bold uppercase tracking-[0.5px] text-voicesNext-orangeText transition-colors group-hover:text-voicesNext-cream"
          >
            Read story
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
            />
          </span>
        </div>
      </article>
    </section>
  );
}
