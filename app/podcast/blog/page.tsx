import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity.client";
import { blogPostsQuery, type BlogPost } from "@/sanity.queries";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { PortableText } from "@portabletext/react";

export const metadata: Metadata = {
  title: "Blog | Voices Studio - Podcast Recording Tips & Industry News",
  description: "Discover expert podcast recording tips, studio updates, and industry insights from Voices Studio. Learn how to create professional podcasts with our comprehensive guides.",
  keywords: ["podcast tips", "recording studio", "podcast equipment", "audio production", "podcast industry"],
  openGraph: {
    title: "Blog | Voices Studio - Podcast Recording Tips & Industry News",
    description: "Discover expert podcast recording tips, studio updates, and industry insights from Voices Studio.",
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Voices Studio Blog
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Expert insights, recording tips, and industry news to help you create professional podcasts. 
              Learn from our experience and stay updated with the latest in podcast production.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {blogPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">No Blog Posts Yet</h2>
                <p className="text-slate-600 mb-6">
                  We're working on creating amazing content for you. Check back soon!
                </p>
                <Link 
                  href="/podcast"
                  className="inline-flex items-center bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors"
                >
                  Back to Studio
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {blogPosts.filter(post => post.featured).length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Featured Posts</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {blogPosts
                      .filter(post => post.featured)
                      .slice(0, 2)
                      .map((post) => (
                        <article 
                          key={post._id}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="relative h-64">
                            <Image
                              src={post.featuredImage?.asset?.url || "/studio-1.jpg"}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Featured
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.categories?.map((category) => (
                                <span
                                  key={category}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                                >
                                  {category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-slate-600 mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {post.author}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(post.publishedAt)}
                                </div>
                              </div>
                              <Link
                                href={`/podcast/blog/${post.slug.current}`}
                                className="text-accent hover:text-orange-700 font-semibold flex items-center"
                              >
                                Read More
                                <ArrowRight className="h-4 w-4 ml-1" />
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
                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                  {blogPosts.filter(post => post.featured).length > 0 ? "All Posts" : "Latest Posts"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogPosts.map((post) => (
                    <article 
                      key={post._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48">
                        <Image
                          src={post.featuredImage?.asset?.url || "/studio-1.jpg"}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories?.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                            >
                              {category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {post.author}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(post.publishedAt)}
                            </div>
                          </div>
                          <Link
                            href={`/podcast/blog/${post.slug.current}`}
                            className="text-accent hover:text-orange-700 font-semibold text-sm flex items-center"
                          >
                            Read More
                            <ArrowRight className="h-3 w-3 ml-1" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Podcast Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Book our professional studio and bring your podcast ideas to life with state-of-the-art equipment and expert support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-accent px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book Studio Now
            </Link>
            <Link
              href="/podcast"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-accent transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
