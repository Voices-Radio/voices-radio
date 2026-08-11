import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TierCard from "./tier-card";
import type { MembershipTierView } from "@/lib/voices/membership/types";

const memberTier: MembershipTierView = {
  id: "member",
  name: "Member",
  headline: "Get closer to Voices.",
  monthlyPriceDisplay: "£8",
  annualPriceDisplay: "£80",
  benefitBullets: ["10% off Voices merch", "Event presales"],
  mostPopular: true,
};

const supporterTier: MembershipTierView = {
  id: "supporter",
  name: "Supporter",
  headline: "Keep the signal moving.",
  monthlyPriceDisplay: "£4",
  annualPriceDisplay: "£40",
  benefitBullets: ["Frictionless support"],
  mostPopular: false,
};

describe("TierCard", () => {
  it("shows the monthly price and label for monthly cadence", () => {
    render(
      <TierCard tier={memberTier} cadence="monthly" ctaHref="/join/create-account" />,
    );

    expect(screen.getByText("£8")).toBeInTheDocument();
    expect(screen.getByText("/month")).toBeInTheDocument();
  });

  it("shows the annual price and label for annual cadence", () => {
    render(
      <TierCard tier={memberTier} cadence="annual" ctaHref="/join/create-account" />,
    );

    expect(screen.getByText("£80")).toBeInTheDocument();
    expect(screen.getByText("/year")).toBeInTheDocument();
  });

  it("renders a Most popular badge, described via aria-describedby, for the popular tier", () => {
    const { container } = render(
      <TierCard tier={memberTier} cadence="monthly" ctaHref="/join/create-account" />,
    );

    expect(screen.getByText("Most popular")).toBeInTheDocument();
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveAttribute("aria-describedby", "member-most-popular");
  });

  it("does not render a Most popular badge for a non-popular tier", () => {
    const { container } = render(
      <TierCard tier={supporterTier} cadence="monthly" ctaHref="/join/create-account" />,
    );

    expect(screen.queryByText("Most popular")).not.toBeInTheDocument();
    const card = container.firstElementChild as HTMLElement;
    expect(card).not.toHaveAttribute("aria-describedby");
  });

  it("links the CTA to the given href with the tier name", () => {
    render(
      <TierCard tier={supporterTier} cadence="monthly" ctaHref="/join/create-account?tier=supporter" />,
    );

    const link = screen.getByRole("link", { name: /choose supporter/i });
    expect(link).toHaveAttribute("href", "/join/create-account?tier=supporter");
  });

  it("renders every benefit bullet", () => {
    render(
      <TierCard tier={memberTier} cadence="monthly" ctaHref="/join/create-account" />,
    );

    for (const bullet of memberTier.benefitBullets) {
      expect(screen.getByText(bullet)).toBeInTheDocument();
    }
  });
});
