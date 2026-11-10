import Image from "next/image";
import { cn, focusRingOnSurface } from "@/lib/utils";
import SupporterWall from "./supporter-wall";
import SupportImpactList from "./support-impact-list";
import SupportSignalMeter from "./support-signal-meter";

const ctaClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-full bg-voicesNext-orangeButton px-7 font-gabarito text-[16px] font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background";

export default function GetInvolvedBlock({
  applyBanner,
  applyUrl,
  supporterUrl,
  supporterNames = [],
}: {
  applyBanner: { heading: string; mobileBody: string; ctaText: string };
  applyUrl: string;
  supporterUrl?: string | null;
  supporterNames?: string[];
}) {
  // Falls back to /join, not the apply-to-host-a-show form.
  const ctaUrl = supporterUrl || "/join";
  const hasWall = supporterNames.length > 0;

  return (
    <section className="border-y border-voicesNext-border bg-voicesNext-surface">
      <div className="mx-auto grid max-w-[1080px] gap-12 px-5 py-12 md:grid-cols-2 md:gap-12 md:px-8 md:py-14">
        <div className="flex flex-col">
          <p className="flex items-center gap-2 font-asap text-[13px] font-bold uppercase tracking-[0.14em] text-voicesNext-orangeText">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-voicesNext-orange"
            />
            Listener-funded · Non-profit
          </p>
          <h2 className="mt-3 font-outfit text-[28px] font-black uppercase leading-[0.95] text-voicesNext-cream md:text-[38px]">
            Become a Supporter
          </h2>
          <p className="mt-4 max-w-[44ch] font-gabarito text-[15px] leading-relaxed text-voicesNext-cream md:text-base">
            Voices Radio is a completely independent radio supporting local and
            international creatives. With a small monthly contribution, you can
            help keep Voices sustainable and receive supporter perks.
          </p>
          <div className="mt-6 flex flex-col items-start gap-2">
            <a href={ctaUrl} className={cn(ctaClass, focusRingOnSurface)}>
              Become a Supporter
            </a>
            <p className="font-gabarito text-[13px] text-voicesNext-secondary">
              Cancel anytime · funds the station, not shareholders
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-background p-4 md:p-5">
            <SupportSignalMeter />
            {hasWall ? (
              <SupporterWall names={supporterNames} />
            ) : (
              <SupportImpactList />
            )}
          </div>
        </div>

        <div className="flex flex-col border-t border-voicesNext-border pt-12 md:border-l md:border-t-0 md:pl-12 md:pt-0">
          <div className="relative h-16 w-16 md:h-20 md:w-20">
            <Image
              src="/VOICESLOGO_LIGHTBOX.png"
              alt=""
              fill
              sizes="80px"
              className="object-contain brightness-0 invert"
            />
          </div>
          <h2 className="mt-5 font-outfit text-[28px] font-black uppercase leading-[0.95] text-voicesNext-cream md:text-[38px]">
            {applyBanner.heading}
          </h2>
          <p className="mt-4 max-w-[44ch] font-gabarito text-[15px] leading-relaxed text-voicesNext-cream md:text-base">
            {applyBanner.mobileBody}
          </p>
          <div className="mt-6">
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ctaClass, focusRingOnSurface)}
            >
              {applyBanner.ctaText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
