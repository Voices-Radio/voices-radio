import type { Metadata } from "next";
import PodcastPageClient from "./podcast-page-client";

/**
 * Thin server wrapper around the client page so that /podcast can declare its
 * own canonical. The canonical used to live on app/podcast/layout.tsx, where
 * it was silently inherited by /podcast/blog and every post beneath it.
 *
 * Title, description and Open Graph still come from the layout's
 * generateMetadata, which reads them from Sanity.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/podcast" },
};

export default function PodcastPage() {
  return <PodcastPageClient />;
}
