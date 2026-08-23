"use client";

import { ChevronDown, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { accountLinksForCapabilities } from "@/lib/voices/membership/capabilities";
import type { VoicesSessionUser } from "@/lib/voices/membership/session";
import { useSessionUser } from "./use-session-user";

const focusRingClasses =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background";

/**
 * Exported (not just used inline) so it's unit-testable without mounting
 * the component: firstName + lastName initials, falling back to the first
 * letter of the email, falling back to null (caller renders an icon).
 */
export function getInitials(user: VoicesSessionUser): string | null {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];

  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return first.toUpperCase();
  if (user.email) return user.email[0]?.toUpperCase() ?? null;

  return null;
}

function SignedOutLinks({ pathname }: { pathname: string }) {
  const nextParam = encodeURIComponent(pathname || "/");

  return (
    <div className="flex items-center gap-3 lg:gap-4">
      <Link
        href={`/sign-in?next=${nextParam}`}
        className={cn(
          "font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:text-voicesNext-orange",
          focusRingClasses,
        )}
      >
        Sign in
      </Link>
      <Link
        href="/join"
        className={cn(
          "hidden h-9 items-center justify-center rounded-full bg-voicesNext-orange px-4 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background lg:inline-flex",
          focusRingClasses,
        )}
      >
        Support Us
      </Link>
    </div>
  );
}

function AccountAvatarMenu({
  user,
  onSignOut,
}: {
  user: VoicesSessionUser;
  onSignOut: () => Promise<void>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const initials = getInitials(user);
  const links = accountLinksForCapabilities(user.capabilities);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={
          user.firstName ? `Account menu for ${user.firstName}` : "Account menu"
        }
        className={cn(
          "flex h-10 items-center gap-1 rounded-full text-voicesNext-cream transition-colors hover:text-voicesNext-orange",
          focusRingClasses,
        )}
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-voicesNext-border bg-voicesNext-surface font-gabarito text-sm font-bold uppercase"
        >
          {initials ?? <UserIcon size={18} strokeWidth={2.5} />}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          strokeWidth={2.5}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          id="account-menu"
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden border border-voicesNext-border bg-voicesNext-background shadow-2xl"
        >
          <div className="border-b border-voicesNext-border px-4 py-3">
            <p className="truncate font-gabarito text-sm font-bold text-voicesNext-cream">
              {user.firstName ? `Hi ${user.firstName}` : "Your account"}
            </p>
            {user.email && (
              <p className="mt-0.5 truncate font-asap text-xs text-voicesNext-secondary">
                {user.email}
              </p>
            )}
          </div>

          <div className="py-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2 font-gabarito text-sm font-bold text-voicesNext-cream/90 transition-colors hover:bg-voicesNext-surface hover:text-voicesNext-cream",
                  focusRingClasses,
                  "focus-visible:ring-inset",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-voicesNext-border py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                "block w-full px-4 py-2 text-left font-gabarito text-sm font-bold text-voicesNext-orangeText transition-colors hover:bg-voicesNext-surface disabled:opacity-60",
                focusRingClasses,
                "focus-visible:ring-inset",
              )}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Header account entry point — the only place on the site that links to
 * /account or /sign-in outside of typing the URL directly. Owns all three
 * states: loading, signed out, signed in.
 *
 * Reads session client-side via useSessionUser() because the session
 * cookies are httpOnly; see that hook's docstring for why this can't be a
 * server-rendered prop from RedesignShell.
 */
export default function AccountMenu() {
  const { user, status, signOut } = useSessionUser();
  const pathname = usePathname();

  if (status === "loading") {
    // Reserves roughly the signed-in avatar's footprint so the common case
    // (an already-signed-in return visitor) doesn't jump when the fetch
    // resolves. Signed-out visitors still see a brief widening once the
    // fetch lands — unavoidable without knowing the outcome up front — but
    // it's a single ~40px shift on a first render, not a layout thrash.
    return (
      <div
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-full border border-transparent"
      />
    );
  }

  return user ? (
    <AccountAvatarMenu user={user} onSignOut={signOut} />
  ) : (
    <SignedOutLinks pathname={pathname ?? "/"} />
  );
}
