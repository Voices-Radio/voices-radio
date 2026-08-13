import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountMenu, { getInitials } from "./account-menu";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => "/explore",
}));

const SIGNED_IN_USER = {
  _id: "user-1",
  email: "jack@example.com",
  firstName: "Jack",
  lastName: "Onslow",
};

function mockSessionFetch(user: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: async () => ({ user }),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getInitials", () => {
  it("combines first and last initials when both are present", () => {
    expect(
      getInitials({ _id: "1", email: null, firstName: "Jack", lastName: "Onslow" }),
    ).toBe("JO");
  });

  it("falls back to just the first name's initial", () => {
    expect(
      getInitials({ _id: "1", email: null, firstName: "Jack" }),
    ).toBe("J");
  });

  it("falls back to the email's first letter when no name is set", () => {
    expect(getInitials({ _id: "1", email: "jack@example.com" })).toBe("J");
  });

  it("returns null when there's nothing to initial", () => {
    expect(getInitials({ _id: "1", email: null })).toBeNull();
  });
});

describe("AccountMenu", () => {
  it("renders Sign in and Join for a signed-out visitor", async () => {
    mockSessionFetch(null);
    render(<AccountMenu />);

    expect(
      await screen.findByRole("link", { name: /sign in/i }),
    ).toHaveAttribute("href", "/sign-in?next=%2Fexplore");
    expect(screen.getByRole("link", { name: /join/i })).toHaveAttribute(
      "href",
      "/join",
    );
  });

  it("renders the avatar with initials and the five account links for a signed-in member", async () => {
    mockSessionFetch(SIGNED_IN_USER);
    const user = userEvent.setup();
    render(<AccountMenu />);

    const trigger = await screen.findByRole("button", {
      name: /account menu for jack/i,
    });
    expect(trigger).toHaveTextContent("JO");

    await user.click(trigger);

    const menu = screen.getByRole("menu", { name: /account/i });
    expect(menu).toHaveTextContent("Hi Jack");
    expect(menu).toHaveTextContent("jack@example.com");
    for (const label of [
      "Dashboard",
      "Membership",
      "Benefits",
      "Redemptions",
      "Profile",
    ]) {
      expect(
        screen.getByRole("menuitem", { name: label }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole("menuitem", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("closes the dropdown on Escape and returns focus to the trigger", async () => {
    mockSessionFetch(SIGNED_IN_USER);
    const user = userEvent.setup();
    render(<AccountMenu />);

    const trigger = await screen.findByRole("button", {
      name: /account menu for jack/i,
    });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes the dropdown on an outside click", async () => {
    mockSessionFetch(SIGNED_IN_USER);
    const user = userEvent.setup();
    render(
      <div>
        <AccountMenu />
        <button type="button">outside</button>
      </div>,
    );

    const trigger = await screen.findByRole("button", {
      name: /account menu for jack/i,
    });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "outside" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("signs out, hits the logout route, and redirects home", async () => {
    mockSessionFetch(SIGNED_IN_USER);
    const user = userEvent.setup();
    render(<AccountMenu />);

    const trigger = await screen.findByRole("button", {
      name: /account menu for jack/i,
    });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

    expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });
});
