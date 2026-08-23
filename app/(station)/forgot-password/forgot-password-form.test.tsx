import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "./forgot-password-form";

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    useFormState: () => [undefined, vi.fn()],
    useFormStatus: () => ({ pending: false }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ForgotPasswordForm", () => {
  it("shows a create-account link when the entered email has no account", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exists: false, email: "new@example.com" }),
      }),
    );

    const user = userEvent.setup();
    render(<ForgotPasswordForm email="" next="" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");

    await waitFor(() => {
      expect(
        screen.getByText(/you don't have an account/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /create one here/i }),
    ).toHaveAttribute("href", "/join/create-account");
  });
});
