import type { Metadata } from "next";
import PodcastPageContent from "./podcast-page";

/**
 * Route entry for /podcast: declares the page's own canonical.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/podcast" },
};

export default function PodcastPage() {
  return <PodcastPageContent />;
}
