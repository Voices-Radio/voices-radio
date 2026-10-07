import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { GuestCheckoutStatus } from "@/lib/voices/membership/schemas";

const swr = vi.hoisted(() => vi.fn());
vi.mock("swr", () => ({ default: swr }));
vi.mock("@/lib/fetcher", () => ({ fetcher: vi.fn() }));
vi.mock("../../verify-email/resend-verification", () => ({
  default: () => <div data-testid="resend" />,
}));

const { default: GuestComplete } = await import("./guest-complete");

const status = (over: Partial<GuestCheckoutStatus>): GuestCheckoutStatus => ({
  paid: false,
  sessionStatus: null,
  needsSetup: true,
  email: "j***@gmail.com",
  ...over,
});

beforeEach(() => vi.clearAllMocks());

describe("GuestComplete", () => {
  it("tells a paid joiner which inbox to open, and offers a resend", () => {
    swr.mockReturnValue({ data: status({ paid: true, sessionStatus: "complete" }) });
    render(<GuestComplete sessionId="cs_1" />);

    expect(screen.getByTestId("guest-paid")).toHaveTextContent(/j\*\*\*@gmail\.com/);
    expect(screen.getByTestId("guest-paid")).toHaveTextContent(/create your password/i);
    expect(screen.getByTestId("resend")).toBeInTheDocument();
  });

  it("sends an already-set-up member to sign in rather than to a password step", () => {
    swr.mockReturnValue({ data: status({ paid: true, needsSetup: false }) });
    render(<GuestComplete sessionId="cs_1" />);

    expect(screen.getByTestId("guest-paid-existing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByTestId("resend")).not.toBeInTheDocument();
  });

  it("does NOT claim membership when Stripe says the session expired unpaid", () => {
    swr.mockReturnValue({ data: status({ sessionStatus: "expired" }) });
    render(<GuestComplete sessionId="cs_1" />);

    expect(screen.getByTestId("guest-unpaid")).toHaveTextContent(/haven.t received a payment/i);
    expect(screen.queryByText(/you.re a voices member/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to join/i })).toHaveAttribute("href", "/join");
  });

  it("keeps waiting while the payment is confirming", () => {
    swr.mockReturnValue({ data: status({ sessionStatus: "complete" }) });
    render(<GuestComplete sessionId="cs_1" />);

    expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();
    expect(screen.queryByText(/you.re a voices member/i)).not.toBeInTheDocument();
  });

  it("polls the same-origin status endpoint with the Stripe session id", () => {
    swr.mockReturnValue({ data: undefined });
    render(<GuestComplete sessionId="cs_test 1" />);
    expect(swr.mock.calls[0][0]).toBe("/api/membership/guest-status?session_id=cs_test%201");
  });

  it("shows a retryable message when the status cannot be loaded", () => {
    swr.mockReturnValue({ data: undefined, error: new Error("boom") });
    render(<GuestComplete sessionId="cs_1" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/refresh this page/i);
  });
});
