import { describe, expect, it } from "vitest";
import type { LocationPage, Podcast } from "@/sanity.queries";
import { buildLocationJsonLd, buildLocationMetadata } from "./location-page";
import { STUDIO_ADDRESS, STUDIO_EMAIL } from "./podcast-studio-facts";

const BASE = "https://www.voicesradio.co.uk";

function page(overrides: Partial<LocationPage> = {}): LocationPage {
  return {
    title: "Internal",
    slug: { current: "kings-cross" },
    h1: "Podcast Studio in Kings Cross",
    localityName: "Kings Cross, London",
    ...overrides,
  };
}

const podcast = (overrides: Partial<Podcast> = {}) =>
  overrides as unknown as Podcast;

describe("buildLocationMetadata", () => {
  it("falls back to the H1 and a locality description", () => {
    const meta = buildLocationMetadata(page(), "kings-cross");

    expect(meta.title).toBe("Podcast Studio in Kings Cross");
    expect(meta.description).toContain("Kings Cross, London");
    expect(meta.alternates?.canonical).toBe("/podcast-studio/kings-cross");
  });

  it("prefers editor-written SEO fields and joins keywords", () => {
    const meta = buildLocationMetadata(
      page({
        seoTitle: "Hire a podcast studio",
        seoDescription: "Book by the hour.",
        keywords: ["podcast studio", "kings cross"],
      }),
      "kings-cross",
    );

    expect(meta.title).toBe("Hire a podcast studio");
    expect(meta.description).toBe("Book by the hour.");
    expect(meta.keywords).toBe("podcast studio, kings cross");
  });

  it("adds the social image only when one exists", () => {
    expect(
      buildLocationMetadata(page(), "kings-cross").openGraph?.images,
    ).toBeUndefined();

    const meta = buildLocationMetadata(
      page(),
      "kings-cross",
      "https://cdn.example/og.jpg",
    );
    expect(meta.openGraph?.images).toEqual([
      { url: "https://cdn.example/og.jpg", width: 1200, height: 627 },
    ]);
    expect(meta.twitter?.images).toEqual(["https://cdn.example/og.jpg"]);
  });
});

describe("buildLocationJsonLd", () => {
  it("describes the studio as a RecordingStudio using built-in facts", () => {
    const { localBusiness } = buildLocationJsonLd({
      page: page(),
      podcast: null,
      baseUrl: BASE,
      slug: "kings-cross",
    });

    expect(localBusiness["@type"]).toBe("RecordingStudio");
    expect(localBusiness.url).toBe(`${BASE}/podcast-studio/kings-cross`);
    expect(localBusiness.email).toBe(STUDIO_EMAIL);
    expect(localBusiness.areaServed).toBe("Kings Cross, London");
    expect(localBusiness.address).toMatchObject({
      streetAddress: STUDIO_ADDRESS.streetAddress,
      postalCode: STUDIO_ADDRESS.postalCode,
      addressCountry: "GB",
    });
    expect(localBusiness).not.toHaveProperty("telephone");
    expect(localBusiness).not.toHaveProperty("geo");
  });

  it("uses podcast CMS values when filled in", () => {
    const { localBusiness } = buildLocationJsonLd({
      page: page(),
      podcast: podcast({
        phone: "020 0000 0000",
        streetAddress: "1 Test Street",
        geoLat: 51.5,
        geoLng: -0.12,
        openingHours: ["Mo-Fr 09:00-18:00"],
        priceRange: "£50",
      }),
      baseUrl: BASE,
      slug: "kings-cross",
    });

    expect(localBusiness.telephone).toBe("020 0000 0000");
    expect(localBusiness.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 51.5,
      longitude: -0.12,
    });
    expect(localBusiness.openingHours).toEqual(["Mo-Fr 09:00-18:00"]);
    expect(localBusiness.priceRange).toBe("£50");
    expect(localBusiness.address).toMatchObject({
      streetAddress: "1 Test Street",
    });
  });

  it("omits geo unless both coordinates are set", () => {
    const { localBusiness } = buildLocationJsonLd({
      page: page(),
      podcast: podcast({ geoLat: 51.5 }),
      baseUrl: BASE,
      slug: "x",
    });

    expect(localBusiness).not.toHaveProperty("geo");
  });

  it("builds FAQ structured data only when the page has FAQs", () => {
    expect(
      buildLocationJsonLd({
        page: page(),
        podcast: null,
        baseUrl: BASE,
        slug: "x",
      }).faq,
    ).toBeNull();

    const { faq } = buildLocationJsonLd({
      page: page({ faq: [{ question: "How much?", answer: "£65/hour" }] }),
      podcast: null,
      baseUrl: BASE,
      slug: "x",
    });
    expect(faq?.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "How much?",
        acceptedAnswer: { "@type": "Answer", text: "£65/hour" },
      },
    ]);
  });

  it("builds a three-level breadcrumb", () => {
    const { breadcrumb } = buildLocationJsonLd({
      page: page(),
      podcast: null,
      baseUrl: BASE,
      slug: "kings-cross",
    });

    expect(
      (breadcrumb.itemListElement as Array<{ item: string }>).map(
        ({ item }) => item,
      ),
    ).toEqual([BASE, `${BASE}/podcast`, `${BASE}/podcast-studio/kings-cross`]);
  });
});
