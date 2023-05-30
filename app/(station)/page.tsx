import Badge from "@/components/badge";
import ScrollAfforance from "@/components/scroll-affordance";
import VoicesBackground from "@/components/voices-background";
import { getHome } from "@/sanity.client";
import Image from "next/image";
import ApplySection from "./apply";
import PartnersSection from "./partners";
import CommunitySection from "./community";
import Schedule from "@/components/schedule";
import ScheduleContent from "@/components/schedule-content";

export const runtime = "edge";

export const revalidate = 10;

export default async function Home() {
  const home = await getHome();

  return (
    <main>
      <section className="relative">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto">
            <Image
              alt=""
              className="object-cover object-center"
              draggable={false}
              fill
              priority
              src="/brutalism.jpeg"
            />
          </div>

          <div className="p-16 md:pt-36 relative">
            <VoicesBackground />

            <div className="relative flex flex-col gap-4 items-center">
              <Image
                alt="Voices Logo"
                className="invert"
                height={462}
                src="/voices.svg"
                width={430}
                priority
                draggable={false}
              />

              <div className="hidden md:flex gap-2.5 justify-center">
                <Badge>Community</Badge>
                <Badge>Radio</Badge>
                <Badge>London</Badge>
              </div>

              <p className="whitespace-pre-line text-center text-inter-text">
                {home.schedule}
              </p>

              <div className="md:hidden flex justify-center">
                <Schedule classNames="text-mobile-inter-text py-3 px-12">
                  {/* @ts-expect-error Async Server Components */}
                  <ScheduleContent />
                </Schedule>
              </div>
            </div>
          </div>
        </div>

        <ScrollAfforance target="#community" />
      </section>

      {/* @ts-expect-error Async Server Components */}
      <CommunitySection />

      {/* @ts-expect-error Async Server Components */}
      <ApplySection />

      {/* @ts-expect-error Async Server Components */}
      <PartnersSection />
    </main>
  );
}
