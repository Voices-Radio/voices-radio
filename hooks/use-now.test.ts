import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useNow from "./use-now";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-24T09:59:50.000Z") });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useNow", () => {
  it("returns the current time and advances with the clock", () => {
    const { result } = renderHook(() => useNow(30_000));
    expect(result.current.toISOString()).toBe("2026-10-24T09:59:50.000Z");

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.toISOString()).toBe("2026-10-24T10:00:20.000Z");
  });
});
