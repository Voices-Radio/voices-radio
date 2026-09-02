import { Radio } from "lucide-react";

export function EastComingSoonCard() {
  return (
    <article
      className="relative h-[126px] overflow-hidden border border-voicesNext-cream bg-voicesNext-orange text-voicesNext-cream md:h-[316px] md:border-0"
      aria-labelledby="east-coming-soon-title"
    >
      <div className="hidden h-[34px] items-center justify-between bg-voicesNext-cream px-[14px] text-voicesNext-background md:flex">
        <span className="font-outfit text-[24px] font-black uppercase leading-none tracking-[1px]">
          East
        </span>
        <span className="font-asap text-[10px] font-bold uppercase tracking-[1.5px]">
          New frequency
        </span>
      </div>

      <div className="hidden h-[13px] overflow-hidden border-y border-voicesNext-cream bg-voicesNext-background font-outfit text-[10px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-cream md:block">
        <div className="voices-coming-soon-marquee flex w-max items-center gap-[8px] px-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="flex shrink-0 items-center gap-[8px]">
              <span>Incoming transmission</span>
              <span className="h-1.5 w-1.5 rounded-full bg-voicesNext-orange" />
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex h-[126px] items-center justify-center overflow-hidden md:h-[269px]">
        <div className="voices-east-orbit border-voicesNext-cream/35 absolute h-[120px] w-[120px] rounded-full border md:h-[230px] md:w-[230px]" />
        <div className="voices-east-orbit voices-east-orbit-delayed border-voicesNext-cream/45 absolute h-[86px] w-[86px] rounded-full border md:h-[166px] md:w-[166px]" />
        <div className="voices-east-signal absolute h-[52px] w-[52px] rounded-full bg-voicesNext-background md:h-[92px] md:w-[92px]" />
        <Radio
          aria-hidden="true"
          className="relative z-10 text-voicesNext-cream"
          size={28}
          strokeWidth={1.8}
        />

        <div className="absolute inset-x-3 bottom-2 z-10 text-center md:inset-x-5 md:bottom-4">
          <p className="font-asap text-[9px] font-bold uppercase tracking-[1.5px] md:text-[10px] md:tracking-[2.5px]">
            Tuning in late summer
          </p>
          <h2
            id="east-coming-soon-title"
            className="mt-1 font-gabarito text-[18px] font-bold leading-none md:text-[30px]"
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
      className="box-border flex h-[34px] overflow-hidden border-b border-black last:border-b-0"
      aria-label="Voices East coming late summer"
    >
      <div className="grid min-w-0 flex-1 grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-5 px-2">
        <span className="font-outfit text-[19px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
          East
        </span>
        <span className="voices-east-tease truncate font-outfit text-[13px] leading-none tracking-[1px] text-[#443f3f]">
          Coming soon · Late summer
        </span>
        <span className="inline-flex items-center gap-2 font-asap text-[10px] font-bold uppercase tracking-[1px]">
          Tuning
          <span className="voices-east-tuning-dot h-2 w-2 rounded-full bg-voicesNext-orange" />
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
