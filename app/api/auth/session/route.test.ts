import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/membership/session", () => ({
  getSession: vi.fn(),
  refreshTokens: vi.fn(),
  setSessionCookies: vi.fn(),
}));

const { getSession, refreshTokens, setSessionCookies } = await import(
  "@/lib/voices/membership/session"
);
const { GET } = await import("./route");

const USER = {
  _id: "user-1",
  email: "jack@example.com",
  firstName: "Jack",
  lastName: "Onslow",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/auth/session", () => {
  it("returns the user directly when the access token is still valid", async () => {
    vi.mocked(getSession).mockResolvedValue(USER);

    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({ user: USER });
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it("refreshes and returns the user when the access token has expired but the refresh token is live", async () => {
    vi.mocked(getSession)
      .mockResolvedValueOnce(null) // initial check: access token expired
      .mockResolvedValueOnce(USER); // re-check after refresh
    vi.mocked(refreshTokens).mockResolvedValue({
      token: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    const response = await GET();
    const payload = await response.json();

    expect(setSessionCookies).toHaveBeenCalledWith({
      token: "fresh-access",
      refreshToken: "fresh-refresh",
    });
    expect(payload).toEqual({ user: USER });
  });

  it("returns user: null with a 200 when there is no session at all", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(refreshTokens).mockResolvedValue(null);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ user: null });
    expect(setSessionCookies).not.toHaveBeenCalled();
  });

  it("returns user: null when the refresh token is also dead", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(refreshTokens).mockResolvedValue(null);

    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({ user: null });
  });
});
