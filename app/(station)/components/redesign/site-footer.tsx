import Link from "next/link";
import { VOICES_APPLY_FOR_SHOW_URL } from "@/lib/voices/config";
import MobileAppBadges from "./mobile-app-badges";

export default function SiteFooter({
  supporterUrl,
  contactUrl,
}: {
  supporterUrl?: string | null;
  contactUrl?: string | null;
}) {
  const ctaUrl = supporterUrl || VOICES_APPLY_FOR_SHOW_URL;
  const contactHref = contactUrl || "/chat";

  return (
    <footer className="border-t border-voicesNext-border bg-black text-voicesNext-cream">
      <div className="grid min-h-[240px] w-full content-start gap-[14px] px-[19px] py-6 md:min-h-[280px] md:grid-cols-[1fr_1fr_1fr] md:gap-10 md:px-0 md:py-[27px]">
        <div className="space-y-3 md:space-y-5">
          <p className="font-gabarito text-[16px] font-medium leading-none md:hidden">
            Listen on the Voices app
          </p>
          <MobileAppBadges className="md:hidden" />

          <nav className="grid gap-1 font-gabarito text-[14px] font-medium leading-none md:gap-2 md:text-sm md:font-bold md:leading-normal">
            <p className="uppercase md:hidden">VOICES RADIO</p>
            <Link href="/about">About</Link>
            <Link href="/services">Work with us</Link>
            <a href={contactHref}>Contact</a>
            <a href={ctaUrl}>Become a Supporter</a>
          </nav>
        </div>

        <div className="hidden space-y-4 md:block">
          <p className="font-gabarito text-lg font-bold">
            Listen on the Voices app
          </p>
          <MobileAppBadges />
        </div>

        <p className="hidden self-end font-gabarito text-xs text-voicesNext-secondary md:block md:text-center">
          © 2026 Voices Radio • Voices Radio is a non-profit community
          supported station
        </p>
      </div>
    </footer>
  );
}
