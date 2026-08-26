import Image from "next/image";
import Link from "next/link";

export default function SiteFooter({
  contactUrl,
}: {
  contactUrl?: string | null;
}) {
  // Always the membership signup page — not settings.apply_link, which is
  // the CMS "Apply Link" field (the radio show submission Google Form).
  // See site-header.tsx for the same fix.
  const ctaUrl = "/join";
  const contactHref = contactUrl || "/chat";

  return (
    <footer className="border-t border-voicesNext-border bg-black text-voicesNext-cream">
      <div className="grid min-h-[170px] w-full gap-8 px-[19px] py-6 md:min-h-[190px] md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-10 md:px-8 md:py-7">
        <div className="space-y-4 text-left">
          <nav className="grid gap-1 font-gabarito text-[14px] font-medium leading-none md:gap-2 md:text-sm md:font-bold md:leading-normal">
            <p className="uppercase md:hidden">VOICES RADIO</p>
            <Link href="/about">About</Link>
            <Link href="/services">Work with us</Link>
            <Link href="/support">Support Us</Link>
            <a href={contactHref}>Contact</a>
            <a href={ctaUrl}>Become a Supporter</a>
          </nav>
          <p className="max-w-[240px] font-gabarito text-xs text-voicesNext-secondary">
            © 2026 Voices Radio
          </p>
        </div>

        <Link
          href="/"
          className="mx-auto block h-[46px] w-[145px] focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black md:mt-1"
          aria-label="Voices Radio home"
        >
          <Image
            src="/voices-wordmark.svg"
            alt=""
            width={145}
            height={46}
            className="h-[46px] w-[145px] object-contain"
          />
        </Link>

        <p className="max-w-[340px] justify-self-start font-asap text-sm leading-snug text-voicesNext-secondary md:justify-self-end md:text-left">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          posuere erat a ante venenatis dapibus posuere velit aliquet.
        </p>
      </div>
    </footer>
  );
}
