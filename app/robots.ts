import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site-url";

const DISALLOWED = ["/studio/", "/api/"];

// Named explicitly so the intent to be cited by AI search is on record
// (carried over from the pre-redesign site).
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();

  if (process.env.NEXT_PUBLIC_SITE_ENV !== "production") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOWED },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
