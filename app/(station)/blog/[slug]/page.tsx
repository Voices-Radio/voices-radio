import { PortableText } from "@portabletext/react";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/site-url";
import { getShow } from "@/lib/voices/api";
import {
  estimateReadingTime,
  formatCategoryLabel,
  toIsoDate,
} from "@/lib/voices/blog";
import type { VoicesShow } from "@/lib/voices/types";
import { client } from "@/sanity.client";
import {
  mainBlogPostQuery,
  mainBlogPostsQuery,
  newestMainBlogPostQuery,
  nextMainBlogPostQuery,
  relatedMainBlogPostsQuery,
  type MainBlogPost,
} from "@/sanity.queries";
import ArticleHero from "../components/article-hero";
import BlogCta from "../components/blog-cta";
import BlogMeta from "../components/blog-meta";
import BlogPostCard from "../components/blog-post-card";
import CategoryStamp from "../components/category-stamp";
import ListenWhileReading from "../components/listen-while-reading";
import { blogPortableTextComponents } from "../components/portable-text-components";
import ReadingProgress from "../components/reading-progress";
import ShareButton from "../components/share-button";
import UpNext from "../components/up-next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Was `force-dynamic`, which contradicted `generateStaticParams` — the
// params were prerendered and then every request re-rendered anyway. Posts
// change rarely; five minutes is plenty.
export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await client.fetch(mainBlogPostsQuery);
  return posts.map((post: MainBlogPost) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(mainBlogPostQuery, { slug });

  if (!post) {
    return {
      title: "Post Not Found | Voices Radio",
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image =
    post.ogImage?.asset?.url ||
    post.featuredImage?.asset?.url ||
    "/studio-1.jpg";

  return {
    title: `${title} | Voices Radio Blog`,
    description,
    keywords: post.keywords || ["voices radio", "community radio", "london"],
    openGraph: {
      title: `${title} | Voices Radio Blog`,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Voices Radio Blog`,
      description,
      images: [image],
    },
  };
}

async function getBlogPost(slug: string): Promise<MainBlogPost | null> {
  return await client.fetch(mainBlogPostQuery, { slug });
}

/**
 * Posts sharing a category, newest first. This used to fetch every published
 * post and slice three off the front — the query does the filtering now, so
 * "related" is actually related and the cost stops growing with the archive.
 */
async function getRelatedPosts(post: MainBlogPost): Promise<MainBlogPost[]> {
  if (!post.categories?.length) return [];

  return await client.fetch(relatedMainBlogPostsQuery, {
    id: post._id,
    categories: post.categories,
  });
}

/** The next post to read: the one published just before this, or — on the
 *  oldest post — the newest one, so the article never ends on nothing. */
async function getNextPost(post: MainBlogPost): Promise<MainBlogPost | null> {
  const older = await client.fetch(nextMainBlogPostQuery, {
    id: post._id,
    publishedAt: post.publishedAt,
  });

  return (
    older ?? (await client.fetch(newestMainBlogPostQuery, { id: post._id }))
  );
}

/** The show an article is about, when it names one and that show still
 *  exists. A bad or stale id just means no player. */
async function getRelatedShow(showId?: string): Promise<VoicesShow | null> {
  if (!showId) return null;

  return await getShow(showId).catch(() => null);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const [relatedPosts, nextPost, relatedShow] = await Promise.all([
    getRelatedPosts(post),
    getNextPost(post),
    getRelatedShow(post.relatedShowId),
  ]);

  const readingTime = estimateReadingTime(post.content);
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/blog/${post.slug.current}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.featuredImage?.asset?.url
        ? [post.featuredImage.asset.url]
        : undefined,
      datePublished: toIsoDate(post.publishedAt) || undefined,
      author: { "@type": "Person", name: post.author },
      publisher: {
        "@type": "Organization",
        name: "Voices Radio",
        url: baseUrl,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      keywords: post.keywords?.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${baseUrl}/blog`,
        },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <div className="bg-voicesNext-background">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1120px] px-4 pb-14 pt-8 md:px-8 md:pt-10">
        {/* Fixed tracks plus justify-center so the rail and the 720px column
            sit centred as one unit — sizing the article track with `1fr`
            stretched it against the container and left the reading column
            visibly off to the left of the page. */}
        <div className="grid justify-center gap-10 xl:grid-cols-[150px_720px]">
          {/* Article tools live in the margin on wide screens, so they stay
              within reach through a long read without a floating bar. */}
          <div className="hidden xl:block">
            <div className="sticky top-28 flex flex-col items-start gap-4">
              <Link
                href="/blog"
                className="inline-flex min-h-[44px] items-center gap-2 font-asap text-[12px] font-bold uppercase tracking-[0.5px] text-voicesNext-secondary transition-colors hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
              >
                <ArrowLeft aria-hidden="true" size={15} />
                All posts
              </Link>
              <ShareButton title={post.title} />
            </div>
          </div>

          <article className="w-full max-w-[720px]">
            <Link
              href="/blog"
              className="inline-flex min-h-[44px] items-center gap-2 font-asap text-[12px] font-bold uppercase tracking-[0.5px] text-voicesNext-secondary transition-colors hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background xl:hidden"
            >
              <ArrowLeft aria-hidden="true" size={15} />
              All posts
            </Link>

            {post.categories && post.categories.length > 0 && (
              <div className="mb-5 mt-2 flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <CategoryStamp key={category} category={category} />
                ))}
              </div>
            )}

            {/* Gabarito sentence case rather than the site's Outfit Black
                uppercase page title: an editorial headline of any length
                becomes a wall in Outfit Black caps. The uppercase display
                voice stays on the eyebrows and stamps. */}
            <h1 className="text-balance font-gabarito text-[34px] font-bold leading-[1.05] text-voicesNext-cream md:text-[48px]">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-voicesNext-border pb-5">
              <BlogMeta
                author={post.author}
                publishedAt={post.publishedAt}
                readingTime={readingTime}
              />
              <div className="xl:hidden">
                <ShareButton title={post.title} />
              </div>
            </div>

            <div className="mt-8">
              <ArticleHero post={post} />
            </div>

            {post.excerpt && (
              <p className="mt-8 font-gabarito text-[19px] font-medium leading-[1.6] text-voicesNext-cream md:text-[21px]">
                {post.excerpt}
              </p>
            )}

            {relatedShow && <ListenWhileReading show={relatedShow} />}

            <div className="mt-8">
              {post.content && (
                <PortableText
                  value={post.content}
                  components={blogPortableTextComponents}
                />
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 border-t border-voicesNext-border pt-8">
                <h2 className="font-asap text-[12px] font-bold uppercase tracking-[0.5px] text-voicesNext-secondary">
                  Tagged
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-voicesNext-border px-[10px] py-[5px] font-asap text-[11px] font-bold uppercase leading-none tracking-[0.5px] text-voicesNext-secondary"
                    >
                      #{formatCategoryLabel(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {nextPost && (
              <div className="mt-14">
                <UpNext post={nextPost} />
              </div>
            )}
          </article>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-voicesNext-border pt-10">
            <h2 className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream md:text-[24px]">
              More like this
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard
                  key={relatedPost._id}
                  post={relatedPost}
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <BlogCta secondaryHref="/blog" secondaryLabel="More stories" />
    </div>
  );
}
