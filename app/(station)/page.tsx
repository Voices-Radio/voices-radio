import NowPlaying from "@/components/now-playing";
import Schedule from "@/components/schedule";
import Link from "next/link";
import { Suspense } from "react";
import PartnersSection from "./partners";
import { ErrorBoundary } from "react-error-boundary";

export const runtime = "edge";

export const revalidate = 1;

export default async function Home() {
  return (
    <main>
      <nav>
        <Link href="/about">About</Link>
      </nav>

      <section>
        <Suspense fallback={<p>Loading Now Playing...</p>}>
          <ErrorBoundary fallback={<p>Now Playing Broke :/</p>}>
            {/* @ts-ignore */}
            <NowPlaying />
          </ErrorBoundary>
        </Suspense>
      </section>

      <section>
        <Suspense fallback={<p>Loading Schedule...</p>}>
          {/* @ts-ignore */}
          <Schedule />
        </Suspense>
      </section>

      {/* @ts-ignore */}
      <PartnersSection />
    </main>
  );
}
