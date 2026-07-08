import { Radio } from "lucide-react";

export function EastComingSoonCard() {
  return (
    <article
      className="relative h-[316px] overflow-hidden bg-voicesNext-orange text-voicesNext-cream"
      aria-labelledby="east-coming-soon-title"
    >
      <div className="flex h-[34px] items-center justify-between bg-voicesNext-cream px-[14px] text-voicesNext-background">
        <span className="font-outfit text-[24px] font-black uppercase leading-none tracking-[1px]">
          East
        </span>
        <span className="font-asap text-[10px] font-bold uppercase tracking-[1.5px]">
          New frequency
        </span>
      </div>

      <div className="h-[13px] overflow-hidden border-y border-voicesNext-cream bg-voicesNext-background font-outfit text-[10px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-cream">
        <div className="voices-coming-soon-marquee flex w-max items-center gap-[8px] px-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="flex shrink-0 items-center gap-[8px]">
              <span>Incoming transmission</span>
              <span className="h-1.5 w-1.5 rounded-full bg-voicesNext-orange" />
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex h-[269px] items-center justify-center overflow-hidden">
        <div className="voices-east-orbit border-voicesNext-cream/35 absolute h-[230px] w-[230px] rounded-full border" />
        <div className="voices-east-orbit voices-east-orbit-delayed border-voicesNext-cream/45 absolute h-[166px] w-[166px] rounded-full border" />
        <div className="voices-east-signal absolute h-[92px] w-[92px] rounded-full bg-voicesNext-background" />
        <Radio
          aria-hidden="true"
          className="relative z-10 text-voicesNext-cream"
          size={42}
          strokeWidth={1.8}
        />

        <div className="absolute inset-x-5 bottom-4 z-10 text-center">
          <p className="font-asap text-[10px] font-bold uppercase tracking-[2.5px]">
            Tuning in late summer
          </p>
          <h2
            id="east-coming-soon-title"
            className="mt-1 font-gabarito text-[30px] font-bold leading-none"
          >
            Coming soon
          </h2>
        </div>
      </div>
    </article>
  );
}

export function EastComingSoonStrip() {
  return (
    <div
      className="flex h-[34px] overflow-hidden border-b border-black last:border-b-0"
      aria-label="Voices East coming late summer"
    >
      <div className="grid min-w-0 flex-1 grid-cols-[52px_1fr_auto] items-center gap-3 px-2">
        <span className="font-outfit text-[19px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
          East
        </span>
        <span className="voices-east-tease truncate font-outfit text-[13px] font-medium uppercase leading-none tracking-[1px] text-[#443f3f]">
          Coming soon · Late summer
        </span>
        <span className="inline-flex items-center gap-2 font-asap text-[10px] font-bold uppercase tracking-[1px]">
          Tuning
          <span className="voices-east-tuning-dot size-2 rounded-full bg-voicesNext-orange" />
        </span>
      </div>
      <div
        className="inline-flex h-[34px] w-[35px] shrink-0 items-center justify-center border-l border-black bg-voicesNext-orange text-voicesNext-cream"
        aria-hidden="true"
      >
        <Radio size={15} strokeWidth={2.2} />
      </div>
    </div>
  );
}
