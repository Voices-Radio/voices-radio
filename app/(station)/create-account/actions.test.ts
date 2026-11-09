import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/action-rate-limit", () => ({
  actionRateLimited: vi.fn(async () => null),
}));

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendRegister: vi.fn(),
}));

vi.mock("@/lib/voices/membership/verification-return", () => ({
  verificationReturnUrl: vi.fn(async (next: string) => `https://staging.voicesradio.co.uk/verify-email?next=${encodeURIComponent(next)}`),
}));

const { actionRateLimited } = await import("@/lib/voices/action-rate-limit");
const { backendRegister } = await import("@/lib/voices/membership/auth-client");
const { registerFreeAccountAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  firstName: "Jo",
  lastName: "Bloggs",
  email: "jo@example.com",
  password: "Passw0rdOk",
  confirmPassword: "Passw0rdOk",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(actionRateLimited).mockResolvedValue(null);
  vi.mocked(backendRegister).mockResolvedValue({
    ok: true,
    status: 201,
    payload: { user: { email: "jo@example.com", needsVerification: true } },
  });
});

describe("registerFreeAccountAction", () => {
  it("registers a free account and asks them to check their inbox", async () => {
    const state = await registerFreeAccountAction(undefined, formData(valid));

    expect(state).toEqual({ status: "check_email", email: "jo@example.com", next: "/account" });
    expect(backendRegister).toHaveBeenCalledWith({
      email: "jo@example.com",
      password: "Passw0rdOk",
      firstName: "Jo",
      lastName: "Bloggs",
      newsletters: false,
      verificationReturnUrl: "https://staging.voicesradio.co.uk/verify-email?next=%2Faccount",
    });
  });

  it("never sends the member-only updates flag or any role", async () => {
    await registerFreeAccountAction(
      undefined,
      formData({ ...valid, memberUpdates: "on", role: "admin" }),
    );
    const sent = vi.mocked(backendRegister).mock.calls[0][0] as Record<string, unknown>;
    expect(sent).not.toHaveProperty("memberUpdates");
    expect(sent).not.toHaveProperty("role");
  });

  it("passes the newsletter opt-in through", async () => {
    await registerFreeAccountAction(undefined, formData({ ...valid, newsletters: "on" }));
    expect(backendRegister).toHaveBeenCalledWith(expect.objectContaining({ newsletters: true }));
  });

  it("carries a safe next path through verification, and drops an unsafe one", async () => {
    const safe = await registerFreeAccountAction(
      undefined,
      formData({ ...valid, next: "/shows/abc?save=1" }),
    );
    expect(safe).toMatchObject({ status: "check_email", next: "/shows/abc?save=1" });

    const unsafe = await registerFreeAccountAction(
      undefined,
      formData({ ...valid, next: "//evil.example.com" }),
    );
    expect(unsafe).toMatchObject({ status: "check_email", next: "/account" });
  });

  it("rejects mismatched passwords without calling the backend, keeping what was typed", async () => {
    const state = await registerFreeAccountAction(
      undefined,
      formData({ ...valid, confirmPassword: "Different1" }),
    );

    expect(backendRegister).not.toHaveBeenCalled();
    expect(state).toMatchObject({
      status: "error",
      fieldErrors: { confirmPassword: "Passwords must match." },
      values: { firstName: "Jo", lastName: "Bloggs", email: "jo@example.com" },
    });
    // Passwords are never echoed back.
    expect(JSON.stringify(state)).not.toContain("Passw0rdOk");
  });

  it.each([
    ["short", "Ab1"],
    ["no number", "Passwordonly"],
    ["no capital", "passw0rdonly"],
    ["no lower-case", "PASSW0RDONLY"],
  ])("rejects a weak password (%s)", async (_label, password) => {
    const state = await registerFreeAccountAction(
      undefined,
      formData({ ...valid, password, confirmPassword: password }),
    );
    expect(state).toMatchObject({ status: "error", fieldErrors: { password: expect.any(String) } });
    expect(backendRegister).not.toHaveBeenCalled();
  });

  it("requires first name, last name and a valid email", async () => {
    const state = await registerFreeAccountAction(
      undefined,
      formData({ ...valid, firstName: " ", lastName: "", email: "nope" }),
    );
    expect(state).toMatchObject({
      status: "error",
      fieldErrors: {
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
      },
    });
    expect(backendRegister).not.toHaveBeenCalled();
  });

  it("points an existing address at sign in / forgot password", async () => {
    vi.mocked(backendRegister).mockResolvedValue({
      ok: false,
      status: 400,
      payload: { message: "Email already in use", code: "ACCOUNT_EXISTS" },
    });
    const state = await registerFreeAccountAction(undefined, formData(valid));
    expect(state).toEqual({ status: "account_exists", email: "jo@example.com", next: "/account" });
  });

  it("shows a friendly error when the backend is down", async () => {
    vi.mocked(backendRegister).mockResolvedValue({
      ok: false,
      status: 500,
      payload: { message: "Server error" },
    });
    const state = await registerFreeAccountAction(undefined, formData(valid));
    expect(state).toMatchObject({
      status: "error",
      formError: expect.stringMatching(/try again/i),
      values: { email: "jo@example.com" },
    });
  });

  it("stops at the rate limit", async () => {
    vi.mocked(actionRateLimited).mockResolvedValue("Too many attempts. Try again later.");
    const state = await registerFreeAccountAction(undefined, formData(valid));
    expect(state).toMatchObject({ status: "error", formError: "Too many attempts. Try again later." });
    expect(backendRegister).not.toHaveBeenCalled();
  });
});
