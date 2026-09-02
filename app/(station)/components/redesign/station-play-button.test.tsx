import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StationPlayButton from "./station-play-button";

const base = {
  label: "KX",
  playing: false,
  loading: false,
  onToggle: vi.fn(),
};

describe("StationPlayButton", () => {
  it("announces itself as playable when idle", () => {
    render(<StationPlayButton {...base} />);

    expect(screen.getByRole("button", { name: "Play KX" })).toBeEnabled();
  });

  it("shows a spinner and says it is connecting while loading", () => {
    const { container } = render(<StationPlayButton {...base} loading />);

    // The regression this component exists to prevent: a disabled button with
    // a frozen Play icon reads as "unavailable", not "connecting".
    const button = screen.getByRole("button", { name: "Connecting to KX" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("offers a retry rather than a plain play after a failed stream", () => {
    render(<StationPlayButton {...base} error />);

    expect(screen.getByRole("button", { name: "Retry KX" })).toBeEnabled();
  });

  it("switches to pause while playing", () => {
    render(<StationPlayButton {...base} playing />);

    expect(screen.getByRole("button", { name: "Pause KX" })).toBeEnabled();
  });

  it("disables itself for a station that has not launched", () => {
    render(<StationPlayButton {...base} label="EAST" unavailable />);

    expect(screen.getByRole("button", { name: "Play EAST" })).toBeDisabled();
  });

  it("prefers the loading label over the error label when retrying", () => {
    render(<StationPlayButton {...base} error loading />);

    expect(
      screen.getByRole("button", { name: "Connecting to KX" }),
    ).toBeInTheDocument();
  });
});
