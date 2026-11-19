import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useStationAudio from "./use-station-audio";

function Harness() {
  const { audioRef, playing, loading, error, toggle } = useStationAudio(
    "https://example.test/stream",
    "test-player",
  );
  return (
    <>
      <audio ref={audioRef} data-testid="audio" />
      <button onClick={toggle}>toggle</button>
      <output data-testid="state">
        {error ? "error" : loading ? "loading" : playing ? "playing" : "idle"}
      </output>
    </>
  );
}

describe("useStationAudio interruptions", () => {
  let play: ReturnType<typeof vi.fn>;
  let load: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    play = vi.fn().mockResolvedValue(undefined);
    load = vi.fn();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(
      play as never,
    );
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
      load as never,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function start() {
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByText("toggle"));
    });
    act(() => {
      fireEvent(screen.getByTestId("audio"), new Event("playing"));
    });
    expect(screen.getByTestId("state").textContent).toBe("playing");
    play.mockClear();
  }

  it("resumes after an OS interruption pauses the element", async () => {
    await start();
    await act(async () => {
      fireEvent(screen.getByTestId("audio"), new Event("pause"));
    });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("shows the real paused state when resume is refused", async () => {
    await start();
    play.mockRejectedValue(new Error("NotAllowedError"));
    await act(async () => {
      fireEvent(screen.getByTestId("audio"), new Event("pause"));
    });
    expect(screen.getByTestId("state").textContent).toBe("idle");
  });

  it("does not resume after a deliberate stop", async () => {
    await start();
    await act(async () => {
      fireEvent.click(screen.getByText("toggle"));
    });
    act(() => {
      fireEvent(screen.getByTestId("audio"), new Event("pause"));
    });
    expect(play).not.toHaveBeenCalled();
    expect(screen.getByTestId("state").textContent).toBe("idle");
  });

  it("reconnects a stalled stream", async () => {
    await start();
    act(() => {
      fireEvent(screen.getByTestId("audio"), new Event("waiting"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000 + 1_000);
    });
    expect(load).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("reconnects when the stream ends or errors", async () => {
    await start();
    act(() => {
      fireEvent(screen.getByTestId("audio"), new Event("ended"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("gives up with an error after repeated failures", async () => {
    await start();
    play.mockRejectedValue(new Error("fail"));
    act(() => {
      fireEvent(screen.getByTestId("audio"), new Event("error"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(screen.getByTestId("state").textContent).toBe("error");
  });
});
