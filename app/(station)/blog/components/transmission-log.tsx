import Link from "next/link";
import { formatCategoryLabel, formatPostDate } from "@/lib/voices/blog";
import type { MainBlogPost } from "@/sanity.queries";

/**
 * The archive tail below the card grid: older posts as a dense dated list,
 * chunked by year.
 *
 * A card grid is right for the recent handful and wrong for everything
 * older — past about a dozen tiles it stops being browsable and becomes a
 * wall of equally-weighted images. A running order, the way a station logs
 * transmissions, stays scannable at any length, and the year headings give
 * a long list the structure a flat grid can't (Miller).
 */
function groupByYear(posts: MainBlogPost[]) {
  const years = new Map<string, MainBlogPost[]>();

  for (const post of posts) {
    const parsed = new Date(post.publishedAt);
    const year = Number.isNaN(parsed.getTime())
      ? "Undated"
      : String(parsed.getFullYear());

    years.set(year, [...(years.get(year) ?? []), post]);
  }

  return [...years.entries()];
}

export default function TransmissionLog({ posts }: { posts: MainBlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="mt-14 md:mt-20">
      <div className="flex items-baseline justify-between border-b border-voicesNext-border pb-3">
        <h2 className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream md:text-[24px]">
          Archive
        </h2>
        <p className="font-asap text-[12px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary">
          {posts.length} {posts.length === 1 ? "story" : "stories"}
        </p>
      </div>

      {groupByYear(posts).map(([year, yearPosts]) => (
        <div key={year} className="mt-8">
          <h3 className="font-outfit text-[13px] font-black uppercase leading-none tracking-[1px] text-voicesNext-orangeText">
            {year}
          </h3>

          <ul className="mt-3">
            {yearPosts.map((post) => (
              <li key={post._id}>
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="group grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-b border-voicesNext-border/60 py-4 transition-colors hover:bg-voicesNext-surface/60 focus:outline-none focus-visible:bg-voicesNext-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange md:grid-cols-[110px_minmax(0,1fr)_auto] md:px-2"
                >
                  <span className="font-asap text-[12px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary">
                    {formatPostDate(post.publishedAt)}
                  </span>

                  <span className="font-gabarito text-[17px] font-bold leading-tight text-voicesNext-cream transition-colors group-hover:text-voicesNext-orangeText md:text-[19px]">
                    {post.title}
                  </span>

                  {post.categories?.[0] && (
                    <span className="col-start-2 font-asap text-[11px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary md:col-start-3">
                      {formatCategoryLabel(post.categories[0])}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
