import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const image = { lqip: "data:image/png;base64,", asset: { _ref: "image-1" } };

vi.mock("@/sanity.client", () => ({
  getServices: async () => ({
    hero_image: image,
    services_heading: "Our services",
    services_heading1: "Podcasts",
    services_heading2: "Events",
    services_heading3: "Agency",
    services_heading4: "Studio",
    services_main1: [],
    services_main2: [],
    services_main3: [],
    services_main4: [],
    services_main1_image: image,
    services_main2_image: image,
    services_main3_image: image,
    services_main4_image: image,
    services_final_image: image,
  }),
}));

vi.mock("@/sanity.image", () => ({
  urlForImage: () => ({ url: () => "https://cdn.sanity.io/image.jpg" }),
}));

describe("ServicesPage", () => {
  it("shows the CMS heading as the page's only h1", async () => {
    const { default: ServicesPage } = await import("./page");
    render(await ServicesPage());

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Our services");
  });
});
