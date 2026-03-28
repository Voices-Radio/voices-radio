import type { MetadataRoute } from "next";
import { client } from "@/sanity.client";
import { getBaseUrl } from "@/lib/site-url";
import {
  mainBlogSitemapQuery,
  podcastBlogSitemapQuery,
} from "@/sanity.queries";

type SitemapDoc = { slug: string; lastModified: string };

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const [mainBlogRows, podcastBlogRows] = await Promise.all([
    client.fetch<SitemapDoc[]>(mainBlogSitemapQuery),
    client.fetch<SitemapDoc[]>(podcastBlogSitemapQuery),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/podcast`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/podcast/blog`, changeFrequency: "daily", priority: 0.85 },
    { url: `${base}/chat`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const mainBlogEntries: MetadataRoute.Sitemap = mainBlogRows.map((row) => ({
    url: `${base}/blog/${row.slug}`,
    lastModified: new Date(row.lastModified),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const podcastBlogEntries: MetadataRoute.Sitemap = podcastBlogRows.map(
    (row) => ({
      url: `${base}/podcast/blog/${row.slug}`,
      lastModified: new Date(row.lastModified),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }),
  );

  return [...staticRoutes, ...mainBlogEntries, ...podcastBlogEntries];
}
