import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity.client";
import { mainBlogPostsQuery, type MainBlogPost } from "@/sanity.queries";
import { Calendar, User, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Voices Radio - Community News & Updates",
  description: "Stay updated with the latest news, events, and stories from Voices Radio. Discover community highlights, music features, and behind-the-scenes content.",
  keywords: ["voices radio", "community radio", "london radio", "music blog", "community news"],
  openGraph: {
    title: "Blog | Voices Radio - Community News & Updates",
    description: "Stay updated with the latest news, events, and stories from Voices Radio.",
    type: "website",
  },
};

async function getBlogPosts(): Promise<MainBlogPost[]> {
  return await client.fetch(mainBlogPostsQuery);
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
      "news": "bg-blue-100 text-blue-800",
      "community": "bg-green-100 text-green-800",
      "events": "bg-purple-100 text-purple-800",
      "music": "bg-orange-100 text-orange-800",
      "interviews": "bg-pink-100 text-pink-800",
      "behind-the-scenes": "bg-yellow-100 text-yellow-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black to-slate-800 pt-32 pb-16 lg:pt-28 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Voices Radio Blog
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Stories, news, and updates from our community. 
              Discover the latest happenings at Voices Radio and beyond.
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
                  href="/"
                  className="inline-flex items-center bg-voices-red text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
                >
                  Back to Home
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
                              <span className="bg-voices-red text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                                href={`/blog/${post.slug.current}`}
                                className="text-voices-red hover:text-red-600 font-semibold flex items-center"
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
                            href={`/blog/${post.slug.current}`}
                            className="text-voices-red hover:text-red-600 font-semibold text-sm flex items-center"
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
      <section className="bg-gradient-to-r from-voices-red to-red-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to Get Involved?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join our community of passionate music lovers and creators. Apply to become part of the Voices Radio family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="bg-white text-voices-red px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Learn About Us
            </Link>
            <Link
              href="/"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-voices-red transition-all duration-300"
            >
              Listen Live
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
