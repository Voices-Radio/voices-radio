import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MembershipState } from "@/lib/voices/membership/schemas";
import JoinStatusBanner from "./join-status-banner";

const state = (overrides: Partial<MembershipState>): MembershipState => ({
  status: null,
  contributionAmountMinor: null,
  cadence: null,
  priceMinor: null,
  currency: "gbp",
  renewsAt: null,
  paidThroughAt: null,
  scheduledChange: null,
  isFoundingMember: false,
  paymentIssue: null,
  checkout: null,
  ...overrides,
});

const lapsed = state({
  checkout: { amountMinor: 599, cadence: "monthly", startedAt: "2026-10-08T10:00:00Z" },
});

describe("JoinStatusBanner", () => {
  it("offers to resume an abandoned checkout with the same choice", () => {
    render(<JoinStatusBanner membership={lapsed} checkoutCancelled={false} />);
    expect(screen.getByText(/pick up where you left off/i)).toBeInTheDocument();
    expect(screen.getByText(/£5\.99/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /finish joining/i })).toHaveAttribute(
      "href",
      "/join/checkout?amount=599&cadence=monthly",
    );
  });

  it("tells an existing member they are already one", () => {
    render(<JoinStatusBanner membership={state({ status: "active" })} checkoutCancelled={false} />);
    expect(screen.getByTestId("join-already-member")).toBeInTheDocument();
    expect(screen.queryByText(/pick up where you left off/i)).not.toBeInTheDocument();
  });

  it("reassures someone who backed out of Stripe that nothing was charged", () => {
    render(<JoinStatusBanner membership={null} checkoutCancelled />);
    expect(screen.getByTestId("join-checkout-cancelled")).toHaveTextContent(/no payment was taken/i);
  });

  it("shows at most one message, the most specific", () => {
    render(<JoinStatusBanner membership={lapsed} checkoutCancelled />);
    expect(screen.queryByTestId("join-checkout-cancelled")).not.toBeInTheDocument();
    expect(screen.getByTestId("join-resume")).toBeInTheDocument();
  });

  it("renders nothing for a visitor we know nothing about", () => {
    const { container } = render(<JoinStatusBanner membership={null} checkoutCancelled={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
