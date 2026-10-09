import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
}));

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendLogin: vi.fn(),
}));

vi.mock("@/lib/voices/membership/session", () => ({
  getCapabilities: vi.fn(),
  setSessionCookies: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { backendLogin } = await import("@/lib/voices/membership/auth-client");
const { getCapabilities, setSessionCookies } =
  await import("@/lib/voices/membership/session");
const { actionRateLimited } = await import("@/lib/voices/action-rate-limit");
const { signInAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCapabilities).mockResolvedValue(null);
});

describe("signInAction rate limiting", () => {
  it("refuses before touching the backend when the caller is over the limit", async () => {
    vi.mocked(actionRateLimited).mockResolvedValueOnce(
      "Too many attempts. Please wait a moment and try again.",
    );

    const state = await signInAction(
      undefined,
      formData({ email: "a@b.co", password: "hunter22" }),
    );

    expect(state?.formError).toMatch(/too many attempts/i);
    expect(backendLogin).not.toHaveBeenCalled();
  });
});

describe("signInAction", () => {
  it("returns field errors for an invalid email and empty password", async () => {
    const state = await signInAction(
      undefined,
      formData({ email: "not-an-email", password: "" }),
    );

    expect(state?.fieldErrors?.email).toMatch(/valid email/i);
    expect(state?.fieldErrors?.password).toMatch(/password/i);
    expect(backendLogin).not.toHaveBeenCalled();
  });

  it("surfaces a friendly message on incorrect credentials (401)", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: false,
      status: 401,
      payload: null,
    });

    const state = await signInAction(
      undefined,
      formData({ email: "member@example.com", password: "wrong" }),
    );

    expect(state?.formError).toBe("Incorrect email or password.");
    expect(setSessionCookies).not.toHaveBeenCalled();
  });

  it("surfaces the backend's message on other failures", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: false,
      status: 503,
      payload: { message: "Authentication service is unavailable." },
    });

    const state = await signInAction(
      undefined,
      formData({ email: "member@example.com", password: "whatever" }),
    );

    expect(state?.formError).toBe("Authentication service is unavailable.");
  });

  it("sets session cookies and redirects to /account by default on success", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt", user: { _id: "u1" } },
    });

    await expect(
      signInAction(
        undefined,
        formData({ email: "member@example.com", password: "correct" }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(setSessionCookies).toHaveBeenCalledWith({
      token: "at",
      refreshToken: "rt",
    });
    expect(redirect).toHaveBeenCalledWith("/account");
  });

  it("ignores a stale ?as=artist from an old link — an artist still lands in the artist area", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt", user: { _id: "u1" } },
    });
    vi.mocked(getCapabilities).mockResolvedValue({
      user: { _id: "u1", email: "dj@example.com" },
      capabilities: ["artist"],
      artist: {
        id: "artist-1",
        name: "DJ Test",
        imageUrl: null,
        programmingEmail: "dj@example.com",
        radioCultArtistId: "rc-1",
        radioCultSyncState: "linked",
        canManageProfile: true,
      },
      member: null,
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "dj@example.com",
          password: "correct",
          as: "artist",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/account/artist");
  });

  it("ignores a stale ?as=artist for a member-only account — their profile, never a 'not linked' notice", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt", user: { _id: "u1" } },
    });
    vi.mocked(getCapabilities).mockResolvedValue({
      user: { _id: "u1", email: "member@example.com" },
      capabilities: ["member"],
      artist: null,
      member: { status: "active", contributionAmountMinor: 1599, cadence: "monthly" },
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "member@example.com",
          password: "correct",
          as: "artist",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/account/profile");
  });

  it("ignores a stale ?as=member for an artist-only account", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt", user: { _id: "u1" } },
    });
    vi.mocked(getCapabilities).mockResolvedValue({
      user: { _id: "u1", email: "dj@example.com" },
      capabilities: ["artist"],
      artist: {
        id: "artist-1",
        name: "DJ Test",
        imageUrl: null,
        programmingEmail: "dj@example.com",
        radioCultArtistId: "rc-1",
        radioCultSyncState: "linked",
        canManageProfile: true,
      },
      member: null,
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "dj@example.com",
          password: "correct",
          as: "member",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/account/artist");
  });

  it("lets an explicit safe next path win", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });
    vi.mocked(getCapabilities).mockResolvedValue({
      user: { _id: "u1", email: "dj@example.com" },
      capabilities: ["artist"],
      artist: null,
      member: null,
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "dj@example.com",
          password: "correct",
          as: "artist",
          next: "/benefits/friends",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/benefits/friends");
  });

  it("redirects to a same-origin `next` path when provided", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "member@example.com",
          password: "correct",
          next: "/account/membership",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/account/membership");
  });

  it("ignores an off-site `next` value and falls back to /account", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "member@example.com",
          password: "correct",
          next: "https://evil.example.com/phish",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/account");
  });

  it("ignores a protocol-relative `next` value (//host) and falls back to /account", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });

    await expect(
      signInAction(
        undefined,
        formData({
          email: "member@example.com",
          password: "correct",
          next: "//evil.example.com/phish",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/account");
  });

  it("tells an unconfirmed account to confirm its email, instead of calling the password wrong", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: false,
      status: 401,
      payload: { message: "Please verify your email before logging in", needsVerification: true, email: "jo@example.com" },
    });

    const state = await signInAction(
      undefined,
      formData({ email: "jo@example.com", password: "correct-horse" }),
    );

    expect(state?.needsVerificationFor).toBe("jo@example.com");
    expect(state?.formError).toMatch(/confirm your email/i);
    expect(state?.formError).not.toMatch(/incorrect/i);
    expect(setSessionCookies).not.toHaveBeenCalled();
  });

  it("tells an account that has paid but has no password yet to use the set-up link", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: false,
      status: 401,
      payload: { message: "Finish setting up your account", needsSetup: true, email: "jo@example.com" },
    });

    const state = await signInAction(
      undefined,
      formData({ email: "jo@example.com", password: "whatever" }),
    );

    expect(state?.needsVerificationFor).toBe("jo@example.com");
    expect(state?.formError).toMatch(/isn't set up yet/i);
    expect(state?.formError).not.toMatch(/incorrect/i);
  });
});
