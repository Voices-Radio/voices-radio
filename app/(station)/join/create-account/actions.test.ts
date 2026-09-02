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
  backendRegister: vi.fn(),
  backendLogin: vi.fn(),
}));

vi.mock("@/lib/voices/membership/session", () => ({
  setSessionCookies: vi.fn(),
}));

vi.mock("@/lib/voices/membership/start-checkout", () => ({
  startCheckout: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { backendRegister, backendLogin } =
  await import("@/lib/voices/membership/auth-client");
const { setSessionCookies } = await import("@/lib/voices/membership/session");
const { startCheckout } =
  await import("@/lib/voices/membership/start-checkout");
const { createAccountAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

const validFields = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  password: "correcthorsebattery",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createAccountAction", () => {
  it("returns field errors for missing/invalid input without calling the backend", async () => {
    const state = await createAccountAction(
      undefined,
      formData({
        firstName: "",
        lastName: "",
        email: "not-an-email",
        password: "short",
      }),
    );

    expect(state).toMatchObject({ status: "error" });
    if (state?.status !== "error") throw new Error("expected error state");
    expect(state.fieldErrors?.firstName).toBeTruthy();
    expect(state.fieldErrors?.lastName).toBeTruthy();
    expect(state.fieldErrors?.email).toBeTruthy();
    expect(state.fieldErrors?.password).toMatch(/8 characters/i);
    expect(backendRegister).not.toHaveBeenCalled();
  });

  it("surfaces the backend's error message when registration fails", async () => {
    vi.mocked(backendRegister).mockResolvedValue({
      ok: false,
      status: 409,
      payload: { message: "An account with this email already exists." },
    });

    const state = await createAccountAction(undefined, formData(validFields));

    expect(state).toEqual({
      status: "error",
      formError: "An account with this email already exists.",
      values: {
        firstName: validFields.firstName,
        lastName: validFields.lastName,
        email: validFields.email,
        newsletters: false,
      },
    });
    expect(backendLogin).not.toHaveBeenCalled();
  });

  it("echoes back what was typed so a rejected submit doesn't empty the form", async () => {
    const state = await createAccountAction(
      undefined,
      formData({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.test",
        password: "short",
        newsletters: "on",
      }),
    );

    if (state?.status !== "error") throw new Error("expected error state");
    expect(state.values).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.test",
      newsletters: true,
    });
    // The password is the one field deliberately not returned.
    expect(state.values).not.toHaveProperty("password");
  });

  it("falls back to a check-your-email state when registration succeeds but login is rejected (unverified email)", async () => {
    vi.mocked(backendRegister).mockResolvedValue({
      ok: true,
      status: 201,
      payload: { user: { _id: "u1", email: validFields.email } },
    });
    vi.mocked(backendLogin).mockResolvedValue({
      ok: false,
      status: 401,
      payload: { message: "Please verify your email first." },
    });

    const state = await createAccountAction(undefined, formData(validFields));

    expect(state).toEqual({ status: "verify_email", email: validFields.email });
    expect(setSessionCookies).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("signs the member in and starts checkout with the chosen tier/cadence when both succeed", async () => {
    vi.mocked(backendRegister).mockResolvedValue({
      ok: true,
      status: 201,
      payload: { user: { _id: "u1" } },
    });
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });
    // startCheckout() redirects internally on success and never returns —
    // mimic that by throwing the same RedirectSignal next/navigation's
    // redirect() throws.
    vi.mocked(startCheckout).mockImplementation(() => {
      throw new RedirectSignal("https://checkout.stripe.com/cs_test");
    });

    await expect(
      createAccountAction(
        undefined,
        formData({ ...validFields, tier: "member", cadence: "annual" }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(setSessionCookies).toHaveBeenCalledWith({
      token: "at",
      refreshToken: "rt",
    });
    expect(startCheckout).toHaveBeenCalledWith("member", "annual");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns a checkout_error state when startCheckout fails (account is still created and signed in)", async () => {
    vi.mocked(backendRegister).mockResolvedValue({
      ok: true,
      status: 201,
      payload: { user: { _id: "u1" } },
    });
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });
    vi.mocked(startCheckout).mockResolvedValue({
      ok: false,
      message: "Choose a membership tier to continue.",
    });

    const state = await createAccountAction(undefined, formData(validFields));

    expect(state).toEqual({
      status: "checkout_error",
      message: "Choose a membership tier to continue.",
    });
    expect(setSessionCookies).toHaveBeenCalled();
  });
});
