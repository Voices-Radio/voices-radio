import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// The real "server-only" package throws unconditionally unless resolved
// under Next's "react-server" export condition, which Vitest doesn't set.
// Stub it out so modules that import it (lib/voices/membership/session.ts,
// auth-client.ts) can be unit tested directly.
vi.mock("server-only", () => ({}));

// react.cache() is only provided by Next's bundled React build for server
// components — the plain npm "react" package Vitest resolves doesn't export
// it. Patch it to a passthrough so getSession() (wrapped in cache()) is
// callable under test; request-level memoization isn't something a unit
// test needs to exercise.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: (fn: unknown) => fn };
});

// @t3-oss/env-nextjs validates required env vars the moment env.ts is
// imported, not lazily — so any test that imports a module which
// transitively reaches env.ts (e.g. a component using
// lib/voices/membership/analytics.ts, which reads env.NEXT_PUBLIC_SITE_ENV)
// would otherwise crash at import time in a plain Vitest process, which
// has none of the real NEXT_PUBLIC_* vars set. Stub safe defaults once,
// globally, rather than requiring every such test to know about this.
vi.mock("@/env", () => ({
  env: {
    SANITY_REVALIDATE_SECRET: "test-secret",
    ENABLE_STAGING_AUTH: undefined,
    STAGING_AUTH_USER: undefined,
    STAGING_PASSWORD: undefined,
    NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project",
    NEXT_PUBLIC_SANITY_DATASET: "test-dataset",
    NEXT_PUBLIC_FATHOM_SITE_ID: "TEST123",
    NEXT_PUBLIC_SITE_ENV: "test",
    NEXT_PUBLIC_SITE_URL: "https://staging.voicesradio.co.uk",
  },
}));
