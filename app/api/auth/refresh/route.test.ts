import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/voices/membership/session", () => ({
  clearSessionCookies: vi.fn(),
  getRefreshToken: vi.fn(),
  refreshTokens: vi.fn(),
  setSessionCookies: vi.fn(),
}));

const {
  clearSessionCookies,
  getRefreshToken,
  refreshTokens,
  setSessionCookies,
} = await import("@/lib/voices/membership/session");
const { GET } = await import("./route");

function requestWithNext(next: string) {
  return new NextRequest(
    `https://staging.voicesradio.co.uk/api/auth/refresh?next=${encodeURIComponent(next)}`,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/auth/refresh", () => {
  it("redirects to /sign-in when there's no refresh token at all", async () => {
    vi.mocked(getRefreshToken).mockResolvedValue(undefined);

    const response = await GET(requestWithNext("/account"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://staging.voicesradio.co.uk/sign-in?next=%2Faccount",
    );
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it("clears cookies and redirects to /sign-in when the refresh itself fails", async () => {
    vi.mocked(getRefreshToken).mockResolvedValue("dead-refresh-token");
    vi.mocked(refreshTokens).mockResolvedValue(null);

    const response = await GET(requestWithNext("/account/membership"));

    expect(clearSessionCookies).toHaveBeenCalled();
    expect(setSessionCookies).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://staging.voicesradio.co.uk/sign-in?next=%2Faccount%2Fmembership",
    );
  });

  it("sets fresh cookies and redirects back to `next` on a successful refresh", async () => {
    vi.mocked(getRefreshToken).mockResolvedValue("refresh-token");
    vi.mocked(refreshTokens).mockResolvedValue({
      token: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    const response = await GET(requestWithNext("/account/membership"));

    expect(setSessionCookies).toHaveBeenCalledWith({
      token: "fresh-access",
      refreshToken: "fresh-refresh",
    });
    expect(clearSessionCookies).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://staging.voicesradio.co.uk/account/membership",
    );
  });

  it("falls back to /account when `next` is missing", async () => {
    vi.mocked(getRefreshToken).mockResolvedValue("refresh-token");
    vi.mocked(refreshTokens).mockResolvedValue({
      token: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    const response = await GET(
      new NextRequest("https://staging.voicesradio.co.uk/api/auth/refresh"),
    );

    expect(response.headers.get("location")).toBe(
      "https://staging.voicesradio.co.uk/account",
    );
  });

  it("rejects an off-site `next` value, falling back to /account", async () => {
    vi.mocked(getRefreshToken).mockResolvedValue(undefined);

    const response = await GET(
      requestWithNext("https://evil.example/phish"),
    );

    expect(response.headers.get("location")).toBe(
      "https://staging.voicesradio.co.uk/sign-in?next=%2Faccount",
    );
  });
});

describe("GET /api/auth/refresh — open redirect", () => {
  /**
   * Regression for the backslash bypass: `/\evil.com` passed the old
   * prefix-based guard and `new URL(next, request.url)` resolved it to
   * https://evil.com/, handing an unauthenticated caller an off-site redirect
   * from our own domain.
   */
  it.each(["/\\evil.com", "/\\/evil.com", "//evil.com", "https://evil.com"])(
    "never redirects off-origin for next=%j",
    async (next) => {
      vi.mocked(getRefreshToken).mockResolvedValue("live-refresh-token");
      vi.mocked(refreshTokens).mockResolvedValue({
        token: "new-access",
        refreshToken: "new-refresh",
      });

      const response = await GET(requestWithNext(next));
      const location = new URL(response.headers.get("location") ?? "");

      expect(location.origin).toBe("https://staging.voicesradio.co.uk");
      expect(location.href).not.toContain("evil.com");
    },
  );
});
