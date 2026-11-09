import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContributionSlider, { buildTickPositions } from "./contribution-slider";

describe("buildTickPositions", () => {
  it("draws one tick per step, including both ends", () => {
    expect(buildTickPositions(399, 1599, 100)).toHaveLength(13);
  });

  it("caps the count so a fine step doesn't draw hundreds of ticks", () => {
    expect(buildTickPositions(0, 10000, 1).length).toBeLessThanOrEqual(25);
  });

  it("always keeps the first and last position", () => {
    const ticks = buildTickPositions(0, 10000, 1);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(100);
  });

  it("returns no ticks for a degenerate range", () => {
    expect(buildTickPositions(500, 500, 100)).toEqual([]);
  });
});

describe("ContributionSlider", () => {
  const props = {
    minMinor: 399,
    maxMinor: 1599,
    stepMinor: 100,
    currency: "GBP",
    value: 699,
    onChange: vi.fn(),
  };

  it("keeps the native range input with a formatted aria-valuetext", () => {
    render(<ContributionSlider {...props} />);
    const slider = screen.getByRole("slider", { name: /monthly contribution/i });
    expect(slider).toHaveAttribute("aria-valuetext", "£6.99 per month");
  });

  it("shows the chosen amount as a readout with its period", () => {
    render(<ContributionSlider {...props} />);
    expect(screen.getByTestId("contribution-readout")).toHaveTextContent(
      "£6.99/month",
    );
  });

  it("hides the dial ticks from assistive tech", () => {
    const { container } = render(<ContributionSlider {...props} />);
    expect(
      container.querySelector('[data-testid="contribution-ticks"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });
});
