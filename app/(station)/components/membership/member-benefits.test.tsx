import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MemberBenefits from "./member-benefits";

describe("MemberBenefits", () => {
  it("lists every current benefit under 'What you get'", () => {
    render(<MemberBenefits />);

    const section = screen.getByRole("region", { name: "What you get" });
    for (const title of [
      "Merch discount",
      "Event discounts",
      "Early release tickets",
      "Exclusive DJ sets from events",
      "Behind the scenes content",
      "Giving back",
    ]) {
      expect(
        within(section).getByRole("heading", { name: title }),
      ).toBeInTheDocument();
    }
  });

  it("states that the benefits don't depend on the amount chosen", () => {
    render(<MemberBenefits />);
    expect(screen.getByText(/whatever amount you choose/i)).toBeInTheDocument();
  });

  it("shows tracklists and the newsletter under 'Coming soon'", () => {
    render(<MemberBenefits />);

    expect(
      screen.getByRole("heading", { name: "Coming soon" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tracklists of shows" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Members newsletter" }),
    ).toBeInTheDocument();
  });

  it("numbers live benefits 01-06 and continues 07-08 for coming soon", () => {
    render(<MemberBenefits />);
    const numbers = screen
      .getAllByTestId("benefit-number")
      .map((node) => node.textContent);
    expect(numbers).toEqual(["01", "02", "03", "04", "05", "06", "07", "08"]);
  });

  it("shows each benefit once, so nothing appears as both live and coming soon", () => {
    render(<MemberBenefits />);
    expect(
      screen.getAllByRole("heading", { name: "Behind the scenes content" }),
    ).toHaveLength(1);
  });
});
