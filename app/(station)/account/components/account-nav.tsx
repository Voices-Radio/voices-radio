"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  accountLinksForCapabilities,
  type AccountCapability,
} from "@/lib/voices/membership/capabilities";

const ACCOUNT_MODE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function persistAccountMode(mode: "artist" | "member") {
  document.cookie = [
    `voices_account_mode=${mode}`,
    "path=/",
    `max-age=${ACCOUNT_MODE_COOKIE_MAX_AGE_SECONDS}`,
    "samesite=lax",
  ].join("; ");
}

export default function AccountNav({
  capabilities,
}: {
  capabilities: AccountCapability[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const links = accountLinksForCapabilities(capabilities);
  const hasArtist = capabilities.includes("artist");
  const hasMember = capabilities.includes("member");
  const showModeToggle = hasArtist && hasMember;
  const inArtistMode = pathname?.startsWith("/account/artist") ?? false;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <nav
      aria-label="Account"
      className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-voicesNext-border pb-4"
    >
      {links.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account"
            : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "font-gabarito text-sm font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange",
              // orangeText, not orange — plain orange fails 4.5:1 as static
              // text here (axe-flagged; see tailwind.config.js). The
              // focus-visible ring above stays plain orange: rings are a
              // non-text 3:1 threshold, which it already clears.
              active
                ? "text-voicesNext-orangeText"
                : "text-voicesNext-cream/70 hover:text-voicesNext-cream",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      {showModeToggle && (
        <Link
          href={inArtistMode ? "/account" : "/account/artist"}
          onClick={() => persistAccountMode(inArtistMode ? "member" : "artist")}
          className="rounded-full border border-voicesNext-border px-3 py-1 font-gabarito text-xs font-bold uppercase tracking-wide text-voicesNext-cream/80 transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
        >
          {inArtistMode ? "Member Mode" : "DJ Mode"}
        </Link>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="ml-auto font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-cream/70 transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </nav>
  );
}
