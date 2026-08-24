import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SiteHeader from "./site-header";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: async () => ({ user: null }),
    }),
  );
});

describe("SiteHeader", () => {
  it("orders the desktop nav with Shop before Collaborate and keeps actions tight", () => {
    const { container } = render(<SiteHeader settings={{}} />);

    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    const searchButton = screen.getByRole("button", { name: "Open search" });
    const actions = searchButton.parentElement?.parentElement?.parentElement;

    expect(primaryNav).toHaveClass("gap-6");
    expect(primaryNav).toHaveClass("lg:gap-7");
    expect(primaryNav).toHaveClass("xl:gap-8");
    expect(actions).toHaveClass("md:ml-3");
    expect(actions).toHaveClass("lg:ml-4");

    const navText = primaryNav.textContent ?? "";
    expect(navText.indexOf("Shop")).toBeGreaterThan(navText.indexOf("Explore"));
    expect(navText.indexOf("Shop")).toBeLessThan(
      navText.indexOf("Collaborate"),
    );
    expect(container).toHaveTextContent("Shop");
  });

  it("opens Podcast Studio and Agency menu entries in new tabs", async () => {
    const user = userEvent.setup();
    render(<SiteHeader settings={{}} />);

    await user.click(screen.getByRole("button", { name: /collaborate/i }));

    for (const label of ["Podcast Studio", "Agency"]) {
      const link = screen.getByRole("menuitem", {
        name: new RegExp(label, "i"),
      });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
