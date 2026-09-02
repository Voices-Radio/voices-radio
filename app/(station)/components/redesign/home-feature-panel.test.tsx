import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { HomeFeatureItem } from "@/lib/voices/home";
import HomeFeaturePanel from "./home-feature-panel";

function buildItem(index: number): HomeFeatureItem {
  const id = `feature-${index}`;
  const title = `Featured show ${index}`;

  return {
    id,
    type: "show",
    label: "Show",
    title,
    description: "",
    imageUrl: "/voices.svg",
    imageAlt: title,
    imageFit: "cover",
    href: "/explore",
    cta: "Listen",
    meta: "18/06/26",
    show: {
      id,
      title,
      description: "",
      artwork: { alt: title, source: "fallback", src: "/voices.svg" },
      featured: false,
      genres: ["Hip Hop"],
      locationTags: [],
      station: "kx",
    },
  };
}

const items = [buildItem(1), buildItem(2), buildItem(3)];

describe("HomeFeaturePanel mobile transport row", () => {
  it("groups the slide counter and the play/pause control together", () => {
    render(<HomeFeaturePanel items={items} />);

    const [counter] = screen.getAllByText("1/3");
    const pause = screen.getAllByRole("button", {
      name: "Pause featured slideshow",
    })[0];

    // Both live in the same flex row, so the pause control is a sibling of the
    // counter rather than being pinned to the opposite edge of the panel.
    expect(counter.parentElement).toBe(pause.parentElement);
  });

  it("renders the play/pause control without a background chrome disc", () => {
    render(<HomeFeaturePanel items={items} />);

    const pause = screen.getAllByRole("button", {
      name: "Pause featured slideshow",
    })[0];

    expect(pause.className).not.toMatch(/rounded-full/);
    expect(pause.className).not.toMatch(/backdrop-blur/);
    expect(pause.className).not.toMatch(/bg-voicesNext-background/);
  });

  it("toggles the slideshow pause state", async () => {
    const user = userEvent.setup();
    render(<HomeFeaturePanel items={items} />);

    const pause = screen.getAllByRole("button", {
      name: "Pause featured slideshow",
    })[0];
    expect(pause).toHaveAttribute("aria-pressed", "false");

    await user.click(pause);

    expect(
      screen.getAllByRole("button", { name: "Play featured slideshow" })[0],
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("advances the counter when a dot is selected", async () => {
    const user = userEvent.setup();
    render(<HomeFeaturePanel items={items} />);

    await user.click(
      screen.getByRole("button", { name: "Show featured item 3" }),
    );

    expect(screen.getAllByText("3/3").length).toBeGreaterThan(0);
  });
});

function buildBlogItem(): HomeFeatureItem {
  return {
    id: "blog-1",
    type: "blog",
    label: "Blog",
    title: "Inside the new studio",
    description: "",
    imageUrl: "/voices.svg",
    imageAlt: "Inside the new studio",
    imageFit: "cover",
    href: "/blog/inside-the-new-studio",
    cta: "Read",
    meta: "18/06/26",
  };
}

function buildEventItem(): HomeFeatureItem {
  return {
    id: "event-1",
    type: "event",
    label: "Event",
    title: "Voices at the Social",
    description: "",
    imageUrl: "/voices.svg",
    imageAlt: "Voices at the Social",
    imageFit: "cover",
    href: "/events/voices-at-the-social",
    cta: "View",
    meta: "18/06/26",
  };
}

describe("HomeFeaturePanel desktop CTA glyph", () => {
  it("shows a play glyph for a show, which has archive audio to play", () => {
    const { container } = render(<HomeFeaturePanel items={[buildItem(1)]} />);

    expect(container.querySelector("svg.lucide-play")).not.toBeNull();
    expect(container.querySelector("svg.lucide-arrow-right")).toBeNull();
  });

  it("shows an arrow, not a play glyph, for a blog post", () => {
    const { container } = render(
      <HomeFeaturePanel items={[buildBlogItem()]} />,
    );

    expect(container.querySelector("svg.lucide-play")).toBeNull();
    expect(container.querySelector("svg.lucide-arrow-right")).not.toBeNull();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("shows an arrow, not a play glyph, for an event", () => {
    const { container } = render(
      <HomeFeaturePanel items={[buildEventItem()]} />,
    );

    expect(container.querySelector("svg.lucide-play")).toBeNull();
    expect(container.querySelector("svg.lucide-arrow-right")).not.toBeNull();
    expect(screen.getByText("View")).toBeInTheDocument();
  });
});
