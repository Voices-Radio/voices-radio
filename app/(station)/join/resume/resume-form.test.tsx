import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const formState = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("./actions", () => ({ resumeCheckoutAction: vi.fn() }));
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

const { default: ResumeForm } = await import("./resume-form");

beforeEach(() => {
  formState.current = undefined;
});

describe("ResumeForm", () => {
  it("shows the chosen contribution and ONE button that submits the token", () => {
    const { container } = render(
      <ResumeForm token="tok" amount="599" cadence="monthly" />,
    );

    expect(screen.getByText(/£5\.99\/month/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue to payment/i }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="token"]')).toHaveValue("tok");
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("still works without a displayable amount", () => {
    render(<ResumeForm token="tok" amount="" cadence="" />);
    expect(
      screen.getByRole("button", { name: /continue to payment/i }),
    ).toBeInTheDocument();
  });

  it("offers a fresh start when the link is invalid or expired", () => {
    formState.current = { status: "link_invalid" };
    render(<ResumeForm token="tok" amount="599" cadence="monthly" />);
    expect(screen.getByText(/link has expired/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start again/i })).toHaveAttribute(
      "href",
      "/join?cadence=monthly",
    );
  });

  it("sends someone with a full account to sign in", () => {
    formState.current = { status: "account_exists" };
    render(<ResumeForm token="tok" amount="599" cadence="monthly" />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      `/sign-in?next=${encodeURIComponent("/join/checkout?amount=599&cadence=monthly")}`,
    );
  });

  it("tells someone who already paid to check their inbox", () => {
    formState.current = { status: "setup_pending" };
    render(<ResumeForm token="tok" amount="599" cadence="monthly" />);
    expect(screen.getByText(/already joined/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue to payment/i })).toBeNull();
  });

  it("keeps the button for a retry after a transient error", () => {
    formState.current = { status: "error", message: "We couldn't reach the server." };
    render(<ResumeForm token="tok" amount="599" cadence="monthly" />);
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't reach the server.");
    expect(
      screen.getByRole("button", { name: /continue to payment/i }),
    ).toBeInTheDocument();
  });
});
