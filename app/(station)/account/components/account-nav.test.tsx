import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AccountNav from "./account-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/account",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("AccountNav", () => {
  it("renders member links for a member-only account", () => {
    render(<AccountNav capabilities={["member"]} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(screen.getByRole("link", { name: "Membership" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Artist" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /dj mode/i })).not.toBeInTheDocument();
  });

  it("renders artist links for an artist-only account", () => {
    render(<AccountNav capabilities={["artist"]} />);

    expect(screen.getByRole("link", { name: "Artist" })).toHaveAttribute(
      "href",
      "/account/artist",
    );
    expect(screen.queryByRole("link", { name: "Membership" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /dj mode/i })).not.toBeInTheDocument();
  });

  it("renders both identities and the DJ Mode toggle for a dual-capability account", () => {
    render(<AccountNav capabilities={["artist", "member"]} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Artist" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dj mode/i })).toHaveAttribute(
      "href",
      "/account/artist",
    );
  });

  it("renders a coherent account link for a neither-capability account", () => {
    render(<AccountNav capabilities={[]} />);

    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(screen.queryByRole("link", { name: /dj mode/i })).not.toBeInTheDocument();
  });
});
