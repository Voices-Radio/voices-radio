import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `voicesLiveStations` reads the stream URLs at module load, and a station with
// no stream URL is disabled regardless of `comingSoon` — so without these the
// "East stays disabled" assertion below would pass for the wrong reason.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_RADIOCULT_KX_STREAM_URL =
    "https://example.test/kx.mp3";
  process.env.NEXT_PUBLIC_RADIOCULT_EAST_STREAM_URL =
    "https://example.test/east.mp3";
});

import ExploreLiveStrip from "./explore-live-strip";

vi.mock("@/hooks/use-radio-cult-live-metadata", () => ({
  default: () => ({ title: "The Breakfast Show", status: "onAir" }),
}));

vi.mock("@/hooks/use-station-audio", () => ({
  default: () => ({
    audioRef: { current: null },
    error: false,
    loading: false,
    playing: false,
    toggle: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-week-info", () => ({
  default: () => ({ data: undefined }),
}));

function mobileControls() {
  return screen.getByLabelText("Mobile live controls");
}

describe("ExploreLiveStrip mobile controls", () => {
  it("stacks the two stations full-width instead of splitting them in half", () => {
    render(<ExploreLiveStrip />);

    const controls = mobileControls();

    expect(controls).toHaveClass("flex");
    expect(controls).toHaveClass("flex-col");
    expect(controls.className).not.toContain("grid-cols-2");
  });

  it("gives each station its own schedule and chat control", () => {
    render(<ExploreLiveStrip />);

    const controls = mobileControls();

    expect(
      within(controls).getByRole("button", { name: "Open KX schedule" }),
    ).toBeInTheDocument();
    expect(
      within(controls).getByRole("button", { name: "Open EAST schedule" }),
    ).toBeInTheDocument();
    expect(
      within(controls).getAllByRole("link", { name: "Open chat" }),
    ).toHaveLength(2);
  });

  it("keeps East's play control disabled while it is still coming soon", () => {
    render(<ExploreLiveStrip />);

    const controls = mobileControls();

    expect(
      within(controls).getByRole("button", { name: "Play KX" }),
    ).toBeEnabled();
    expect(
      within(controls).getByRole("button", { name: "Play EAST" }),
    ).toBeDisabled();
  });

  it("no longer renders the previous/now/next row on mobile", () => {
    render(<ExploreLiveStrip />);

    // The only remaining schedule-context block is the desktop one, which is
    // inside the `hidden md:flex` row rather than the mobile controls.
    expect(screen.getAllByLabelText("KX schedule context")).toHaveLength(1);
    expect(within(mobileControls()).queryByText("Previous")).toBeNull();
  });
});

describe("ExploreLiveStrip desktop controls", () => {
  it("reserves room for two 34px station rows plus the player borders", () => {
    const { container } = render(<ExploreLiveStrip />);

    const desktopPlayer = container.querySelector(
      'section[aria-label="Live player"] > div.hidden',
    );

    expect(desktopPlayer).toHaveClass("md:h-[70px]");
    expect(desktopPlayer?.className).not.toContain("md:h-[68px]");
  });
});
