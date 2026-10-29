import { beforeEach, describe, expect, it, vi } from "vitest";

// The emailed links follow whichever deployment the visitor is on, built from
// the request's own host. The backend allowlists the origin before use.
const requestHeaders = new Map<string, string>();
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (name: string) => requestHeaders.get(name) ?? null }),
}));

const { verificationReturnUrl, resetPasswordReturnUrl } = await import("./verification-return");

beforeEach(() => {
  requestHeaders.clear();
});

describe("verificationReturnUrl", () => {
  it("points at this site's /verify-email page with the next path", async () => {
    requestHeaders.set("x-forwarded-host", "staging.voicesradio.co.uk");
    requestHeaders.set("x-forwarded-proto", "https");

    expect(await verificationReturnUrl("/account")).toBe(
      "https://staging.voicesradio.co.uk/verify-email?next=%2Faccount",
    );
  });
});

describe("resetPasswordReturnUrl", () => {
  it("points at this site's /reset-password page", async () => {
    requestHeaders.set("x-forwarded-host", "www.voicesradio.co.uk, proxy.internal");
    requestHeaders.set("x-forwarded-proto", "https");

    expect(await resetPasswordReturnUrl()).toBe("https://www.voicesradio.co.uk/reset-password");
  });

  it("carries a next path when there is one", async () => {
    requestHeaders.set("host", "staging.voicesradio.co.uk");

    expect(await resetPasswordReturnUrl("/artists/claim/abc")).toBe(
      "https://staging.voicesradio.co.uk/reset-password?next=%2Fartists%2Fclaim%2Fabc",
    );
  });

  it("uses http for localhost", async () => {
    requestHeaders.set("host", "localhost:3000");

    expect(await resetPasswordReturnUrl()).toBe("http://localhost:3000/reset-password");
  });

  it("returns nothing without a host, so the backend keeps its default link", async () => {
    expect(await resetPasswordReturnUrl()).toBeUndefined();
  });
});
