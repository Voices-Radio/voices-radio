import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FreeAccountHome from "./free-account-home";

describe("FreeAccountHome", () => {
  it("greets by name and links to favourites, contact preferences and joining", () => {
    render(<FreeAccountHome firstName="Jo" />);

    expect(screen.getByRole("heading", { name: "Hi Jo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View favourites" })).toHaveAttribute(
      "href",
      "/account/favourites",
    );
    expect(screen.getByRole("link", { name: "Contact preferences" })).toHaveAttribute(
      "href",
      "/account/profile",
    );
    expect(screen.getByRole("link", { name: "Join as a member" })).toHaveAttribute("href", "/join");
  });

  it("does not read as an empty or broken account", () => {
    render(<FreeAccountHome />);
    expect(screen.getByRole("heading", { name: "Your account" })).toBeInTheDocument();
    expect(screen.queryByText(/nothing active yet/i)).toBeNull();
  });
});
