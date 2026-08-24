import { render, screen } from "@testing-library/react";
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
  it("keeps the desktop nav and search cluster tightly spaced", () => {
    const { container } = render(<SiteHeader settings={{}} />);

    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    const searchButton = screen.getByRole("button", { name: "Open search" });
    const actions = searchButton.parentElement?.parentElement?.parentElement;

    expect(primaryNav).toHaveClass("gap-5");
    expect(primaryNav).toHaveClass("lg:gap-6");
    expect(primaryNav).toHaveClass("xl:gap-7");
    expect(actions).toHaveClass("md:ml-3");
    expect(actions).toHaveClass("lg:ml-4");
    expect(container).toHaveTextContent("Shop");
  });
});
