import { VOICES_API_BASE_URL } from "@/lib/voices/config";
import { client } from "@/sanity.client";
import { groq } from "next-sanity";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  subtitle?: string;
  station?: string;
  tags?: string[];
};

type SearchCategories = {
  shows: SearchResult[];
  artists: SearchResult[];
  mainBlog: SearchResult[];
  podcastBlog: SearchResult[];
};

type WebsiteSearchResponse = {
  query: string;
  categories?: {
    shows?: SearchResult[];
    artists?: SearchResult[];
  };
  success?: boolean;
  message?: string;
};

type BlogSearchDocument = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  author?: string;
  categories?: string[];
  tags?: string[];
  imageUrl?: string;
};

const mainBlogSearchQuery = groq`*[
  _type == "mainBlog" &&
  status == "published" &&
  (
    title match $term ||
    excerpt match $term ||
    author match $term ||
    categories match $term ||
    tags match $term
  )
] | order(publishedAt desc)[0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  author,
  categories,
  tags,
  "imageUrl": featuredImage.asset->url
}`;

const podcastBlogSearchQuery = groq`*[
  _type == "blog" &&
  status == "published" &&
  (
    title match $term ||
    excerpt match $term ||
    author match $term ||
    categories match $term ||
    tags match $term
  )
] | order(publishedAt desc)[0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  author,
  categories,
  tags,
  "imageUrl": featuredImage.asset->url
}`;

function getLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 5;
  return Math.min(parsed, 10);
}

function getSanityMatchTerm(query: string) {
  const normalized = query
    .replace(/[^A-Za-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized ? `${normalized}*` : "__no_sanity_match__";
}

function normalizeBlogResult(
  post: BlogSearchDocument,
  basePath: "/blog" | "/podcast/blog",
): SearchResult | null {
  const slug = post.slug?.current;
  if (!post.title || !slug) return null;

  return {
    id: post._id,
    title: post.title,
    description: post.excerpt ?? "",
    url: `${basePath}/${slug}`,
    imageUrl: post.imageUrl,
    subtitle: post.author,
    tags: [...(post.categories ?? []), ...(post.tags ?? [])].slice(0, 6),
  };
}

async function fetchWebsiteSearch(query: string, limit: number) {
  const upstreamUrl = new URL("/api/website/search", VOICES_API_BASE_URL);
  upstreamUrl.searchParams.set("q", query);
  upstreamUrl.searchParams.set("limit", String(limit));
  upstreamUrl.searchParams.set("types", "shows,artists");

  const response = await fetch(upstreamUrl, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  const payload = (await response
    .json()
    .catch(() => null)) as WebsiteSearchResponse | null;

  if (!response.ok) {
    throw new Error(
      payload?.message ?? `Website search failed with ${response.status}.`,
    );
  }

  return payload?.categories ?? {};
}

async function fetchWebsiteSearchSafe(query: string, limit: number) {
  try {
    return await fetchWebsiteSearch(query, limit);
  } catch (error) {
    console.error("Website show/artist search unavailable:", error);
    return {};
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = getLimit(searchParams.get("limit"));

  if (query.length < 2) {
    return NextResponse.json(
      {
        success: false,
        message: "Search query must be at least 2 characters.",
      },
      { status: 400 },
    );
  }

  try {
    const term = getSanityMatchTerm(query);
    const [websiteCategories, mainBlog, podcastBlog] = await Promise.all([
      fetchWebsiteSearchSafe(query, limit),
      client.fetch<BlogSearchDocument[]>(mainBlogSearchQuery, { term, limit }),
      client.fetch<BlogSearchDocument[]>(podcastBlogSearchQuery, {
        term,
        limit,
      }),
    ]);
    const categories: SearchCategories = {
      shows: websiteCategories.shows ?? [],
      artists: websiteCategories.artists ?? [],
      mainBlog: mainBlog
        .map((post) => normalizeBlogResult(post, "/blog"))
        .filter((post): post is SearchResult => Boolean(post)),
      podcastBlog: podcastBlog
        .map((post) => normalizeBlogResult(post, "/podcast/blog"))
        .filter((post): post is SearchResult => Boolean(post)),
    };

    return NextResponse.json({ query, categories });
  } catch (error) {
    console.error("Website search proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Search is unavailable." },
      { status: 502 },
    );
  }
}
