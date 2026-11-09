"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Share the article.
 *
 * This replaces a `<button>` that had no handler at all — a control that
 * looked live and did nothing. Uses the native share sheet where the browser
 * offers one (all mobile, where sharing actually happens) and falls back to
 * copying the link, with a visible confirmation either way: an action with
 * no acknowledgement reads as broken even when it worked.
 */
export default function ShareButton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissing the native sheet rejects; that is not a failure, and
        // it should not fall through to silently copying the link.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context, or permission denied). Say so
      // rather than showing a success state that did not happen.
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        "inline-flex min-h-[44px] items-center gap-2 font-asap text-[12px] font-bold uppercase tracking-[0.5px] text-voicesNext-orangeText transition-colors hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
      }
    >
      {copied ? (
        <Check aria-hidden="true" size={15} />
      ) : (
        <Share2 aria-hidden="true" size={15} />
      )}
      {copied ? "Link copied" : "Share"}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </button>
  );
}
