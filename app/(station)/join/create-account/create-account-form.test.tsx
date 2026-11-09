import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const formState = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("./actions", () => ({ createAccountAction: vi.fn() }));
// The installed react-dom has no form-state hooks under test; the form only
// needs them to exist, not to drive a real server action.
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormState: (_action: unknown, initial: unknown) => [
    formState.current ?? initial,
    vi.fn(),
  ],
  useFormStatus: () => ({ pending: false }),
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const { default: CreateAccountForm } = await import("./create-account-form");

describe("CreateAccountForm consent checkboxes", () => {
  it("labels the general list as the newsletter, distinct from member-only updates", () => {
    render(<CreateAccountForm amount="699" cadence="monthly" />);

    expect(
      screen.getByRole("checkbox", { name: /Voices newsletter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /member-only updates/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Send me Voices news and updates/i)).toBeNull();
  });

  it("pre-ticks member-only updates but leaves the general newsletter unticked", () => {
    render(<CreateAccountForm amount="699" cadence="monthly" />);

    expect(
      screen.getByRole("checkbox", { name: /member-only updates/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /Voices newsletter/i }),
    ).not.toBeChecked();
  });

  it("submits the two consents under separate field names", () => {
    render(<CreateAccountForm amount="699" cadence="monthly" />);

    expect(
      screen.getByRole("checkbox", { name: /Voices newsletter/i }),
    ).toHaveAttribute("name", "newsletters");
    expect(
      screen.getByRole("checkbox", { name: /member-only updates/i }),
    ).toHaveAttribute("name", "memberUpdates");
  });
});

describe("CreateAccountForm sign-in routes", () => {
  const NEXT = "/artists?saveArtist=507f1f77bcf86cd799439041";

  it("offers a plain sign-in link when the visitor came straight to join", () => {
    formState.current = undefined;
    render(<CreateAccountForm amount="699" cadence="monthly" />);

    expect(
      screen.getByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", "/sign-in");
  });

  it("carries the page the visitor was on through the sign-in link", () => {
    formState.current = undefined;
    render(<CreateAccountForm amount="699" cadence="monthly" next={NEXT} />);

    expect(screen.getByText(/Already have an account\?/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", `/sign-in?next=${encodeURIComponent(NEXT)}`);
  });

  it("tells an existing account holder and sends them back to where they were", () => {
    formState.current = { status: "account_exists", email: "dj@example.com" };
    render(<CreateAccountForm amount="699" cadence="monthly" next={NEXT} />);

    expect(
      screen.getByText("You already have an account"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", `/sign-in?next=${encodeURIComponent(NEXT)}`);
    formState.current = undefined;
  });

  it("without a next, an existing account resumes payment", () => {
    formState.current = { status: "account_exists", email: "dj@example.com" };
    render(<CreateAccountForm amount="699" cadence="monthly" />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      `/sign-in?next=${encodeURIComponent("/join/checkout?amount=699&cadence=monthly")}`,
    );
    formState.current = undefined;
  });
});
