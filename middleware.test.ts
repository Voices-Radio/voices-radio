import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "./middleware";

/**
 * The staging gate is enforced entirely by this matcher, so a subtle regex
 * slip silently un-gates the site. These cases pin the two things that
 * previously went wrong: /api was excluded wholesale, and a `.*\..*`
 * catch-all let any dotted path through.
 */
const matcher = new RegExp(`^${config.matcher[0]}$`);
const isGated = (pathname: string) => matcher.test(pathname);

describe("staging auth matcher", () => {
  it("gates ordinary pages", () => {
    expect(isGated("/")).toBe(true);
    expect(isGated("/shows")).toBe(true);
    expect(isGated("/shows/abc123")).toBe(true);
    expect(isGated("/studio")).toBe(true);
  });

  it("gates API routes that previously bypassed the password entirely", () => {
    expect(isGated("/api/auth/login")).toBe(true);
    expect(isGated("/api/auth/session")).toBe(true);
    expect(isGated("/api/search")).toBe(true);
    expect(isGated("/api/week-info")).toBe(true);
  });

  it("exempts the Sanity webhook, which cannot send basic auth", () => {
    // It verifies its own HMAC signature; gating it would break publishing.
    expect(isGated("/api/revalidate")).toBe(false);
  });

  it("exempts the Studio admin routes, which carry their own bearer auth", () => {
    expect(isGated("/api/voices/admin-show-search")).toBe(false);
    expect(isGated("/api/voices/admin-image-proxy")).toBe(false);
  });

  it("gates dotted paths that the old catch-all let through", () => {
    expect(isGated("/private.json")).toBe(true);
    expect(isGated("/backup.sql")).toBe(true);
    expect(isGated("/.env")).toBe(true);
  });

  it("still exempts genuine static assets and crawler files", () => {
    expect(isGated("/_next/static/chunk.js")).toBe(false);
    expect(isGated("/favicon.ico")).toBe(false);
    expect(isGated("/robots.txt")).toBe(false);
    expect(isGated("/sitemap.xml")).toBe(false);
    expect(isGated("/logo.png")).toBe(false);
    expect(isGated("/fonts/inter.woff2")).toBe(false);
  });
});

describe("requested path forwarding", () => {
  it("forwards path and query so layouts can build a return URL", () => {
    const response = middleware(
      new NextRequest("https://site.test/account/favourites?listId=abc"),
    );

    expect(response.headers.get("x-middleware-request-x-voices-path")).toBe(
      "/account/favourites?listId=abc",
    );
  });

  it("overwrites a client-supplied value rather than trusting it", () => {
    const response = middleware(
      new NextRequest("https://site.test/account", {
        headers: { "x-voices-path": "https://evil.example" },
      }),
    );

    expect(response.headers.get("x-middleware-request-x-voices-path")).toBe(
      "/account",
    );
  });
});

// Staging is public (no password since 29 Oct 2026). robots.txt only stops
// crawling, not indexing of a linked URL, so every non-production response
// also says noindex. Without it a second copy of the site can sit in Google
// next to www.
describe("noindex outside production", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks every staging page noindex", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "staging");

    const response = middleware(new NextRequest("https://site.test/shows"));

    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("marks a site with no environment set noindex too", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "");

    const response = middleware(new NextRequest("https://site.test/"));

    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("never sends noindex in production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");

    const response = middleware(new NextRequest("https://site.test/"));

    expect(response.headers.get("x-robots-tag")).toBeNull();
  });

  it("serves staging without a password when the gate is off", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "staging");
    vi.stubEnv("ENABLE_STAGING_AUTH", "");
    vi.stubEnv("STAGING_PASSWORD", "still-set");

    const response = middleware(new NextRequest("https://site.test/join"));

    expect(response.status).toBe(200);
  });
});
