import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CadenceToggle from "./cadence-toggle";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/join",
}));

describe("CadenceToggle", () => {
  it("marks the active cadence with aria-pressed", () => {
    render(<CadenceToggle cadence="monthly" />);

    expect(screen.getByRole("button", { name: /monthly/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: /annual/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("navigates to the other cadence in the URL when clicked", async () => {
    const user = userEvent.setup();
    render(<CadenceToggle cadence="monthly" />);

    await user.click(screen.getByRole("button", { name: /annual/i }));

    expect(replace).toHaveBeenCalledWith("/join?cadence=annual", {
      scroll: false,
    });
  });

  it("does not navigate when clicking the already-active cadence", async () => {
    const user = userEvent.setup();
    render(<CadenceToggle cadence="monthly" />);

    await user.click(screen.getByRole("button", { name: /monthly/i }));

    expect(replace).not.toHaveBeenCalled();
  });
});
