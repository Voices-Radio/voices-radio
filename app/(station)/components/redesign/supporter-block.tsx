import { cn, focusRingOnSurface } from "@/lib/utils";
import SupporterWall from "./supporter-wall";
import SupportImpactList from "./support-impact-list";
import SupportSignalMeter from "./support-signal-meter";

export default function SupporterBlock({
  supporterUrl,
  supporterNames = [],
}: {
  supporterUrl?: string | null;
  supporterNames?: string[];
}) {
  // Falls back to /join, not VOICES_APPLY_FOR_SHOW_URL (that's the
  // apply-to-host-a-show form) — see site-header.tsx for the same fix.
  const ctaUrl = supporterUrl || "/join";
  const hasWall = supporterNames.length > 0;

  return (
    <section className="border-y border-voicesNext-border bg-voicesNext-surface">
      <div className="mx-auto grid max-w-[1080px] gap-8 px-5 py-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center md:gap-12 md:px-8 md:py-14">
        {/* Message: eyebrow -> headline -> copy -> CTA, left-anchored so
            nothing floats in dead space. */}
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
            <a
              href={ctaUrl}
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center rounded-full bg-voicesNext-orangeButton px-7 font-gabarito text-[16px] font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background",
                focusRingOnSurface,
              )}
            >
              Become a Supporter
            </a>
            <p className="font-gabarito text-[13px] text-voicesNext-secondary">
              Cancel anytime · funds the station, not shareholders
            </p>
          </div>
        </div>

        {/* Signal readout: an inset "hardware" panel that always carries
            content — the live supporter wall, or what support pays for. */}
        <div className="flex flex-col gap-3 overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-background p-4 md:p-5">
          <SupportSignalMeter />
          {hasWall ? (
            <SupporterWall names={supporterNames} />
          ) : (
            <SupportImpactList />
          )}
        </div>
      </div>
    </section>
  );
}
