import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LiveStationCard from "./live-station-card";

vi.mock("@/hooks/use-radio-cult-live-metadata", () => ({
  default: () => ({ title: "Live from Voices KX" }),
}));

describe("LiveStationCard", () => {
  it("reveals KX Watch Live and Listen Live actions after a mobile tap", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onWatchLive = vi.fn();
    const onListenLive = vi.fn();

    function TestCard() {
      const cardRef = createRef<HTMLButtonElement>();
      const [selected, setSelected] = useState(false);

      return (
        <LiveStationCard
          cardRef={cardRef}
          stationId="kx"
          station="KX"
          title="Live from Voices KX"
          artwork="/voices.svg"
          artworkAlt="Voices"
          watchLiveUrl="https://www.mixcloud.com/live/VoicesRadio/"
          canListenLive
          selected={selected}
          onSelect={() => {
            onSelect();
            setSelected(true);
          }}
          onWatchLive={onWatchLive}
          onListenLive={onListenLive}
        />
      );
    }

    render(<TestCard />);

    const watchLive = screen.getByRole("link", {
      name: /watch voices live on mixcloud/i,
    });
    const listenLive = screen.getByRole("button", {
      name: /listen to voices kx live/i,
    });

    expect(watchLive).toHaveAttribute("tabindex", "-1");
    expect(listenLive).toHaveAttribute("tabindex", "-1");

    await user.click(
      screen.getByRole("button", { name: /show kx live actions/i }),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(watchLive).toHaveAttribute("tabindex", "0");
    expect(listenLive).toHaveAttribute("tabindex", "0");
    expect(watchLive.parentElement).toHaveClass("opacity-100");

    await user.click(listenLive);

    expect(onListenLive).toHaveBeenCalledTimes(1);
    expect(onWatchLive).not.toHaveBeenCalled();
  });
});
