import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ContactCta from "./contact-cta";

describe("ContactCta", () => {
  it("keeps the mailto href on the button", () => {
    render(
      <ContactCta
        href="mailto:info@voicesradio.co.uk"
        label="Start a partnership conversation"
      />,
    );

    expect(
      screen.getByRole("link", { name: "Start a partnership conversation" }),
    ).toHaveAttribute("href", "mailto:info@voicesradio.co.uk");
  });

  it("shows the address so a visitor without a mail app can still use it", () => {
    render(
      <ContactCta
        href="mailto:info@voicesradio.co.uk?subject=Hello"
        label="Contact"
      />,
    );

    expect(screen.getByText("info@voicesradio.co.uk")).toBeInTheDocument();
  });

  it("copies the address to the clipboard", async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs the clipboard stub, so spy on it afterwards.
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(<ContactCta href="mailto:info@voicesradio.co.uk" label="Contact" />);
    await user.click(
      screen.getByRole("button", { name: /copy email address/i }),
    );

    expect(writeText).toHaveBeenCalledWith("info@voicesradio.co.uk");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("hides the address helper when the link is not a mailto", () => {
    render(<ContactCta href="/chat" label="Contact" />);

    expect(
      screen.queryByRole("button", { name: /copy email address/i }),
    ).toBeNull();
  });
});
