import { describe, expect, it } from "vitest";
import { getArtistLinks, type ArtistLinkSource } from "./artist-links";

function artist(overrides: Partial<ArtistLinkSource> = {}): ArtistLinkSource {
  return { socialLinks: {}, ...overrides };
}

function hrefFor(source: ArtistLinkSource, label: string) {
  return getArtistLinks(source).find((link) => link.label === label)?.href;
}

describe("getArtistLinks", () => {
  it("returns no links when the artist has none", () => {
    expect(getArtistLinks(artist())).toEqual([]);
  });

  describe("Instagram", () => {
    it("turns a bare handle into an Instagram profile URL", () => {
      expect(
        hrefFor(artist({ socialLinks: { instagram: "arniewrong" } }), "Instagram"),
      ).toBe("https://www.instagram.com/arniewrong/");
    });

    it("accepts an @handle and a handle with dots", () => {
      expect(
        hrefFor(artist({ socialLinks: { instagram: "@rep_strain" } }), "Instagram"),
      ).toBe("https://www.instagram.com/rep_strain/");
      expect(
        hrefFor(artist({ socialLinks: { instagram: "d.a.n.d.dj" } }), "Instagram"),
      ).toBe("https://www.instagram.com/d.a.n.d.dj/");
    });

    it("keeps a full Instagram URL", () => {
      expect(
        hrefFor(
          artist({ socialLinks: { instagram: "https://instagram.com/foo" } }),
          "Instagram",
        ),
      ).toBe("https://instagram.com/foo");
    });

    it("adds the protocol to an Instagram URL that has none", () => {
      expect(
        hrefFor(
          artist({ socialLinks: { instagram: "instagram.com/foo" } }),
          "Instagram",
        ),
      ).toBe("https://instagram.com/foo");
    });

    it("hides the button when the value is not a usable handle", () => {
      expect(
        hrefFor(artist({ socialLinks: { instagram: "my insta" } }), "Instagram"),
      ).toBeUndefined();
      expect(
        hrefFor(artist({ socialLinks: { instagram: "  " } }), "Instagram"),
      ).toBeUndefined();
    });
  });

  describe("Website", () => {
    it("links a valid website", () => {
      expect(
        hrefFor(
          artist({ socialLinks: { website: "https://itsbettertotravelbook.com" } }),
          "Website",
        ),
      ).toBe("https://itsbettertotravelbook.com/");
    });

    it("drops trailing notes after the URL", () => {
      expect(
        hrefFor(
          artist({
            socialLinks: { website: "https://repetitivestrain.club (website)" },
          }),
          "Website",
        ),
      ).toBe("https://repetitivestrain.club/");
    });

    it("hides a website that is not a real address", () => {
      expect(
        hrefFor(artist({ socialLinks: { website: "https://Gaffe" } }), "Website"),
      ).toBeUndefined();
      expect(
        hrefFor(artist({ socialLinks: { website: "javascript:alert(1)" } }), "Website"),
      ).toBeUndefined();
    });

    it("shows an Instagram URL in the website field as Instagram, not Website", () => {
      const links = getArtistLinks(
        artist({
          socialLinks: {
            instagram: "arniewrong",
            website: "https://www.instagram.com/arniewrong/",
          },
        }),
      );

      expect(links).toEqual([
        { label: "Instagram", href: "https://www.instagram.com/arniewrong/" },
      ]);
    });

    it("uses an Instagram website value when there is no handle", () => {
      const links = getArtistLinks(
        artist({ socialLinks: { website: "https://www.instagram.com/foo/" } }),
      );

      expect(links).toEqual([
        { label: "Instagram", href: "https://www.instagram.com/foo/" },
      ]);
    });
  });

  describe("Mixcloud and SoundCloud", () => {
    it("builds profile URLs from usernames", () => {
      const links = getArtistLinks(
        artist({ mixcloudUsername: "@arniewrong", soundcloudUsername: "arniewrong" }),
      );

      expect(links).toEqual([
        { label: "Mixcloud", href: "https://www.mixcloud.com/arniewrong/" },
        { label: "SoundCloud", href: "https://soundcloud.com/arniewrong" },
      ]);
    });

    it("keeps a full SoundCloud URL", () => {
      expect(
        hrefFor(
          artist({ soundcloudUsername: "https://soundcloud.com/foo" }),
          "SoundCloud",
        ),
      ).toBe("https://soundcloud.com/foo");
    });

    it("hides a username that has spaces", () => {
      expect(
        hrefFor(artist({ mixcloudUsername: "not a user" }), "Mixcloud"),
      ).toBeUndefined();
    });
  });

  it("orders the links Mixcloud, SoundCloud, Instagram, Website", () => {
    const labels = getArtistLinks(
      artist({
        mixcloudUsername: "a",
        soundcloudUsername: "b",
        socialLinks: { instagram: "c", website: "https://d.com" },
      }),
    ).map((link) => link.label);

    expect(labels).toEqual(["Mixcloud", "SoundCloud", "Instagram", "Website"]);
  });
});
