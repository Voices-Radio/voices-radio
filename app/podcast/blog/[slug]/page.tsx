import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity.client";
import { blogPostQuery, blogPostsQuery, type BlogPost } from "@/sanity.queries";
import { PortableText } from "@portabletext/react";
import { Calendar, User, ArrowLeft, ArrowRight, Share2, Clock } from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await client.fetch(blogPostsQuery);
  return posts.map((post: BlogPost) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await client.fetch(blogPostQuery, { slug: params.slug });
  
  if (!post) {
    return {
      title: "Post Not Found | Voices Studio",
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const image = post.ogImage?.asset?.url || post.featuredImage.asset.url;

  return {
    title: `${title} | Voices Studio Blog`,
    description,
    keywords: post.keywords || ["podcast", "recording", "studio"],
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
  const post = await getBlogPost(params.slug);
  
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
      .map((block) => block.children?.map((child: any) => child.text).join("") || "")
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/podcast/blog"
              className="flex items-center text-slate-600 hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
            <Link
              href="/podcast"
              className="text-slate-600 hover:text-accent transition-colors"
            >
              Voices Studio
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.map((category) => (
              <span
                key={category}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}
              >
                {category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-slate-600">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>{readingTime} min read</span>
          </div>
          <button className="flex items-center text-accent hover:text-orange-700 transition-colors">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </button>
        </div>

        {/* Featured Image */}
        <div className="relative h-96 mb-12 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={post.featuredImage.asset.url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        {/* Excerpt */}
        <div className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
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
                        src={value.asset.url}
                        alt={value.alt || ""}
                        width={800}
                        height={400}
                        className="rounded-lg shadow-md"
                      />
                      {value.caption && (
                        <p className="text-sm text-slate-500 mt-2 text-center italic">
                          {value.caption}
                        </p>
                      )}
                    </div>
                  ),
                },
                block: {
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold text-slate-800 mt-12 mb-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-bold text-slate-800 mt-10 mb-4">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-xl font-bold text-slate-800 mt-8 mb-3">
                      {children}
                    </h4>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent pl-6 py-4 my-8 bg-slate-50 rounded-r-lg">
                      <p className="text-lg text-slate-700 italic">{children}</p>
                    </blockquote>
                  ),
                  normal: ({ children }) => (
                    <p className="text-lg text-slate-700 leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                },
                marks: {
                  link: ({ children, value }) => (
                    <a
                      href={value.href}
                      className="text-accent hover:text-orange-700 underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-800">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-700">{children}</em>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="list-disc list-inside mb-6 space-y-2 text-lg text-slate-700">
                      {children}
                    </ul>
                  ),
                  number: ({ children }) => (
                    <ol className="list-decimal list-inside mb-6 space-y-2 text-lg text-slate-700">
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
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/podcast/blog/${relatedPost.slug.current}`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={relatedPost.featuredImage.asset.url}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <User className="h-3 w-3 mr-1" />
                        {relatedPost.author}
                      </div>
                      <div className="flex items-center text-accent group-hover:text-orange-700 transition-colors">
                        <span className="text-sm font-medium">Read More</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Podcast?
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
              href="/podcast/blog"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-accent transition-all duration-300"
            >
              Read More Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
