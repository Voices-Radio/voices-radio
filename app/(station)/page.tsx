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
    <main id="main-content" className="scroll-mt-24 md:px-3 md:pt-3">
      <h1 className="sr-only">
        Voices Radio — live community radio from London
      </h1>
      <section className="grid w-full gap-5 bg-voicesNext-background md:min-h-[632px] md:grid-cols-[316px_minmax(0,1fr)] md:gap-0">
        <div className="order-1 hidden md:block">
          <LiveStack
            kxShow={latestKx[0]}
            eastShow={latestEast[0]}
            kxFallback={liveStreams.kx}
            eastFallback={liveStreams.east}
          />
        </div>
        <div className="order-2">
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

      <section className="flex w-full justify-center py-10 md:block md:py-[42px]">
        <div className="grid min-h-[290px] w-[calc(100vw-16px)] max-w-[377px] items-center justify-items-center bg-voicesNext-surface px-10 py-5 md:min-h-[290px] md:w-full md:max-w-none md:grid-cols-[1fr_1fr] md:px-[174px] md:py-10">
          <div className="relative h-[79px] w-20 justify-self-center md:h-[201px] md:w-[204px]">
            <Image
              src="/VOICESLOGO_LIGHTBOX.png"
              alt=""
              fill
              sizes="(min-width: 768px) 204px, 80px"
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="max-w-[297px] justify-self-center text-center md:max-w-[360px]">
            <h2 className="font-gabarito text-[16px] font-normal leading-tight text-voicesNext-cream md:text-[38px] md:font-bold md:leading-none">
              <span className="md:hidden">
                Voices is one of the UK&apos;s fastest-growing community radio
                stations. If you&apos;re passionate about sharing your ideas,
                apply to join our community of radio presenters, hosts and DJs.
              </span>
              <span className="hidden md:inline">Voices picks</span>
            </h2>
            <a
              href={VOICES_APPLY_FOR_SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[10px] inline-flex h-9 items-center justify-center rounded-full bg-voicesNext-orange px-5 font-gabarito text-[16px] font-medium text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface md:mt-6 md:text-sm md:font-bold"
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
