import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity.client";
import { blogPostQuery, blogPostsQuery, type BlogPost } from "@/sanity.queries";
import { PortableText } from "@portabletext/react";
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Clock,
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await client.fetch(blogPostsQuery);
  return posts.map((post: BlogPost) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(blogPostQuery, { slug });

  if (!post) {
    return {
      title: "Post Not Found | Voices Studio",
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image =
    post.ogImage?.asset?.url ||
    post.featuredImage?.asset?.url ||
    "/studio-1.jpg";

  return {
    title: `${title} | Voices Studio Blog`,
    description,
    keywords: post.keywords || ["podcast", "recording", "studio"],
    alternates: { canonical: `/podcast/blog/${slug}` },
    openGraph: {
      title: `${title} | Voices Studio Blog`,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Voices Studio Blog`,
      description,
      images: [image],
    },
  };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return await client.fetch(blogPostQuery, { slug });
}

async function getRelatedPosts(currentPost: BlogPost): Promise<BlogPost[]> {
  const allPosts = await client.fetch(blogPostsQuery);
  return allPosts
    .filter((post: BlogPost) => post._id !== currentPost._id)
    .slice(0, 3);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "podcast-tips": "bg-blue-100 text-blue-800",
      "studio-updates": "bg-green-100 text-green-800",
      "industry-news": "bg-purple-100 text-purple-800",
      "equipment-reviews": "bg-orange-100 text-orange-800",
      "guest-interviews": "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const estimateReadingTime = (content: any[]) => {
    const text = content
      .filter((block) => block._type === "block")
      .map(
        (block) =>
          block.children?.map((child: any) => child.text).join("") || "",
      )
      .join(" ");
    const wordsPerMinute = 200;
    const wordCount = text.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const readingTime = post.content ? estimateReadingTime(post.content) : 5;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/podcast/blog"
              className="flex items-center text-slate-600 transition-colors hover:text-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
            <Link
              href="/podcast"
              className="text-slate-600 transition-colors hover:text-accent"
            >
              Voices Studio
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <span
                key={category}
                className={`rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(category)}`}
              >
                {category
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-800 sm:text-5xl">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="mb-8 flex flex-wrap items-center gap-6 text-slate-600">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            <span>{readingTime} min read</span>
          </div>
          <button className="flex items-center text-accent transition-colors hover:text-orange-700">
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </button>
        </div>

        {/* Featured Image */}
        <div className="relative mb-12 h-96 overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={post.featuredImage?.asset?.url || "/studio-1.jpg"}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        {/* Excerpt */}
        <div className="mb-12 text-xl font-medium leading-relaxed text-slate-600">
          {post.excerpt}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content && (
            <PortableText
              value={post.content}
              components={{
                types: {
                  image: ({ value }) => (
                    <div className="my-8">
                      <Image
                        src={value.asset?.url || "/studio-1.jpg"}
                        alt={value.alt || ""}
                        width={800}
                        height={400}
                        className="rounded-lg shadow-md"
                      />
                      {value.caption && (
                        <p className="mt-2 text-center text-sm italic text-slate-500">
                          {value.caption}
                        </p>
                      )}
                    </div>
                  ),
                },
                block: {
                  h2: ({ children }) => (
                    <h2 className="mb-6 mt-12 text-3xl font-bold text-slate-800">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-4 mt-10 text-2xl font-bold text-slate-800">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="mb-3 mt-8 text-xl font-bold text-slate-800">
                      {children}
                    </h4>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-8 rounded-r-lg border-l-4 border-accent bg-slate-50 py-4 pl-6">
                      <p className="text-lg italic text-slate-700">
                        {children}
                      </p>
                    </blockquote>
                  ),
                  normal: ({ children }) => (
                    <p className="mb-6 text-lg leading-relaxed text-slate-700">
                      {children}
                    </p>
                  ),
                },
                marks: {
                  link: ({ children, value }) => (
                    <a
                      href={value.href}
                      className="font-medium text-accent underline hover:text-orange-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-800">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-700">{children}</em>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="mb-6 list-inside list-disc space-y-2 text-lg text-slate-700">
                      {children}
                    </ul>
                  ),
                  number: ({ children }) => (
                    <ol className="mb-6 list-inside list-decimal space-y-2 text-lg text-slate-700">
                      {children}
                    </ol>
                  ),
                },
              }}
            />
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/podcast/blog/${relatedPost.slug.current}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="relative h-48">
                    <Image
                      src={
                        relatedPost.featuredImage?.asset?.url || "/studio-1.jpg"
                      }
                      alt={relatedPost.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-accent">
                      {relatedPost.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-slate-600">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <User className="mr-1 h-3 w-3" />
                        {relatedPost.author}
                      </div>
                      <div className="flex items-center text-accent transition-colors group-hover:text-orange-700">
                        <span className="text-sm font-medium">Read More</span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent to-orange-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Create Your Podcast?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-white/90">
            Book our professional studio and bring your podcast ideas to life
            with state-of-the-art equipment and expert support.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card"
              target="_blank"
              rel="noopener noreferrer"
              className="transform rounded-full bg-white px-8 py-4 text-lg font-bold text-accent shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            >
              Book Studio Now
            </Link>
            <Link
              href="/podcast/blog"
              className="rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-white hover:text-accent"
            >
              Read More Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
