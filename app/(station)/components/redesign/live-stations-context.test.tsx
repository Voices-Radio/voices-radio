import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/voices/config")>();
  return {
    ...actual,
    getVoicesLiveStation: (id: string) => ({
      ...actual.getVoicesLiveStation(id as "kx" | "east"),
      radioCultStationId: `rc-${id}`,
    }),
  };
});

const { LiveStationsProvider, useLiveStation } =
  await import("./live-stations-context");

function Title({ station }: { station: "kx" | "east" }) {
  const metadata = useLiveStation(station);
  return <span data-testid={station}>{metadata.title}</span>;
}

function payload(title: string) {
  return Response.json({
    stationLabel: "KX",
    status: "schedule",
    title,
  });
}

describe("LiveStationsProvider", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("polls each station once, shared by every consumer, and never opens a socket", async () => {
    fetchMock.mockImplementation(async () => payload("Breakfast Show"));

    render(
      <LiveStationsProvider>
        <Title station="kx" />
        <Title station="kx" />
        <Title station="east" />
      </LiveStationsProvider>,
    );
    await act(async () => {});

    expect(fetchMock.mock.calls.map(([url]) => url).sort()).toEqual([
      "/api/radio-cult/live?station=east",
      "/api/radio-cult/live?station=kx",
    ]);
    expect(screen.getAllByTestId("kx")[0]).toHaveTextContent("Breakfast Show");
  });

  it("refreshes every 30s and keeps the last good value when a poll fails", async () => {
    fetchMock.mockImplementationOnce(async () => payload("First"));
    fetchMock.mockImplementationOnce(async () => payload("First"));
    render(
      <LiveStationsProvider>
        <Title station="kx" />
      </LiveStationsProvider>,
    );
    await act(async () => {});
    expect(screen.getByTestId("kx")).toHaveTextContent("First");

    fetchMock.mockImplementation(
      async () => new Response("no", { status: 502 }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(fetchMock.mock.calls.length).toBeGreaterThan(2);
    expect(screen.getByTestId("kx")).toHaveTextContent("First");
  });

  it("falls back to static metadata outside a provider", () => {
    render(<Title station="kx" />);
    expect(screen.getByTestId("kx")).toBeInTheDocument();
  });
});
