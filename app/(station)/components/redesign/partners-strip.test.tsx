import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PartnersStrip from "./partners-strip";
import { partners } from "@/lib/voices/partners";

describe("PartnersStrip", () => {
  it("renders the Our Partners heading", () => {
    const { getByRole } = render(<PartnersStrip />);
    expect(getByRole("heading", { name: "Our Partners" })).toBeInTheDocument();
  });

  it("lists TwoTribes", () => {
    expect(partners.map((p) => p.name)).toEqual(["TwoTribes"]);
  });

  it("renders one external link per partner with a logo", () => {
    const { getByRole, container } = render(<PartnersStrip />);
    for (const partner of partners) {
      const link = getByRole("link", { name: new RegExp(partner.name, "i") });
      expect(link).toHaveAttribute("href", partner.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
    expect(container.querySelectorAll("img")).toHaveLength(partners.length);
  });

  it("renders a blurb for each partner", () => {
    const { container } = render(<PartnersStrip />);
    for (const partner of partners) {
      expect(container.textContent).toContain(partner.blurb);
    }
  });

  it("renders the Two Tribes headline as a heading", () => {
    const { getByRole } = render(<PartnersStrip />);
    expect(
      getByRole("heading", { name: "VOICES bar is powered by Two Tribes" }),
    ).toBeInTheDocument();
  });
});
