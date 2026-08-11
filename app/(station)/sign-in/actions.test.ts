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
  setSessionCookies: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { backendLogin } = await import("@/lib/voices/membership/auth-client");
const { setSessionCookies } = await import(
  "@/lib/voices/membership/session"
);
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
      signInAction(undefined, formData({ email: "member@example.com", password: "correct" })),
    ).rejects.toThrow(RedirectSignal);

    expect(setSessionCookies).toHaveBeenCalledWith({
      token: "at",
      refreshToken: "rt",
    });
    expect(redirect).toHaveBeenCalledWith("/account");
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
});
