import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SiteHeader from "../site-header";
import { SessionProvider } from "../session-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: async () => ({ user: null }) }),
  );
});

async function openMenu(contactLink: string) {
  const user = userEvent.setup();
  render(
    <SessionProvider>
      <SiteHeader settings={{ contactLink }} />
    </SessionProvider>,
  );
  // Both the phone and the tablet layout render a trigger; either opens it.
  await user.click(screen.getAllByRole("button", { name: "Open menu" })[0]);
  return user;
}

describe("MobileMenu contact", () => {
  it("keeps the mailto href on the Contact link", async () => {
    await openMenu("mailto:info@voicesradio.co.uk");

    const contactLinks = screen.getAllByRole("link", { name: "Contact" });
    expect(contactLinks[0]).toHaveAttribute(
      "href",
      "mailto:info@voicesradio.co.uk",
    );
  });

  it("shows the address so a visitor without a mail app can still use it", async () => {
    await openMenu("mailto:info@voicesradio.co.uk?subject=Hi");

    expect(
      screen.getAllByText("info@voicesradio.co.uk").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /copy email address/i }).length,
    ).toBeGreaterThan(0);
  });

  // The tablet+ menu shows Contact bottom left as a bare mailto link. With no
  // mail app registered, a click there did nothing (reported 21 Oct 2026).
  it("shows the address beside Contact in both the phone and the tablet menu", async () => {
    await openMenu("mailto:info@voicesradio.co.uk");

    expect(screen.getAllByRole("link", { name: "Contact" })).toHaveLength(2);
    expect(screen.getAllByText("info@voicesradio.co.uk")).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /copy email address/i }),
    ).toHaveLength(2);
  });

  it("hides the address helper when the contact link is a page", async () => {
    await openMenu("/chat");

    expect(
      screen.queryByRole("button", { name: /copy email address/i }),
    ).toBeNull();
  });
});

describe("MobileMenu layout", () => {
  it("links Archive to the shows page in the phone and tablet menus", async () => {
    await openMenu("/chat");

    const archiveLinks = screen.getAllByRole("link", { name: "Archive" });
    expect(archiveLinks).toHaveLength(2);
    for (const link of archiveLinks) {
      expect(link).toHaveAttribute("href", "/shows");
    }
  });

  it("scrolls the menu panel when the content is taller than the screen", async () => {
    await openMenu("/chat");

    expect(screen.getByRole("dialog")).toHaveClass("overflow-y-auto");
  });

  it("keeps Join Voices on a solid background so the browser toolbar is not tinted orange", async () => {
    await openMenu("/chat");

    const join = screen.getByRole("link", { name: "Join Voices" });
    const footer = join.parentElement?.parentElement;
    expect(footer).toHaveClass("sticky", "bottom-0");
    expect(footer).toHaveClass("bg-voicesNext-background");
  });
});
