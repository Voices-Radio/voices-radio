import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const formState = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("./actions", () => ({ registerFreeAccountAction: vi.fn() }));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormState: (_action: unknown, initial: unknown) => [
    formState.current ?? initial,
    vi.fn(),
  ],
  useFormStatus: () => ({ pending: false }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("../verify-email/resend-verification", () => ({
  default: ({ email }: { email: string }) => <button>Resend to {email}</button>,
}));

const { default: FreeAccountForm } = await import("./create-account-form");

describe("FreeAccountForm", () => {
  it("captures name, email, password and confirmation, with no payment step", () => {
    formState.current = undefined;
    render(<FreeAccountForm next="" />);

    expect(screen.getByLabelText("First name")).toBeRequired();
    expect(screen.getByLabelText("Last name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText(/^Create a password/)).toBeRequired();
    expect(screen.getByLabelText(/^Confirm your password/)).toBeRequired();
    expect(screen.getByRole("button", { name: "Create free account" })).toBeInTheDocument();
    expect(screen.queryByText(/payment/i)).toBeNull();
  });

  it("offers only the newsletter opt-in, not member-only updates", () => {
    formState.current = undefined;
    render(<FreeAccountForm next="" />);

    const newsletter = screen.getByRole("checkbox", { name: /Voices newsletter/i });
    expect(newsletter).not.toBeChecked();
    expect(screen.queryByRole("checkbox", { name: /member-only updates/i })).toBeNull();
  });

  it("threads next through the hidden field and the sign-in / join links", () => {
    formState.current = undefined;
    const { container } = render(<FreeAccountForm next="/shows/abc" />);

    expect(container.querySelector('input[name="next"]')).toHaveValue("/shows/abc");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?next=%2Fshows%2Fabc",
    );
    expect(screen.getByRole("link", { name: "Join as a member" })).toHaveAttribute(
      "href",
      "/join?next=%2Fshows%2Fabc",
    );
  });

  it("keeps what was typed after an error but never refills passwords", () => {
    formState.current = {
      status: "error",
      formError: "Please fix the errors below.",
      fieldErrors: { confirmPassword: "Passwords must match." },
      values: { firstName: "Jo", lastName: "Bloggs", email: "jo@example.com", newsletters: true },
    };
    render(<FreeAccountForm next="" />);

    expect(screen.getByLabelText("First name")).toHaveValue("Jo");
    expect(screen.getByLabelText("Email")).toHaveValue("jo@example.com");
    expect(screen.getByRole("checkbox", { name: /newsletter/i })).toBeChecked();
    expect(screen.getByLabelText(/^Create a password/)).toHaveValue("");
    expect(screen.getByText("Passwords must match.")).toBeInTheDocument();
    expect(screen.getByTestId("form-error")).toHaveTextContent("Please fix the errors below.");
  });

  it("tells them to check their inbox once registered", () => {
    formState.current = { status: "check_email", email: "jo@example.com", next: "/account" };
    render(<FreeAccountForm next="" />);

    expect(screen.getByRole("heading", { name: /check your inbox/i })).toBeInTheDocument();
    expect(screen.getByText("jo@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resend to jo@example.com/ })).toBeInTheDocument();
  });

  it("sends an existing address to sign in, keeping next", () => {
    formState.current = { status: "account_exists", email: "jo@example.com", next: "/shows/abc" };
    render(<FreeAccountForm next="" />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?next=%2Fshows%2Fabc",
    );
    expect(screen.getByRole("link", { name: "Forgot password?" })).toBeInTheDocument();
  });
});
