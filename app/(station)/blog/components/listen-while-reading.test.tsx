import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { VoicesShow } from "@/lib/voices/types";
import { ArchivePlayerProvider } from "../../components/redesign/archive-player-context";
import ListenWhileReading from "./listen-while-reading";

function buildShow(overrides: Partial<VoicesShow> = {}): VoicesShow {
  return {
    id: "show-1",
    title: "Jammin w/ Matt Odyssey",
    description: "",
    artwork: { alt: "", source: "fallback", src: "/voices.svg" },
    featured: false,
    genres: ["Hip Hop", "Ambient"],
    locationTags: [],
    station: "kx",
    archiveMedia: {
      id: "media-1",
      provider: "mixcloud",
      title: "Jammin w/ Matt Odyssey",
      sourceUrl: "https://mixcloud.com/voices/jammin",
      embedUrl: "https://player-widget.mixcloud.com/widget/iframe/",
      externalUrl: "https://mixcloud.com/voices/jammin",
      artwork: { alt: "", source: "fallback", src: "/voices.svg" },
      duration: 3600,
    },
    ...overrides,
  } as VoicesShow;
}

function renderInPlayer(show: VoicesShow) {
  return render(
    <ArchivePlayerProvider>
      <ListenWhileReading show={show} />
    </ArchivePlayerProvider>,
  );
}

describe("ListenWhileReading", () => {
  it("offers the show's archive without leaving the article", () => {
    renderInPlayer(buildShow());

    expect(screen.getByText("Listen while you read")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /listen back/i }),
    ).toBeEnabled();
  });

  it("links through to the show page for anyone who wants the full page", () => {
    renderInPlayer(buildShow());

    expect(
      screen.getByRole("link", { name: "Jammin w/ Matt Odyssey" }),
    ).toHaveAttribute("href", "/shows/show-1");
  });

  it("renders nothing when the show has no archive recording", () => {
    const { container } = renderInPlayer(
      buildShow({ archiveMedia: undefined }),
    );

    // A post pointing at a show with nothing to play should read exactly as
    // it did before, not show a dead transport.
    expect(container).toBeEmptyDOMElement();
  });
});
