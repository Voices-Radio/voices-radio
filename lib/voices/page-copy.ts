import type {
  CollaboratePageCopy,
  ListingPagesCopy,
  NavLinkConfig,
  Settings,
} from "@/sanity.queries";

/**
 * Editorial copy that used to be hard-coded in page components. Every value
 * has a default identical to what the site showed before it was editable, so
 * an empty or missing Studio document never blanks a page.
 */

export interface NavLink {
  href: string;
  label: string;
  opensInNewTab: boolean;
}

export interface FooterLocation {
  name: string;
  address: string;
}

export const DEFAULT_DESKTOP_MENU_LINKS: NavLink[] = [
  { href: "/", label: "Home", opensInNewTab: false },
  { href: "/blog", label: "Blog", opensInNewTab: false },
  { href: "/podcast", label: "Podcast Studio", opensInNewTab: true },
  { href: "/agency", label: "Agency", opensInNewTab: true },
  { href: "/collaborate", label: "Partner with Us", opensInNewTab: false },
  { href: "/about", label: "About Us", opensInNewTab: false },
  { href: "/support", label: "Why support us", opensInNewTab: false },
];

export const DEFAULT_COLLABORATE_LINKS: NavLink[] = [
  { href: "/podcast", label: "Podcast Studio", opensInNewTab: true },
  { href: "/agency", label: "Agency", opensInNewTab: true },
  { href: "/collaborate", label: "Partner with Us", opensInNewTab: false },
];

export const DEFAULT_FOOTER_LINKS: NavLink[] = [
  { href: "/about", label: "About", opensInNewTab: false },
  { href: "/services", label: "Work with us", opensInNewTab: false },
  { href: "/support", label: "Support Us", opensInNewTab: false },
];

export const DEFAULT_FOOTER_LOCATIONS: FooterLocation[] = [
  {
    name: "Voices Radio",
    address: "Unit 113 Lower Stable Street Coal Drops Yard, London N1C 4LW",
  },
  {
    name: "Voices Podcast Studio",
    address: "Upstairs at Mare Street, Lewis Cubitt Square, London N1C 4DY",
  },
  { name: "Voices East", address: "TBC" },
];

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function pick(value: string | undefined | null, fallback: string) {
  return clean(value) ?? fallback;
}

function resolveLinks(
  configured: NavLinkConfig[] | undefined,
  fallback: NavLink[],
): NavLink[] {
  const links = (configured ?? []).flatMap((link) => {
    const label = clean(link.label);
    const href = clean(link.href);
    return label && href
      ? [{ label, href, opensInNewTab: Boolean(link.opensInNewTab) }]
      : [];
  });

  return links.length ? links : fallback;
}

export interface SiteNavigation {
  desktopMenuLinks: NavLink[];
  collaborateLinks: NavLink[];
  footerLinks: NavLink[];
  locations: FooterLocation[];
  copyright: string;
}

export function resolveSiteNavigation(
  settings: Partial<Settings> | null | undefined,
): SiteNavigation {
  const locations = (settings?.footer_locations ?? []).flatMap((location) => {
    const name = clean(location.name);
    const address = clean(location.address);
    return name && address ? [{ name, address }] : [];
  });

  return {
    desktopMenuLinks: resolveLinks(
      settings?.header_links,
      DEFAULT_DESKTOP_MENU_LINKS,
    ),
    collaborateLinks: resolveLinks(
      settings?.collaborate_links,
      DEFAULT_COLLABORATE_LINKS,
    ),
    footerLinks: resolveLinks(settings?.footer_links, DEFAULT_FOOTER_LINKS),
    locations: locations.length ? locations : DEFAULT_FOOTER_LOCATIONS,
    copyright: pick(
      settings?.footer_copyright,
      `© ${new Date().getFullYear()} Voices Radio`,
    ),
  };
}

export interface ListingPagesContent {
  shows: { eyebrow: string; title: string; description: string };
  artists: {
    title: string;
    description: string;
    kxTitle: string;
    kxDescription: string;
    eastTitle: string;
    eastDescription: string;
  };
  music: { title: string };
  blog: { eyebrow: string; title: string; description: string };
}

