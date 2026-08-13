"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// Type-only: session.ts is `import "server-only"` and pulling in a value
// from it would break the client bundle.
import type { VoicesSessionUser } from "@/lib/voices/membership/session";

type SessionStatus = "loading" | "ready";

/**
 * Client-side read of the signed-in member, if any. The session cookies are
 * httpOnly (see lib/voices/membership/session.ts), so this is the only way
 * a client component like the header can know who's signed in — it polls
 * the same-origin /api/auth/session route, mirroring the existing
 * /api/membership/me pattern used by the join/complete poller.
 *
 * Re-fetches on every pathname change so it picks up sign-in and sign-out
 * without needing a context provider: both flows navigate afterwards (see
 * account-nav.tsx's handleSignOut and sign-in-form.tsx's redirect).
 */
export function useSessionUser() {
  const pathname = usePathname();
  const [user, setUser] = useState<VoicesSessionUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);

        if (!cancelled) {
          setUser((payload?.user as VoicesSessionUser | undefined) ?? null);
        }
      } catch {
        // A dead membership API must degrade to the signed-out header, not
        // crash the header on every page of the site.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setStatus("ready");
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  /**
   * Clears local state immediately rather than waiting on the pathname
   * effect above to refire. Signing out while already on "/" (e.g. from
   * this very header) leaves usePathname()'s value unchanged, so
   * router.push("/") + router.refresh() alone would never cause the
   * effect's dependency to change and the avatar would keep showing.
   */
  async function signOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }

  return { user, status, signOut };
}
