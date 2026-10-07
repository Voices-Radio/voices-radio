import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MembershipState } from "@/lib/voices/membership/schemas";

const swr = vi.hoisted(() => vi.fn());
vi.mock("swr", () => ({ default: swr }));
vi.mock("@/lib/fetcher", () => ({ fetcher: vi.fn() }));
vi.mock("@/lib/voices/membership/analytics", () => ({ trackMembershipEvent: vi.fn() }));

const { default: CompletePoller } = await import("./complete-poller");

const state = (overrides: Partial<MembershipState>): MembershipState => ({
  status: null,
  contributionAmountMinor: null,
  cadence: null,
  priceMinor: null,
  currency: null,
  renewsAt: null,
  paidThroughAt: null,
  scheduledChange: null,
  isFoundingMember: false,
  paymentIssue: null,
  checkout: null,
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("CompletePoller", () => {
  it("celebrates only once a real membership exists", () => {
    swr.mockReturnValue({ data: state({ status: "active", priceMinor: 599, currency: "gbp", cadence: "monthly" }) });
    render(<CompletePoller />);
    expect(screen.getByText(/you.re a voices member/i)).toBeInTheDocument();
  });

  it.each([null, "expired"] as const)(
    "does NOT claim membership when the backend reports status %s (e.g. the page was opened without paying)",
    (status) => {
      swr.mockReturnValue({ data: state({ status }) });
      render(<CompletePoller />);
      expect(screen.queryByText(/you.re a voices member/i)).not.toBeInTheDocument();
      expect(screen.getByText(/haven.t received a payment/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to join/i })).toHaveAttribute("href", "/join");
    },
  );

  it("keeps waiting while the payment is still settling", () => {
    swr.mockReturnValue({ data: state({ status: "pending_reconciliation" }) });
    render(<CompletePoller />);
    expect(screen.getByText(/activating your membership/i)).toBeInTheDocument();
  });
});
