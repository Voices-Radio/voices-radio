import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendCheckEmail: vi.fn(),
  backendForgotPassword: vi.fn(),
}));

const { backendCheckEmail, backendForgotPassword } = await import(
  "@/lib/voices/membership/auth-client"
);
const { forgotPasswordAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(backendCheckEmail).mockResolvedValue({
    ok: true,
    status: 200,
    payload: { exists: true, email: "artist@example.com" },
  });
  vi.mocked(backendForgotPassword).mockResolvedValue({
    ok: true,
    status: 200,
    payload: { message: "Password reset email sent" },
  });
});

describe("forgotPasswordAction", () => {
  it("validates the email field before calling the backend", async () => {
    const result = await forgotPasswordAction(
      undefined,
      formData({ email: "not-an-email" }),
    );

    expect(result).toEqual({
      status: "error",
      fieldErrors: { email: "Enter a valid email address." },
      formError: "Please fix the errors below.",
    });
    expect(backendCheckEmail).not.toHaveBeenCalled();
    expect(backendForgotPassword).not.toHaveBeenCalled();
  });

  it("returns an account creation prompt when the email is not registered", async () => {
    vi.mocked(backendCheckEmail).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { exists: false, email: "new@example.com" },
    });

    const result = await forgotPasswordAction(
      undefined,
      formData({ email: "new@example.com" }),
    );

    expect(backendCheckEmail).toHaveBeenCalledWith({ email: "new@example.com" });
    expect(backendForgotPassword).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "error",
      accountMissingEmail: "new@example.com",
      formError: "You don't have an account for this email. Create one here.",
    });
  });

  it("requests a reset email and preserves a safe internal return path", async () => {
    const result = await forgotPasswordAction(
      undefined,
      formData({
        email: "artist@example.com",
        next: "/artists/claim/invite-token",
      }),
    );

    expect(backendForgotPassword).toHaveBeenCalledWith({
      email: "artist@example.com",
    });
    expect(result).toEqual({
      status: "success",
      email: "artist@example.com",
      next: "/artists/claim/invite-token",
      message: "Password reset email sent",
    });
  });

  it("drops unsafe return paths", async () => {
    const result = await forgotPasswordAction(
      undefined,
      formData({
        email: "artist@example.com",
        next: "https://example.test/elsewhere",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      email: "artist@example.com",
    });
    expect(result).not.toHaveProperty("next");
  });

  it("returns a form error when the backend rejects the request", async () => {
    vi.mocked(backendForgotPassword).mockResolvedValue({
      ok: false,
      status: 503,
      payload: { message: "Authentication service is unavailable." },
    });

    const result = await forgotPasswordAction(
      undefined,
      formData({ email: "artist@example.com" }),
    );

    expect(result).toEqual({
      status: "error",
      formError: "Authentication service is unavailable.",
    });
  });
});
