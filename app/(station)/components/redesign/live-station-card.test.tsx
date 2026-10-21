import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import LiveStationCard from "./live-station-card";

const live = vi.hoisted(() => ({
  metadata: { title: "Live from Voices KX" } as {
    title: string;
    artwork?: string;
  },
}));

vi.mock("@/hooks/use-radio-cult-live-metadata", () => ({
  default: () => live.metadata,
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
    expect(watchLive.parentElement?.parentElement).toHaveClass("opacity-100");

    await user.click(listenLive);

    expect(onListenLive).toHaveBeenCalledTimes(1);
    expect(onWatchLive).not.toHaveBeenCalled();

    // The video overlay button must not render on KX cards: it sits dead-centre
    // of the card and would swallow clicks aimed at the Listen live button.
    expect(
      screen.queryByRole("button", {
        name: /watch kx live video/i,
        hidden: true,
      }),
    ).toBeNull();
  });

  function renderKx(
    props: Partial<React.ComponentProps<typeof LiveStationCard>> = {},
  ) {
    return render(
      <LiveStationCard
        cardRef={createRef<HTMLButtonElement>()}
        stationId="kx"
        station="KX"
        title="Live from Voices KX"
        watchLiveUrl="https://www.mixcloud.com/live/VoicesRadio/"
        canListenLive
        selected
        onSelect={vi.fn()}
        onWatchLive={vi.fn()}
        onListenLive={vi.fn()}
        {...props}
      />,
    );
  }

  it("shows opposite colours on the two KX actions while either is hovered", async () => {
    const user = userEvent.setup();
    renderKx();

    const watchLive = screen.getByRole("link", { name: /watch voices live/i });
    const listenLive = screen.getByRole("button", {
      name: /listen to voices kx live/i,
    });

    expect(watchLive).toHaveClass("bg-voicesNext-cream");
    expect(listenLive).toHaveClass("bg-voicesNext-orange");

    await user.hover(watchLive);
    expect(watchLive).toHaveClass("bg-voicesNext-orange");
    expect(listenLive).toHaveClass("bg-voicesNext-cream");

    await user.unhover(watchLive);
    await user.hover(listenLive);
    expect(watchLive).toHaveClass("bg-voicesNext-orange");
    expect(listenLive).toHaveClass("bg-voicesNext-cream");

    await user.unhover(listenLive);
    expect(watchLive).toHaveClass("bg-voicesNext-cream");
    expect(listenLive).toHaveClass("bg-voicesNext-orange");
  });

  it("turns Listen live into Stop while the stream plays", () => {
    renderKx({ listenPlaying: true });

    expect(
      screen.getByRole("button", { name: /stop voices kx live/i }),
    ).toHaveTextContent("Stop");
  });

  it("disables Listen live while the stream connects", () => {
    renderKx({ listenLoading: true });

    expect(
      screen.getByRole("button", { name: /connecting to voices kx live/i }),
    ).toBeDisabled();
  });

  it("lifts only the hovered action, so moving between them is visible", async () => {
    const user = userEvent.setup();
    renderKx();

    const watchLive = screen.getByRole("link", { name: /watch voices live/i });
    const listenLive = screen.getByRole("button", {
      name: /listen to voices kx live/i,
    });

    expect(watchLive).toHaveClass("scale-100");
    expect(listenLive).toHaveClass("scale-100");

    await user.hover(watchLive);
    expect(watchLive).toHaveClass("scale-[1.04]");
    expect(listenLive).toHaveClass("scale-100");

    // Straight from one to the other: the lift and the colours both follow.
    await user.hover(listenLive);
    expect(listenLive).toHaveClass("scale-[1.04]");
    expect(watchLive).toHaveClass("scale-100");
    expect(watchLive).toHaveClass("bg-voicesNext-orange");
    expect(listenLive).toHaveClass("bg-voicesNext-cream");

    await user.unhover(listenLive);
    expect(listenLive).toHaveClass("scale-100");
    expect(listenLive).toHaveClass("bg-voicesNext-orange");
  });

  it("greys only the artwork, and only while the stream plays", () => {
    const { container, rerender } = renderKx({ selected: true });

    // Selecting the tile no longer greys anything.
    expect(container.querySelector(".grayscale")).toBeNull();

    rerender(
      <LiveStationCard
        cardRef={createRef<HTMLButtonElement>()}
        stationId="kx"
        station="KX"
        title="Live from Voices KX"
        watchLiveUrl="https://www.mixcloud.com/live/VoicesRadio/"
        canListenLive
        listenPlaying
        selected
        onSelect={vi.fn()}
        onWatchLive={vi.fn()}
        onListenLive={vi.fn()}
      />,
    );

    const grey = container.querySelector(".grayscale");
    expect(grey).not.toBeNull();
    // The header strip ("KX" label) sits outside the greyed block.
    expect(grey).toContainElement(screen.getByRole("heading", { level: 2 }));
    expect(grey).not.toContainElement(screen.getByText("KX"));
  });

  it("does not show the video icon on the KX tile", () => {
    const { container } = renderKx();

    expect(container.querySelector(".lucide-video")).toBeNull();
  });

  describe("artwork", () => {
    afterEach(() => {
      live.metadata = { title: "Live from Voices KX" };
    });

    it("shows the live show's artist photo when one is matched", () => {
      live.metadata = {
        title: "Swimdem Sounds w/ Marley",
        artwork: "https://img.test/marley.jpg",
      };
      renderKx({ artwork: "/station.png", artworkAlt: "KX live artwork" });

      const image = screen.getByRole("img", {
        name: "Swimdem Sounds w/ Marley artist photo",
      });
      expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
        "https://img.test/marley.jpg",
      );
    });

    it("shows the station image when no artist is matched", () => {
      live.metadata = { title: "Afoma V" };
      renderKx({ artwork: "/station.png", artworkAlt: "KX live artwork" });

      const image = screen.getByRole("img", { name: "KX live artwork" });
      expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
        "/station.png",
      );
    });
  });
});
