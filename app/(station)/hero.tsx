import Badge from "@/components/badge";
import ScheduleButton from "@/components/schedule/button";
import ScrollAfforance from "@/components/scroll-affordance";
import VoicesBackground from "@/components/voices-background";
import { getHome } from "@/sanity.client";
import Image from "next/image";

export default async function HeroSection() {
  const home = await getHome();

  return (
    <section className="relative">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-square lg:aspect-auto">
          <video
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            preload="none"
          >
            <source src="/video-2.webm" type="video/webm" />
            <source src="/video-2.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative p-16 lg:pt-36">
          <VoicesBackground />

          <div className="relative flex flex-col items-center gap-4 text-white mix-blend-exclusion">
            <Image
              alt="Voices Logo"
              className="invert"
              height={462}
              src="/voices.svg"
              width={430}
              priority
              draggable={false}
            />

            <div className="hidden justify-center gap-2.5 lg:flex">
              <Badge>Community</Badge>
              <Badge>Radio</Badge>
              <Badge>London</Badge>
            </div>

            <p className="whitespace-pre-line text-center text-inter-text">
              {home.schedule}
            </p>
          </div>

          <div className="relative mt-4 flex justify-center lg:hidden">
            <ScheduleButton classNames="text-mobile-inter-text py-3 px-12" />
          </div>
        </div>
      </div>

      <ScrollAfforance target="#community" />
    </section>
  );
}
