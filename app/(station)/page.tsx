import Badge from "@/components/badge";
import ScheduleButton from "@/components/schedule/button";
import ScheduleDialog from "@/components/schedule/dialog";
import ScrollAfforance from "@/components/scroll-affordance";
import VoicesBackground from "@/components/voices-background";
import { getHome } from "@/sanity.client";
import Image from "next/image";
import ApplySection from "./apply";
import CommunitySection from "./community";
import PartnersSection from "./partners";

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

          <div className="relative p-16 md:pt-36">
            <VoicesBackground />

            <div className="relative flex flex-col items-center gap-4">
              <Image
                alt="Voices Logo"
                className="invert"
                height={462}
                src="/voices.svg"
                width={430}
                priority
                draggable={false}
              />

              <div className="hidden justify-center gap-2.5 md:flex">
                <Badge>Community</Badge>
                <Badge>Radio</Badge>
                <Badge>London</Badge>
              </div>

              <p className="whitespace-pre-line text-center text-inter-text">
                {home.schedule}
              </p>

              <div className="flex justify-center md:hidden">
                <ScheduleButton classNames="text-mobile-inter-text py-3 px-12">
                  {/* @ts-expect-error Async Server Components */}
                  <ScheduleDialog />
                </ScheduleButton>
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
