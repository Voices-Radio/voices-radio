import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LiveStack from "./live-stack";

const audio = vi.hoisted(() => ({
  kx: { playing: false, loading: false, error: false, toggle: vi.fn() },
  east: { playing: false, loading: false, error: false, toggle: vi.fn() },
}));

vi.mock("./live-audio-context", () => ({
  useLiveAudio: (id: "kx" | "east") => audio[id],
}));
vi.mock("@/hooks/use-radio-cult-live-metadata", () => ({
  default: () => ({ title: "Live from Voices KX" }),
}));
vi.mock("@/hooks/use-station-audio", () => ({ stopLiveAudio: vi.fn() }));
vi.mock("@/lib/voices/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/voices/config")>()),
  getVoicesLiveStation: (id: string) => ({
    id,
    label: id.toUpperCase(),
    title: `Live from Voices ${id}`,
    streamUrl: "https://stream.test/live",
    comingSoon: false,
  }),
}));

describe("LiveStack", () => {
  beforeEach(() => {
    audio.kx.playing = false;
    audio.kx.toggle.mockReset();
  });

  it("clears the KX selection when Stop is clicked", async () => {
    const user = userEvent.setup();
    audio.kx.toggle.mockImplementation(async () => {
      audio.kx.playing = !audio.kx.playing;
    });
    const { rerender } = render(<LiveStack />);
    const tile = screen.getByRole("button", { name: /show kx live actions/i });

    await user.click(tile);
    expect(tile).toHaveAttribute("aria-pressed", "true");

    audio.kx.playing = true;
    rerender(<LiveStack />);
    await user.click(screen.getByRole("button", { name: /stop voices kx live/i }));

    expect(tile).toHaveAttribute("aria-pressed", "false");
  });
});
