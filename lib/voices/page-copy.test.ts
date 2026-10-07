import { describe, expect, it } from "vitest";
import {
  DEFAULT_COLLABORATE_PAGE,
  DEFAULT_COLLABORATE_LINKS,
  DEFAULT_DESKTOP_MENU_LINKS,
  DEFAULT_FOOTER_LINKS,
  DEFAULT_FOOTER_LOCATIONS,
  resolveCollaboratePage,
  resolveListingPages,
  resolveSiteNavigation,
} from "./page-copy";

describe("resolveListingPages", () => {
  it("returns the current site copy when the CMS document does not exist", () => {
    const copy = resolveListingPages(null);

    expect(copy.shows.title).toBe("Listen back");
    expect(copy.blog.eyebrow).toBe("From the station");
    expect(copy.artists.kxTitle).toBe("Voices KX");
    expect(copy.music.title).toBe("Music");
  });

  it("no longer exposes developer wording on the public shows page", () => {
    expect(resolveListingPages(null).shows.description).not.toMatch(/ObjectId/);
  });

  it("overrides only the fields the editor filled in", () => {
    const copy = resolveListingPages({
      shows: { title: "Archive" },
      blog: { description: "  " },
    });

    expect(copy.shows.title).toBe("Archive");
    expect(copy.shows.eyebrow).toBe("Shows");
    expect(copy.blog.description).toBe(
      resolveListingPages(null).blog.description,
    );
  });
});

describe("resolveCollaboratePage", () => {
  it("uses defaults when nothing is published", () => {
    const page = resolveCollaboratePage(null);

    expect(page.heading).toBe(DEFAULT_COLLABORATE_PAGE.heading);
    expect(page.cards).toHaveLength(3);
  });

  it("uses the CMS cards instead of the defaults when editors add any", () => {
    const page = resolveCollaboratePage({
      heading: "Work together",
      cards: [
        { _key: "a", title: "Sponsorship", copy: "Back a show." },
        { _key: "b", title: "", copy: "dropped: no title" },
      ],
    });

    expect(page.heading).toBe("Work together");
    expect(page.cards.map(({ title }) => title)).toEqual(["Sponsorship"]);
  });

  it("falls back to the default cards when the CMS list is empty", () => {
    expect(resolveCollaboratePage({ cards: [] }).cards).toEqual(
      DEFAULT_COLLABORATE_PAGE.cards,
    );
  });
});

describe("resolveSiteNavigation", () => {
  it("uses the built-in navigation when settings has none", () => {
    const nav = resolveSiteNavigation(null);

    expect(nav.desktopMenuLinks).toEqual(DEFAULT_DESKTOP_MENU_LINKS);
    expect(nav.collaborateLinks).toEqual(DEFAULT_COLLABORATE_LINKS);
    expect(nav.footerLinks).toEqual(DEFAULT_FOOTER_LINKS);
    expect(nav.locations).toEqual(DEFAULT_FOOTER_LOCATIONS);
  });

  it("replaces a list wholesale with the CMS list, in editor order", () => {
    const nav = resolveSiteNavigation({
      header_links: [
        { _key: "1", label: "Home", href: "/" },
        {
          _key: "2",
          label: "Shop",
          href: "https://shop.example",
          opensInNewTab: true,
        },
      ],
    });

    expect(nav.desktopMenuLinks).toEqual([
      { href: "/", label: "Home", opensInNewTab: false },
      { href: "https://shop.example", label: "Shop", opensInNewTab: true },
    ]);
    expect(nav.collaborateLinks).toEqual(DEFAULT_COLLABORATE_LINKS);
  });

  it("ignores links missing a label or href", () => {
    const nav = resolveSiteNavigation({
      footer_links: [
        { _key: "1", label: "About", href: "/about" },
        { _key: "2", label: "", href: "/x" },
        { _key: "3", label: "No link", href: " " },
      ],
    });

    expect(nav.footerLinks.map(({ label }) => label)).toEqual(["About"]);
  });

  it("falls back when every CMS link is invalid", () => {
    const nav = resolveSiteNavigation({
      header_links: [{ _key: "1", label: "", href: "" }],
    });

    expect(nav.desktopMenuLinks).toEqual(DEFAULT_DESKTOP_MENU_LINKS);
  });

  it("uses the CMS copyright and locations", () => {
    const nav = resolveSiteNavigation({
      footer_copyright: "© Voices",
      footer_locations: [{ _key: "1", name: "HQ", address: "1 Road" }],
    });

    expect(nav.copyright).toBe("© Voices");
    expect(nav.locations).toEqual([{ name: "HQ", address: "1 Road" }]);
  });

  it("defaults the copyright year to the current year", () => {
    expect(resolveSiteNavigation(null).copyright).toBe(
      `© ${new Date().getFullYear()} Voices Radio`,
    );
  });
});
