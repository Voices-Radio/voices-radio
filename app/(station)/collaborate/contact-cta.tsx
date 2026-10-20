import { readEmailFromMailto } from "@/lib/voices/mailto";
import ContactEmailCopy from "../components/redesign/contact-email-copy";

/**
 * A `mailto:` link silently does nothing in a browser with no registered mail
 * handler, so the button looks broken. Keep the native link for visitors who do
 * have a mail app, and always show the address itself for everyone else.
 */
export default function ContactCta({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const email = readEmailFromMailto(href);

  return (
    <div className="flex flex-col gap-2">
      <a
        href={href}
        className="inline-flex h-14 items-center justify-center border border-voicesNext-cream px-6 font-gabarito text-lg font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
      >
        {label}
      </a>
      {email && (
        <ContactEmailCopy
          email={email}
          prefix="Or email"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-gabarito text-sm text-voicesNext-secondary"
          addressClassName="select-all break-all text-voicesNext-cream"
        />
      )}
    </div>
  );
}
