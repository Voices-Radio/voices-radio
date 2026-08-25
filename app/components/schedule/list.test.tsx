import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ScheduleList from "./list";

vi.mock("@/hooks/use-week-info", () => ({
  default: () => ({
    data: {
      kx: { "2026-08-24T00:00:00.000Z": [] },
      east: { "2026-08-24T00:00:00.000Z": [] },
    },
  }),
}));

function stationTab(label: string) {
  return screen.getByRole("button", { name: label });
}

describe("ScheduleList", () => {
  it("defaults to the KX tab when no initial station is given", () => {
    render(<ScheduleList />);

    expect(stationTab("KX")).toHaveAttribute("aria-pressed", "true");
    expect(stationTab("EAST")).toHaveAttribute("aria-pressed", "false");
  });

  it("opens on the station it is pointed at", () => {
    render(<ScheduleList initialStation="east" />);

    expect(stationTab("EAST")).toHaveAttribute("aria-pressed", "true");
    expect(stationTab("KX")).toHaveAttribute("aria-pressed", "false");
  });
});
