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

import { LiveAudioProvider } from "../components/redesign/live-audio-context";
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

function renderStrip() {
  return render(
    <LiveAudioProvider>
      <ExploreLiveStrip />
    </LiveAudioProvider>,
  );
}

describe("ExploreLiveStrip audio", () => {
  it("renders exactly one audio element per station, shared by both strips", () => {
    const { container } = renderStrip();

    // Mobile and desktop strips both mount. A second element per station is
    // what made "Listen live" start the stream twice.
    expect(container.querySelectorAll("audio")).toHaveLength(2);
  });
});

describe("ExploreLiveStrip mobile controls", () => {
  it("stacks the two stations full-width instead of splitting them in half", () => {
    renderStrip();

    const controls = mobileControls();

    expect(controls).toHaveClass("flex");
    expect(controls).toHaveClass("flex-col");
    expect(controls.className).not.toContain("grid-cols-2");
  });

  it("gives each station its own schedule and chat control", () => {
    renderStrip();

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
    renderStrip();

    const controls = mobileControls();

    expect(
      within(controls).getByRole("button", { name: "Play KX" }),
    ).toBeEnabled();
    expect(
      within(controls).getByRole("button", { name: "Play EAST" }),
    ).toBeDisabled();
  });

  it("no longer renders the previous/now/next row on mobile", () => {
    renderStrip();

    // The only remaining schedule-context block is the desktop one, which is
    // inside the `hidden md:flex` row rather than the mobile controls.
    expect(screen.getAllByLabelText("KX schedule context")).toHaveLength(1);
    expect(within(mobileControls()).queryByText("Previous")).toBeNull();
  });
});

describe("ExploreLiveStrip desktop controls", () => {
  it("shows only Next in the schedule context, because the station block already names the show on air", () => {
    renderStrip();

    const context = screen.getByLabelText("KX schedule context");

    expect(within(context).getByText("Next")).toBeInTheDocument();
    expect(within(context).queryByText("Now")).toBeNull();
    expect(within(context).queryByText("Previous")).toBeNull();
  });

  it("hides the schedule context below lg, where the block shrank to a few pixels", () => {
    renderStrip();

    const context = screen.getByLabelText("KX schedule context");

    expect(context).toHaveClass("hidden");
    expect(context).toHaveClass("lg:grid");
  });

  it("wraps long show titles to two lines instead of cutting them to one", () => {
    renderStrip();

    const context = screen.getByLabelText("KX schedule context");
    // No week data is mocked, so the schedule falls back to "TBA".
    const titles = [within(context).getByText("TBA")];

    for (const title of titles) {
      expect(title).toHaveClass("line-clamp-2");
      expect(title).toHaveClass("[overflow-wrap:anywhere]");
      expect(title).not.toHaveClass("truncate");
      // Titles past two lines still clamp, so hover keeps the full text.
      expect(title).toHaveAttribute("title", title.textContent);
    }
  });

  it("reserves room for two 34px station rows plus the player borders", () => {
    const { container } = renderStrip();

    const desktopPlayer = container.querySelector(
      'section[aria-label="Live player"] > div.hidden',
    );

    expect(desktopPlayer).toHaveClass("md:h-[70px]");
    expect(desktopPlayer?.className).not.toContain("md:h-[68px]");
  });
});
