import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

// The live site (pre-redesign `main`) named the AI search crawlers so the
// intent to be cited by AI search is on record. The redesign must keep that,
// and must keep blocking every crawler outside production.
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots", () => {
  it("blocks every crawler outside production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "staging");

    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(robots().sitemap).toBeUndefined();
  });

  it("allows crawlers in production and keeps studio and api private", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");

    const rules = robots().rules as Array<{ userAgent: string | string[]; allow: string; disallow: string[] }>;
    expect(rules[0]).toEqual({ userAgent: "*", allow: "/", disallow: ["/studio/", "/api/"] });
  });

  it("names the AI search crawlers in production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");

    const rules = robots().rules as Array<{ userAgent: string | string[]; allow: string; disallow: string[] }>;
    const ai = rules.find((rule) => Array.isArray(rule.userAgent));
    expect(ai?.userAgent).toEqual(
      expect.arrayContaining(["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]),
    );
    expect(ai?.allow).toBe("/");
    expect(ai?.disallow).toEqual(["/studio/", "/api/"]);
  });

  it("points at the sitemap in production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");

    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
