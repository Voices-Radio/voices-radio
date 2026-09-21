import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
