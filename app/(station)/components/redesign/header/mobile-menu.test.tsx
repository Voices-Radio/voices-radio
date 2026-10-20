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

    expect(screen.getByText("info@voicesradio.co.uk")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy email address/i }),
    ).toBeInTheDocument();
  });

  it("hides the address helper when the contact link is a page", async () => {
    await openMenu("/chat");

    expect(
      screen.queryByRole("button", { name: /copy email address/i }),
    ).toBeNull();
  });
});