export function resolveListingPages(
  cms: ListingPagesCopy | null | undefined,
): ListingPagesContent {
  return {
    shows: {
      eyebrow: pick(cms?.shows?.eyebrow, "Shows"),
      title: pick(cms?.shows?.title, "Listen back"),
      description: pick(
        cms?.shows?.description,
        "Catch up on shows from the Voices archive.",
      ),
    },
    artists: {
      title: pick(cms?.artists?.title, "Artists"),
      description: pick(
        cms?.artists?.description,
        "Browse all Voices artists, presenters and hosts.",
      ),
      kxTitle: pick(cms?.artists?.kxTitle, "Voices KX"),
      kxDescription: pick(
        cms?.artists?.kxDescription,
        "Browse the hosts at our Kings Cross studio.",
      ),
      eastTitle: pick(cms?.artists?.eastTitle, "Voices EAST"),
      eastDescription: pick(
        cms?.artists?.eastDescription,
        "Browse the hosts at our Hackney Wick studio.",
      ),
    },
    music: { title: pick(cms?.music?.title, "Music") },
    blog: {
      eyebrow: pick(cms?.blog?.eyebrow, "From the station"),
      title: pick(cms?.blog?.title, "Blog"),
      description: pick(
        cms?.blog?.description,
        "Stories, news and updates from the Voices community — what's happening in the studio, on air and around London.",
      ),
    },
  };
}

export interface CollaborateCard {
  title: string;
  copy: string;
  href?: string;
  linkLabel?: string;
}

export interface CollaboratePageContent {
  eyebrow: string;
  heading: string;
  intro: string;
  applyCtaText: string;
  contactCtaText: string;
  cards: CollaborateCard[];
  seoTitle: string;
  seoDescription: string;
}

const COLLABORATE_DESCRIPTION =
  "Partner with Voices Radio on programming, community projects, brand work, and show ideas.";

export const DEFAULT_COLLABORATE_PAGE: CollaboratePageContent = {
  eyebrow: "Partner with Us",
  heading: "Build with Voices",
  intro:
    "For partnerships, programming, community projects, and creative ideas, use this page to reach the right part of the Voices team.",
  applyCtaText: "Apply for a show",
  contactCtaText: "Start a partnership conversation",
  cards: [
    {
      title: "Programming",
      copy: "Apply to host a show or share a programme idea with the station team.",
    },
    {
      title: "Partnerships",
      copy: "Start a conversation about community projects, brand work, venue programming, or station collaborations.",
    },
    {
      title: "Studio",
      copy: "For podcast production and studio bookings, head to the Podcast Studio page.",
      href: "/podcast",
      linkLabel: "Podcast Studio",
    },
  ],
  seoTitle: "Partner with Us",
  seoDescription: COLLABORATE_DESCRIPTION,
};

export function resolveCollaboratePage(
  cms: CollaboratePageCopy | null | undefined,
): CollaboratePageContent {
  const cards = (cms?.cards ?? []).flatMap((card): CollaborateCard[] => {
    const title = clean(card.title);
    const copy = clean(card.copy);
    if (!title || !copy) return [];

    return [
      {
        title,
        copy,
        href: clean(card.href),
        linkLabel: clean(card.linkLabel),
      },
    ];
  });
  const defaults = DEFAULT_COLLABORATE_PAGE;

  return {
    eyebrow: pick(cms?.eyebrow, defaults.eyebrow),
    heading: pick(cms?.heading, defaults.heading),
    intro: pick(cms?.intro, defaults.intro),
    applyCtaText: pick(cms?.applyCtaText, defaults.applyCtaText),
    contactCtaText: pick(cms?.contactCtaText, defaults.contactCtaText),
    cards: cards.length ? cards : defaults.cards,
    seoTitle: pick(cms?.seoTitle, defaults.seoTitle),
    seoDescription: pick(cms?.seoDescription, defaults.seoDescription),
  };
}
