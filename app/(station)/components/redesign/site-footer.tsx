import Link from "next/link";
import BrandMark from "./brand-mark";

export default function SiteFooter({
  supporterUrl,
}: {
  supporterUrl?: string | null;
}) {
  return (
    <footer className="border-t border-voicesNext-border bg-black text-voicesNext-cream">
      <div className="grid w-full gap-10 py-10 md:min-h-[280px] md:grid-cols-[1fr_1fr_1fr] md:py-[27px]">
        <div className="space-y-5">
          <BrandMark />
          <nav className="grid gap-2 font-gabarito text-sm font-bold">
            <Link href="/about">About</Link>
            <Link href="/services">Work with us</Link>
            <Link href="/chat">Contact</Link>
            {supporterUrl ? (
              <a href={supporterUrl}>Become a Supporter</a>
            ) : (
              <span className="text-voicesNext-secondary" aria-disabled="true">
                Become a Supporter
              </span>
            )}
          </nav>
        </div>

        <div className="space-y-4">
          <p className="font-gabarito text-lg font-bold">
            Listen on the Voices app
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-voices-xs border border-voicesNext-border px-4 font-asap text-xs font-bold uppercase text-voicesNext-secondary">
              App Store
            </span>
            <span className="inline-flex h-10 min-w-[135px] items-center justify-center rounded-voices-xs border border-voicesNext-border px-4 font-asap text-xs font-bold uppercase text-voicesNext-secondary">
              Google Play
            </span>
          </div>
        </div>

        <p className="self-end font-gabarito text-xs text-voicesNext-secondary md:text-center">
          © 2026 Voices Radio • Voices Radio is a non-profit community
          supported station
        </p>
      </div>
    </footer>
  );
}
