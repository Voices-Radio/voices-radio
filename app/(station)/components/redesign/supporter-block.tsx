import { cn } from "@/lib/utils";

export default function SupporterBlock({
  supporterUrl,
}: {
  supporterUrl?: string | null;
}) {
  const ctaClassName =
    "inline-flex h-[52px] w-full max-w-[228px] items-center justify-center rounded-full px-6 font-gabarito text-base font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface";

  return (
    <section className="border-y border-voicesNext-border bg-voicesNext-surface py-10 md:py-0">
      <div className="grid w-full items-center gap-8 md:min-h-[280px] md:grid-cols-[1fr_auto_1fr]">
        <div className="relative min-h-[46px] md:min-h-[280px]">
          <p className="font-gabarito text-[16px] font-bold uppercase leading-[19px] text-white md:absolute md:left-[37px] md:top-[27px] md:h-[19px] md:w-[106px]">
            Voices Radio
          </p>
        </div>

        {supporterUrl ? (
          <a
            href={supporterUrl}
            className={cn(
              ctaClassName,
              "bg-voicesNext-orange text-voicesNext-cream hover:bg-voicesNext-cream hover:text-voicesNext-background",
            )}
          >
            Become a Supporter
          </a>
        ) : (
          <span
            className={cn(
              ctaClassName,
              "cursor-not-allowed border border-voicesNext-border text-voicesNext-secondary",
            )}
            aria-disabled="true"
          >
            Become a Supporter
          </span>
        )}

        <p className="max-w-[333px] font-gabarito text-[16px] font-bold leading-tight text-voicesNext-cream md:justify-self-end">
          Voices Radio is a completely independent radio supporting local and
          international creatives. With a small monthly contribution, you can
          help keep Voices sustainable and receive supporter perks.
        </p>
      </div>
    </section>
  );
}
