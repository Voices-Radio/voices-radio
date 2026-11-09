"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
// Type-only: session.ts is `import "server-only"` and pulling in a value
// from it would break the client bundle.
import type { VoicesSessionUser } from "@/lib/voices/membership/session";

type SessionStatus = "loading" | "ready";

type SessionContextValue = {
  user: VoicesSessionUser | null;
  status: SessionStatus;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/** A signed-in result is trusted this long before a navigation re-checks it. */
const SIGNED_IN_TTL_MS = 60_000;

/**
 * The one client-side read of the signed-in member for the whole shell.
 *
 * The session cookies are httpOnly (see lib/voices/membership/session.ts), so
 * the browser can only learn who is signed in by asking /api/auth/session.
 * This used to be a hook with its own effect in the header, the account menu
 * AND the favourites provider — three identical requests (each fanning out to
 * two backend calls, and racing each other to refresh an expired token) on
 * every navigation. One provider means one request.
 *
 * Re-checks on navigation so sign-in (a server action that then redirects)
 * is picked up without any wiring. A signed-out result is always re-checked —
 * it is cheap, the route makes no backend call without a cookie. A signed-in
 * result is reused for SIGNED_IN_TTL_MS, which is what removes the per-click
 * backend traffic for members. signOut() clears local state itself.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<VoicesSessionUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const signedInAt = useRef<number | null>(null);

  useEffect(() => {
    const fresh =
      signedInAt.current !== null &&
      Date.now() - signedInAt.current < SIGNED_IN_TTL_MS;
    if (fresh) return;

    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        const next = (payload?.user as VoicesSessionUser | undefined) ?? null;

        if (!cancelled) {
          setUser(next);
          signedInAt.current = next ? Date.now() : null;
        }
      } catch {
        // A dead membership API must degrade to the signed-out header, not
        // crash the header on every page of the site.
        if (!cancelled) {
          setUser(null);
          signedInAt.current = null;
        }
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
   * effect to refire. Signing out while already on "/" leaves usePathname()
   * unchanged, so router.push("/") alone would never re-run the effect and
   * the avatar would keep showing.
   */
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      signedInAt.current = null;
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, signOut }),
    [user, status, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionUser(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionUser must be used within <SessionProvider>.");
  }
  return context;
}
