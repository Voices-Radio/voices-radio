import type { Metadata } from "next";
import Link from "next/link";
import { getBaseUrl } from "@/lib/site-url";
import {
  collectCategories,
  filterPostsByCategories,
  formatPostDate,
} from "@/lib/voices/blog";
import {
  getParamArray,
  type VoicesSearchParams,
} from "@/lib/voices/search-params";
import { client } from "@/sanity.client";
import { mainBlogPostsQuery, type MainBlogPost } from "@/sanity.queries";
import PageHero from "../components/redesign/page-hero";
import BlogCta from "./components/blog-cta";
import BlogLeadCard from "./components/blog-lead-card";
import BlogPostCard from "./components/blog-post-card";
import CategoryFilter from "./components/category-filter";
import TransmissionLog from "./components/transmission-log";

/** Cards stay browsable for about this many posts; older ones go to the
 *  archive list below, which reads better at length. */
const GRID_LIMIT = 9;

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog | Voices Radio - Community News & Updates",
  description:
    "Stay updated with the latest news, events, and stories from Voices Radio. Discover community highlights, music features, and behind-the-scenes content.",
  keywords: [
    "voices radio",
    "community radio",
    "london radio",
    "music blog",
    "community news",
  ],
  openGraph: {
    title: "Blog | Voices Radio - Community News & Updates",
    description:
      "Stay updated with the latest news, events, and stories from Voices Radio.",
    type: "website",
  },
};

async function getBlogPosts(): Promise<MainBlogPost[]> {
  return await client.fetch(mainBlogPostsQuery);
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="border border-voicesNext-border bg-voicesNext-surface p-8 md:p-12">
      <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream">
        {filtered ? "Nothing under that filter yet" : "No stories yet"}
      </h2>
      <p className="mt-3 max-w-xl font-gabarito text-base leading-relaxed text-voicesNext-cream/90">
        {filtered
          ? "No posts match every category you've selected. Try clearing one, or browse everything we've published."
          : "We're working on the first stories from the station. In the meantime, the stream is always on."}
      </p>
      <Link
        href={filtered ? "/blog" : "/explore"}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface"
      >
        {filtered ? "Show all posts" : "Explore the shows"}
      </Link>
    </div>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<VoicesSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedCategories = getParamArray(resolvedSearchParams, "category");

  const allPosts = await getBlogPosts();
  const categories = collectCategories(allPosts);
  const posts = filterPostsByCategories(allPosts, selectedCategories);

  // The lead is the newest featured post, or simply the newest one — the
  // query already orders by `publishedAt desc`. Everything after it goes to
  // the grid, so nothing renders twice: the old page mapped every post into
  // "All Posts" after already showing the featured ones above.
  const lead = posts.find((post) => post.featured) ?? posts[0];
  const rest = lead ? posts.filter((post) => post._id !== lead._id) : [];
  const gridPosts = rest.slice(0, GRID_LIMIT);
  const archivePosts = rest.slice(GRID_LIMIT);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${getBaseUrl()}/blog`,
    name: "Voices Radio Blog",
    description:
      "Stories, news and updates from Voices Radio, a community radio station in London.",
    url: `${getBaseUrl()}/blog`,
    blogPost: allPosts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${getBaseUrl()}/blog/${post.slug.current}`,
      datePublished: post.publishedAt,
      author: { "@type": "Person", name: post.author },
    })),
  };

  return (
    <div className="bg-voicesNext-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <PageHero
        eyebrow="From the station"
        title="Blog"
        description="Stories, news and updates from the Voices community — what's happening in the studio, on air and around London."
        meta={
          allPosts.length > 0 ? (
            <dl className="flex gap-8 border-l-2 border-voicesNext-orange pl-4 md:gap-10">
              <div>
                <dt className="font-asap text-[11px] font-bold uppercase leading-none tracking-[1px] text-voicesNext-secondary">
                  Stories
                </dt>
                <dd className="mt-2 font-outfit text-3xl font-black tabular-nums leading-none text-voicesNext-cream">
                  {allPosts.length}
                </dd>
              </div>
              <div>
                <dt className="font-asap text-[11px] font-bold uppercase leading-none tracking-[1px] text-voicesNext-secondary">
                  Last updated
                </dt>
                <dd className="mt-2 font-outfit text-3xl font-black uppercase leading-none text-voicesNext-cream">
                  {formatPostDate(allPosts[0]?.publishedAt)}
                </dd>
              </div>
            </dl>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-14">
        {categories.length > 0 && (
          <div className="mb-8 md:mb-10">
            <CategoryFilter
              categories={categories}
              selected={selectedCategories}
            />
          </div>
        )}

        {!lead ? (
          <EmptyState filtered={selectedCategories.length > 0} />
        ) : (
          <>
            <BlogLeadCard post={lead} />

            {gridPosts.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 xl:grid-cols-3">
                {gridPosts.map((post) => (
                  <BlogPostCard key={post._id} post={post} />
                ))}
              </div>
            )}

            <TransmissionLog posts={archivePosts} />
          </>
        )}
      </div>

      <BlogCta secondaryHref="/explore" secondaryLabel="Explore the shows" />
    </div>
  );
}
