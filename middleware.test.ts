import { describe, expect, it } from "vitest";
import { config } from "./middleware";

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
