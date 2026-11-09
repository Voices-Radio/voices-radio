"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { accountLinksForCapabilities } from "@/lib/voices/membership/capabilities";
import { getInitials } from "../account-menu";
import { useSessionUser } from "../use-session-user";

/**
 * Mobile counterpart to <AccountMenu /> — the desktop avatar/Sign in cluster
 * lives in a `hidden md:flex` row, so without this, members on phones would
 * have no route to /account at all. Sits above the existing "Become a
 * Supporter" CTA in the mobile menu.
 */
export function MobileAccountLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const { user, status, signOut } = useSessionUser();
  const [signingOut, setSigningOut] = useState(false);

  // Returning null here used to let the menu open a row short and then grow
  // one once the session resolved, moving links out from under a thumb that
  // was already reaching. Reserve the height instead.
  if (status === "loading") {
    return (
      <div className="mt-6 px-6" aria-hidden="true">
        <div className="h-5 w-24 animate-pulse bg-voicesNext-surface" />
      </div>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      onNavigate();
      router.push("/");
      router.refresh();
    }
  }

  if (!user) {
    return (
      <div className="mt-6 px-6">
        <Link
          href="/sign-in"
          onClick={onNavigate}
          className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const initials = getInitials(user);
  const accountLinks = accountLinksForCapabilities(user.capabilities);

  return (
    <div className="mt-6 flex flex-col gap-[25px] px-6">
      {accountLinks.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="flex items-center gap-3 font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          {index === 0 && (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-voicesNext-border bg-voicesNext-surface font-gabarito text-xs font-bold uppercase"
            >
              {initials}
            </span>
          )}
          {index === 0 ? "My account" : link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="text-left font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream/70 transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
