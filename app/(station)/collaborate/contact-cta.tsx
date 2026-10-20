"use client";

import { useState } from "react";

const COPY_RESET_MS = 2000;

function readEmail(href: string): string | null {
  if (!href.toLowerCase().startsWith("mailto:")) return null;
  const address = href.slice("mailto:".length).split("?")[0];
  return address ? decodeURIComponent(address) : null;
}

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
  const email = readEmail(href);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // Clipboard access can be denied. The address stays visible, so the
      // visitor can still select it by hand.
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={href}
        className="inline-flex h-14 items-center justify-center border border-voicesNext-cream px-6 font-gabarito text-lg font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
      >
        {label}
      </a>
      {email && (
        <p className="flex flex-wrap items-center gap-2 font-gabarito text-sm text-voicesNext-secondary">
          <span>Or email</span>
          <span className="select-all text-voicesNext-cream">{email}</span>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={`Copy email address ${email}`}
            className="font-bold uppercase text-voicesNext-orange underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            Copy
          </button>
          <span aria-live="polite" className="text-voicesNext-cream">
            {copied ? "Copied" : ""}
          </span>
        </p>
      )}
    </div>
  );
}
