import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const validate = vi.fn();

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendValidatePasswordResetToken: (token: string) => validate(token),
}));
vi.mock("./reset-password-form", () => ({
  default: ({ token }: { token: string }) => (
    <form data-testid="form" data-token={token} />
  ),
}));

const { default: ResetPasswordPage } = await import("./page");

const renderPage = async (params: { token?: string }) =>
  render(await ResetPasswordPage({ searchParams: Promise.resolve(params) }));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    validate.mockReset();
  });

  it("shows the form for a valid link", async () => {
    validate.mockResolvedValue({
      ok: true,
      status: 200,
      payload: { valid: true, type: "password_reset" },
    });

    await renderPage({ token: "abc" });

    expect(screen.getByTestId("form")).toHaveAttribute("data-token", "abc");
  });

  // A refresh after a successful reset lands here: the link is spent, so the
  // page must say so and point to sign-in, not show the form again.
  it("tells the user to sign in when the link was already used", async () => {
    validate.mockResolvedValue({
      ok: false,
      status: 400,
      payload: {
        valid: false,
        message: "Invalid or expired token",
        code: "TOKEN_USED",
      },
    });

    await renderPage({ token: "used" });

    expect(screen.queryByTestId("form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /reset link already used/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(
      screen.getByRole("link", { name: /request a new password reset/i }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("keeps the general message for a link that is unknown or expired", async () => {
    validate.mockResolvedValue({
      ok: false,
      status: 400,
      payload: { valid: false, message: "Invalid or expired token" },
    });

    await renderPage({ token: "expired" });

    expect(
      screen.getByRole("heading", { name: /reset link unavailable/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Invalid or expired token")).toBeInTheDocument();
  });

  it("explains a link with no token", async () => {
    await renderPage({});

    expect(screen.getByText(/missing a token/i)).toBeInTheDocument();
    expect(validate).not.toHaveBeenCalled();
  });
});
