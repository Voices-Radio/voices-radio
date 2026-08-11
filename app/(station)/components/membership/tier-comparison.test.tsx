import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import TierComparison from "./tier-comparison";
import type { MembershipTierView } from "@/lib/voices/membership/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/join",
}));

const tiers: MembershipTierView[] = [
  {
    id: "supporter",
    name: "Supporter",
    headline: "Keep the signal moving.",
    monthlyPriceDisplay: "£4",
    annualPriceDisplay: "£40",
    benefitBullets: ["Frictionless support"],
    mostPopular: false,
  },
  {
    id: "member",
    name: "Member",
    headline: "Get closer to Voices.",
    monthlyPriceDisplay: "£8",
    annualPriceDisplay: "£80",
    benefitBullets: ["10% off Voices merch"],
    mostPopular: true,
  },
];

describe("TierComparison", () => {
  it("renders a semantic table with a column header per tier", () => {
    render(<TierComparison tiers={tiers} cadence="monthly" />);

    const table = screen.getByRole("table");
    const columnHeaders = within(table).getAllByRole("columnheader");
    // One hidden "Attribute" header + one per tier.
    expect(columnHeaders).toHaveLength(1 + tiers.length);
    expect(
      screen.getByRole("columnheader", { name: /supporter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /member/i }),
    ).toBeInTheDocument();
  });

  it("has a row header for each attribute row", () => {
    render(<TierComparison tiers={tiers} cadence="monthly" />);

    expect(
      screen.getByRole("rowheader", { name: "Price" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: /what.?s included/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Get started" }),
    ).toBeInTheDocument();
  });

  it("builds each CTA link with the tier id and current cadence", () => {
    render(<TierComparison tiers={tiers} cadence="annual" />);

    const memberLinks = screen.getAllByRole("link", { name: /choose member/i });
    expect(memberLinks[0]).toHaveAttribute(
      "href",
      "/join/create-account?tier=member&cadence=annual",
    );
  });
});
