import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity.client";
import { blogPostsQuery, type BlogPost } from "@/sanity.queries";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { PortableText } from "@portabletext/react";

export const metadata: Metadata = {
  title: "Blog | Voices Studio - Podcast Recording Tips & Industry News",
  description:
    "Discover expert podcast recording tips, studio updates, and industry insights from Voices Studio. Learn how to create professional podcasts with our comprehensive guides.",
  keywords: [
    "podcast tips",
    "recording studio",
    "podcast equipment",
    "audio production",
    "podcast industry",
  ],
  openGraph: {
    title: "Blog | Voices Studio - Podcast Recording Tips & Industry News",
    description:
      "Discover expert podcast recording tips, studio updates, and industry insights from Voices Studio.",
    type: "website",
  },
};

async function getBlogPosts(): Promise<BlogPost[]> {
  return await client.fetch(blogPostsQuery);
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Voices Studio Blog
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-200">
              Expert insights, recording tips, and industry news to help you
              create professional podcasts. Learn from our experience and stay
              updated with the latest in podcast production.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {blogPosts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="rounded-2xl bg-white p-12 shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-slate-800">
                  No Blog Posts Yet
                </h2>
                <p className="mb-6 text-slate-600">
                  We&apos;re working on creating amazing content for you. Check
                  back soon!
                </p>
                <Link
                  href="/podcast"
                  className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Back to Studio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {blogPosts.filter((post) => post.featured).length > 0 && (
                <div className="mb-16">
                  <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">
                    Featured Posts
                  </h2>
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {blogPosts
                      .filter((post) => post.featured)
                      .slice(0, 2)
                      .map((post) => (
                        <article
                          key={post._id}
                          className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
                        >
                          <div className="relative h-64">
                            <Image
                              src={
                                post.featuredImage?.asset?.url ||
                                "/studio-1.jpg"
                              }
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute left-4 top-4">
                              <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-white">
                                Featured
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="mb-4 flex flex-wrap gap-2">
                              {post.categories?.map((category) => (
                                <span
                                  key={category}
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(
                                    category,
                                  )}`}
                                >
                                  {category
                                    .replace("-", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                            <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-800">
                              {post.title}
                            </h3>
                            <p className="mb-4 line-clamp-3 text-slate-600">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <div className="flex items-center">
                                  <User className="mr-1 h-4 w-4" />
                                  {post.author}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="mr-1 h-4 w-4" />
                                  {formatDate(post.publishedAt)}
                                </div>
                              </div>
                              <Link
                                href={`/podcast/blog/${post.slug.current}`}
                                className="flex items-center font-semibold text-accent hover:text-orange-700"
                              >
                                Read More
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              )}

              {/* All Posts */}
              <div className="mb-8">
                <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">
                  {blogPosts.filter((post) => post.featured).length > 0
                    ? "All Posts"
                    : "Latest Posts"}
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {blogPosts.map((post) => (
                    <article
                      key={post._id}
                      className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                    >
                      <div className="relative h-48">
                        <Image
                          src={
                            post.featuredImage?.asset?.url || "/studio-1.jpg"
                          }
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex flex-wrap gap-2">
                          {post.categories?.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(
                                category,
                              )}`}
                            >
                              {category
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-800">
                          {post.title}
                        </h3>
                        <p className="mb-4 line-clamp-3 text-sm text-slate-600">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <div className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              {post.author}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(post.publishedAt)}
                            </div>
                          </div>
                          <Link
                            href={`/podcast/blog/${post.slug.current}`}
                            className="flex items-center text-sm font-semibold text-accent hover:text-orange-700"
                          >
                            Read More
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent to-orange-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Start Your Podcast Journey?
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
              href="/podcast"
              className="rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-white hover:text-accent"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
