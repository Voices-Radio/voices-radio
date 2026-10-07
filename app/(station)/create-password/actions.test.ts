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
  backendCompleteSetup: vi.fn(),
}));
vi.mock("@/lib/voices/membership/session", () => ({
  setSessionCookies: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { backendCompleteSetup } = await import("@/lib/voices/membership/auth-client");
const { setSessionCookies } = await import("@/lib/voices/membership/session");
const { createPasswordAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const GOOD = "Sunshine42";
const valid = { token: "tok", password: GOOD, confirmPassword: GOOD };

beforeEach(() => vi.clearAllMocks());

describe("createPasswordAction", () => {
  it("sets the password, signs the member in and sends them to the account home", async () => {
    vi.mocked(backendCompleteSetup).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "access", refreshToken: "refresh" },
    });

    await expect(createPasswordAction(undefined, formData(valid))).rejects.toThrow(RedirectSignal);

    expect(backendCompleteSetup).toHaveBeenCalledWith({ token: "tok", password: GOOD });
    expect(setSessionCookies).toHaveBeenCalledWith({ token: "access", refreshToken: "refresh" });
    expect(redirect).toHaveBeenCalledWith("/account");
  });

  it("requires the two passwords to match, without calling the backend", async () => {
    const state = await createPasswordAction(
      undefined,
      formData({ ...valid, confirmPassword: "Different42" }),
    );
    expect(state).toMatchObject({
      status: "error",
      fieldErrors: { confirmPassword: "Passwords must match." },
    });
    expect(backendCompleteSetup).not.toHaveBeenCalled();
  });

  it.each(["short1A", "alllowercase1", "ALLUPPERCASE1", "NoDigitsAtAll"])(
    "rejects the weak password %s with the rule spelled out",
    async (password) => {
      const state = await createPasswordAction(
        undefined,
        formData({ token: "tok", password, confirmPassword: password }),
      );
      expect(state).toMatchObject({
        status: "error",
        fieldErrors: { password: expect.stringMatching(/at least 8 characters/i) },
      });
      expect(backendCompleteSetup).not.toHaveBeenCalled();
    },
  );

  it("accepts a passphrase with spaces and punctuation", async () => {
    vi.mocked(backendCompleteSetup).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "a", refreshToken: "r" },
    });
    const password = "Correct horse-battery 9";
    await expect(
      createPasswordAction(undefined, formData({ token: "tok", password, confirmPassword: password })),
    ).rejects.toThrow(RedirectSignal);
  });

  it("offers a new link when the link has expired or been used", async () => {
    vi.mocked(backendCompleteSetup).mockResolvedValue({
      ok: false,
      status: 400,
      payload: { message: "This link has expired or has already been used." },
    });
    const state = await createPasswordAction(undefined, formData(valid));
    expect(state).toMatchObject({ status: "error", linkProblem: true });
    expect(setSessionCookies).not.toHaveBeenCalled();
  });

  it("does not blame the link for a server failure", async () => {
    vi.mocked(backendCompleteSetup).mockResolvedValue({ ok: false, status: 503, payload: null });
    const state = await createPasswordAction(undefined, formData(valid));
    expect(state).toMatchObject({ status: "error", linkProblem: false });
  });

  it("treats a missing token as a link problem", async () => {
    const state = await createPasswordAction(
      undefined,
      formData({ password: GOOD, confirmPassword: GOOD }),
    );
    expect(state).toMatchObject({ status: "error", linkProblem: true });
  });
});
