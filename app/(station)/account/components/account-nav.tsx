"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/membership", label: "Membership" },
  { href: "/account/benefits", label: "Benefits" },
  { href: "/account/redemptions", label: "Redemptions" },
  { href: "/account/profile", label: "Profile" },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
      {LINKS.map((link) => {
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
              active
                ? "text-voicesNext-orange"
                : "text-voicesNext-cream/70 hover:text-voicesNext-cream",
            )}
          >
            {link.label}
          </Link>
        );
      })}
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
