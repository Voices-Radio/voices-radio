import HomeFeaturePanel from "./components/redesign/home-feature-panel";
import LiveStack from "./components/redesign/live-stack";
import ShowRail from "./components/redesign/show-rail";
import GetInvolvedBlock from "./components/redesign/get-involved-block";
import PartnersStrip from "./components/redesign/partners-strip";
import { getSettings } from "@/sanity.client";
import { getHomePageContent } from "@/lib/voices/home";
import { VOICES_APPLY_FOR_SHOW_URL } from "@/lib/voices/config";
import { getSupporters } from "@/lib/voices/membership/membership-client";
import type { Metadata } from "next";
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  // Fails soft (getSupporters) — a failed/unavailable request renders the
  // supporter strip exactly as it looked before the wall existed, never
  // breaks the homepage. Fetched alongside the rest so it adds no latency.
  const [
    { featuredItems, latestKx, featured, applyBanner, swimlanes, liveStreams },
    settings,
    supportersResult,
  ] = await Promise.all([
    getHomePageContent(),
    getSettings(),
    getSupporters(),
  ]);
  const applyUrl = settings?.apply_link || VOICES_APPLY_FOR_SHOW_URL;
  const supporterNames = supportersResult.ok ? supportersResult.data : [];

  return (
    <main id="main-content" className="scroll-mt-24 md:px-3 md:pt-3">
      <h1 className="sr-only">
        Voices Radio — live community radio from London
      </h1>
      <section className="mb-6 grid w-full gap-5 bg-voicesNext-background md:mb-0 md:min-h-[632px] md:grid-cols-[316px_minmax(0,1fr)] md:gap-0">
        <div className="order-1 hidden md:block">
          <LiveStack
            kxFallback={liveStreams.kx}
            eastFallback={liveStreams.east}
          />
        </div>
        <div className="order-2">
          <HomeFeaturePanel items={featuredItems} />
        </div>
      </section>

      <ShowRail
        title={latestKx.title}
        description={latestKx.description}
        shows={latestKx.shows}
      />

      {featured.shows.length > 0 && (
        <ShowRail
          title={featured.title}
          description={featured.description}
          shows={featured.shows}
        />
      )}

      {swimlanes.map((rail) => (
        <ShowRail
          key={rail.key}
          title={rail.title}
          description={rail.description}
          shows={rail.shows}
        />
      ))}

      <GetInvolvedBlock
        applyBanner={applyBanner}
        applyUrl={applyUrl}
        supporterNames={supporterNames}
      />
      <PartnersStrip />
    </main>
  );
}
