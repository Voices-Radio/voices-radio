import Image from "next/image";
import { cn, focusRingOnSurface } from "@/lib/utils";
import { partners } from "@/lib/voices/partners";

export default function PartnersStrip() {
  return (
    <section
      aria-labelledby="partners-heading"
      className="bg-voicesNext-background"
    >
      <div className="mx-auto max-w-[1080px] px-5 py-12 md:px-8 md:py-14">
        <h2
          id="partners-heading"
          className="font-outfit text-[28px] font-black uppercase leading-[0.95] text-voicesNext-cream md:text-[38px]"
        >
          Our Partners
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
          {partners.map((partner) => (
            <li key={partner.name}>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${partner.name} (opens in a new tab)`}
                className={cn(
                  "flex h-full flex-col gap-4 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface p-6 transition-colors hover:border-voicesNext-orange",
                  focusRingOnSurface,
                )}
              >
                <Image
                  src={partner.logo}
                  alt=""
                  width={partner.logoWidth}
                  height={partner.logoHeight}
                  className="h-10 w-auto self-start object-contain"
                />
                <div className="flex flex-col gap-2">
                  {partner.headline && (
                    <h3 className="font-outfit text-[20px] font-black uppercase leading-tight text-voicesNext-cream">
                      {partner.headline}
                    </h3>
                  )}
                  <p className="font-gabarito text-[15px] leading-relaxed text-voicesNext-cream md:text-base">
                    {partner.blurb}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
