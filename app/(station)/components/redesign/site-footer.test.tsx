import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SiteFooter from "./site-footer";

describe("SiteFooter contact", () => {
  it("keeps the mailto href on the Contact link", () => {
    render(<SiteFooter contactUrl="mailto:info@voicesradio.co.uk" />);

    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "mailto:info@voicesradio.co.uk",
    );
  });

  it("shows the address so a visitor without a mail app can still use it", () => {
    render(<SiteFooter contactUrl="mailto:info@voicesradio.co.uk?subject=Hi" />);

    expect(screen.getByText("info@voicesradio.co.uk")).toBeInTheDocument();
  });

  it("copies the address to the clipboard", async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs the clipboard stub, so spy on it afterwards.
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(<SiteFooter contactUrl="mailto:info@voicesradio.co.uk" />);
    await user.click(
      screen.getByRole("button", { name: /copy email address/i }),
    );

    expect(writeText).toHaveBeenCalledWith("info@voicesradio.co.uk");
  });

  it("hides the address helper when the contact link is a page", () => {
    render(<SiteFooter contactUrl="/chat" />);

    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/chat",
    );
    expect(
      screen.queryByRole("button", { name: /copy email address/i }),
    ).toBeNull();
  });
});
