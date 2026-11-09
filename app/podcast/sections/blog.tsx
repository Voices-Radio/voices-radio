import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogSection() {
  return (
    <>
      {/* Featured Blog Posts Section */}
      <section id="blog" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-slate-800 md:text-5xl">
              Latest Insights
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
              Discover expert tips, industry news, and studio updates to help
              you create better podcasts.
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for featured blog posts - will be populated when blog posts are created */}
            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Coming Soon
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                We&apos;re preparing amazing content about podcast recording,
                equipment reviews, and industry insights.
              </p>
              <Link
                href="/podcast/blog"
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-orange-700"
              >
                View Blog
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Expert Tips
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Learn professional recording techniques and equipment
                recommendations from our experienced team.
              </p>
              <Link
                href="/podcast/blog"
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-orange-700"
              >
                Read More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Industry News
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Stay updated with the latest podcast industry trends, technology
                updates, and market insights.
              </p>
              <Link
                href="/podcast/blog"
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-orange-700"
              >
                Explore
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/podcast/blog"
              className="inline-flex transform items-center rounded-full bg-accent px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-orange-700"
            >
              <span>View All Posts</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
