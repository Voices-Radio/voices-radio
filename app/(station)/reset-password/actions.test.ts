import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendResetPassword: vi.fn(),
}));

const { backendResetPassword } = await import(
  "@/lib/voices/membership/auth-client"
);
const { resetPasswordAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(backendResetPassword).mockResolvedValue({
    ok: true,
    status: 200,
    payload: { message: "Password reset successfully" },
  });
});

describe("resetPasswordAction", () => {
  it("validates password length and matching confirmation", async () => {
    const result = await resetPasswordAction(
      undefined,
      formData({
        token: "reset-token",
        password: "short",
        confirmPassword: "different",
      }),
    );

    expect(result).toEqual({
      status: "error",
      fieldErrors: {
        password: "Use at least 8 characters.",
        confirmPassword: "Passwords must match.",
      },
      formError: "Please fix the errors below.",
    });
    expect(backendResetPassword).not.toHaveBeenCalled();
  });

  it("submits the reset token and password to the backend", async () => {
    const result = await resetPasswordAction(
      undefined,
      formData({
        token: "reset-token",
        password: "new-password",
        confirmPassword: "new-password",
        next: "/artists/claim/invite-token",
      }),
    );

    expect(backendResetPassword).toHaveBeenCalledWith({
      token: "reset-token",
      password: "new-password",
    });
    expect(result).toEqual({
      status: "success",
      next: "/artists/claim/invite-token",
      message: "Password reset successfully",
    });
  });

  it("drops unsafe return paths", async () => {
    const result = await resetPasswordAction(
      undefined,
      formData({
        token: "reset-token",
        password: "new-password",
        confirmPassword: "new-password",
        next: "//example.test",
      }),
    );

    expect(result).toMatchObject({ status: "success" });
    expect(result).not.toHaveProperty("next");
  });

  it("returns a form error when the backend rejects the token", async () => {
    vi.mocked(backendResetPassword).mockResolvedValue({
      ok: false,
      status: 400,
      payload: { message: "Invalid or expired token" },
    });

    const result = await resetPasswordAction(
      undefined,
      formData({
        token: "reset-token",
        password: "new-password",
        confirmPassword: "new-password",
      }),
    );

    expect(result).toEqual({
      status: "error",
      formError: "Invalid or expired token",
    });
  });
});
