import HomeFeaturePanel from "./components/redesign/home-feature-panel";
import LiveStack from "./components/redesign/live-stack";
import ShowRail from "./components/redesign/show-rail";
import SupporterBlock from "./components/redesign/supporter-block";
import { getHomePageContent } from "@/lib/voices/home";
import { VOICES_APPLY_FOR_SHOW_URL } from "@/lib/voices/config";
import Image from "next/image";

export default async function Home() {
  const { featuredItems, latestKx, latestEast, rails, liveStreams } =
    await getHomePageContent();

  return (
    <main className="pt-2 md:px-3 md:pt-3">
      <section className="grid w-full bg-voicesNext-background md:min-h-[632px] md:grid-cols-[316px_minmax(0,1fr)]">
        <div className="order-2 md:order-1">
          <LiveStack
            kxShow={latestKx[0]}
            eastShow={latestEast[0]}
            kxFallback={liveStreams.kx}
            eastFallback={liveStreams.east}
          />
        </div>
        <div className="order-1 md:order-2">
          <HomeFeaturePanel items={featuredItems} />
        </div>
      </section>

      {rails.slice(0, 2).map((rail) => (
        <ShowRail
          key={rail.key}
          title={rail.title}
          description={rail.description}
          shows={rail.shows}
        />
      ))}

      <section className="w-full py-10 md:py-[42px]">
        <div className="grid min-h-[290px] items-center bg-voicesNext-surface px-8 py-10 md:grid-cols-[1fr_1fr] md:px-[174px]">
          <div className="relative h-[201px] w-[204px] justify-self-center">
            <Image
              src="/VOICESLOGO_LIGHTBOX.png"
              alt=""
              fill
              sizes="204px"
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="max-w-[360px] justify-self-center text-center">
            <h2 className="font-gabarito text-[38px] font-bold leading-none text-voicesNext-cream">
              Voices picks
            </h2>
            <a
              href={VOICES_APPLY_FOR_SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-voicesNext-orange px-5 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface"
            >
              Apply for a show
            </a>
          </div>
        </div>
      </section>

      {rails.slice(2).map((rail) => (
        <ShowRail
          key={rail.key}
          title={rail.title}
          description={rail.description}
          shows={rail.shows}
        />
      ))}

      <SupporterBlock />
    </main>
  );
}
