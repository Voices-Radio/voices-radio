import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MembershipState } from "@/lib/voices/membership/schemas";
import MembershipStatusCard from "./membership-status-card";

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

const longAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

describe("MembershipStatusCard: unfinished checkout", () => {
  it("replaces the endless 'Activating…' spinner with a way to finish joining", () => {
    render(
      <MembershipStatusCard
        state={state({
          status: "pending_reconciliation",
          priceMinor: 599,
          cadence: "monthly",
          checkout: { amountMinor: 599, cadence: "monthly", startedAt: longAgo },
        })}
      />,
    );

    expect(screen.queryByText(/activating/i)).not.toBeInTheDocument();
    expect(screen.getByText(/nothing has been charged/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /finish joining/i })).toHaveAttribute(
      "href",
      "/join/checkout?amount=599&cadence=monthly",
    );
  });

  it("offers the same after the checkout lapsed (status null)", () => {
    render(
      <MembershipStatusCard
        state={state({ checkout: { amountMinor: 599, cadence: "monthly", startedAt: longAgo } })}
      />,
    );
    expect(screen.getByTestId("unfinished-checkout")).toBeInTheDocument();
  });

  it("still says 'Activating…' for a payment that has only just been made, with no link to start another", () => {
    render(
      <MembershipStatusCard
        state={state({
          status: "pending_reconciliation",
          priceMinor: 599,
          cadence: "monthly",
          checkout: { amountMinor: 599, cadence: "monthly", startedAt: new Date().toISOString() },
        })}
      />,
    );

    expect(screen.getByText(/activating/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /finish joining/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /manage membership/i })).not.toBeInTheDocument();
  });

  it("is unchanged for someone who never started checkout", () => {
    render(<MembershipStatusCard state={state({})} />);
    expect(screen.getByText(/not a member yet/i)).toBeInTheDocument();
  });
});
