import type { Metadata } from "next";
import PodcastPageClient from "./podcast-page-client";

/**
 * Thin server wrapper around the client page so /podcast can declare its own
 * canonical — a "use client" module cannot export metadata.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/podcast" },
};

export default function PodcastPage() {
  return <PodcastPageClient />;
}
