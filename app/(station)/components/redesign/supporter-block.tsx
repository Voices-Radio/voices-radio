import Image from "next/image";
import { cn } from "@/lib/utils";
import SupporterWall from "./supporter-wall";

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
  const ctaClassName =
    "inline-flex min-h-[52px] w-full max-w-[228px] items-center justify-center rounded-full px-6 py-2 text-center font-gabarito text-[20px] font-medium leading-tight text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface md:text-base md:font-bold";

  return (
    // flex-col (rather than the row default) so the supporter-wall row below
    // can stack under the grid on mobile too — with zero or one visible
    // children (today, or whenever supporterNames is empty) this is
    // indistinguishable from the previous row-based layout.
    <section className="flex flex-col justify-center py-10 md:block md:border-y md:border-voicesNext-border md:bg-voicesNext-surface md:py-0">
      <div className="grid min-h-[302px] w-[calc(100vw-16px)] max-w-[377px] items-center justify-items-center gap-[45px] overflow-hidden bg-voicesNext-surface px-16 py-[33px] md:min-h-[280px] md:w-full md:max-w-none md:grid-cols-[1fr_auto_1fr] md:justify-items-stretch md:gap-8 md:px-0 md:py-0">
        <div className="relative hidden min-h-[46px] md:block md:min-h-[280px]">
          <p className="font-gabarito text-[16px] font-bold uppercase leading-[19px] text-white md:absolute md:left-[37px] md:top-[27px] md:h-[19px] md:w-[106px]">
            Voices Radio
          </p>
        </div>

        <div className="relative h-[125px] w-[125px] md:hidden">
          <Image
            src="/VOICESLOGO_LIGHTBOX.png"
            alt=""
            fill
            sizes="125px"
            className="object-contain"
          />
        </div>

        <a
          href={ctaUrl}
          className={cn(
            ctaClassName,
            "bg-voicesNext-orange hover:bg-voicesNext-cream hover:text-voicesNext-background",
          )}
        >
          Become a Supporter
        </a>

        <p className="hidden max-w-[333px] font-gabarito text-[16px] font-bold leading-tight text-voicesNext-cream md:block md:justify-self-end">
          Voices Radio is a completely independent radio supporting local and
          international creatives. With a small monthly contribution, you can
          help keep Voices sustainable and receive supporter perks.
        </p>
      </div>

      {supporterNames.length > 0 ? (
        <div className="mt-8 w-full px-4 md:mt-0 md:border-t md:border-voicesNext-border md:bg-voicesNext-surface md:px-0 md:py-6">
          <SupporterWall names={supporterNames} />
        </div>
      ) : null}
    </section>
  );
}
