"use client";

import { useEffect, useRef, useState } from "react";

const COPY_RESET_MS = 2000;

/**
 * Shows an email address and copies it on request.
 *
 * A `mailto:` link does nothing visible in a browser with no registered mail
 * handler, so the link beside this control can look broken. The address stays
 * on the page for those visitors.
 */
export default function ContactEmailCopy({
  email,
  prefix,
  className,
  addressClassName,
}: {
  email: string;
  prefix?: string;
  className?: string;
  addressClassName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(resetTimer.current);
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(
        () => setCopied(false),
        COPY_RESET_MS,
      );
    } catch {
      // Clipboard access can be denied. The address stays visible, so the
      // visitor can still select it by hand.
      setCopied(false);
    }
  }

  return (
    <span className={className}>
      {prefix && <span>{prefix}</span>}
      <span className={addressClassName}>{email}</span>
      <button
        type="button"
        onClick={copyEmail}
        aria-label={`Copy email address ${email}`}
        className="font-bold uppercase text-voicesNext-orange underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? `${email} copied to the clipboard` : ""}
      </span>
    </span>
  );
}
