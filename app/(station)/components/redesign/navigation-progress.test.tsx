import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NavigationProgress, {
  FINISH_MS,
  GIVE_UP_MS,
  SHOW_DELAY_MS,
} from "./navigation-progress";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithLink(href: string, attributes: Record<string, string> = {}) {
  const view = render(
    <>
      <a href={href} {...attributes}>
        go
      </a>
      <NavigationProgress />
    </>,
  );
  // jsdom would try to navigate; the bar only cares that the click happened.
  screen
    .getByText("go")
    .addEventListener("click", (event) => event.preventDefault());
  return view;
}

function click(init: MouseEventInit = {}) {
  screen
    .getByText("go")
    .dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, ...init }),
    );
}

function bar() {
  return screen.queryByTestId("navigation-progress");
}

describe("NavigationProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigation.pathname = "/";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the bar after a short delay when an internal link is clicked", () => {
    renderWithLink("/explore");

    act(() => click());
    expect(bar()).toBeNull();

    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));
    expect(bar()).toHaveAttribute("data-phase", "loading");
  });

  it("never shows the bar when the route changes before the delay", () => {
    const { rerender } = renderWithLink("/explore");

    act(() => click());
    navigation.pathname = "/explore";
    rerender(
      <>
        <a href="/explore">go</a>
        <NavigationProgress />
      </>,
    );
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS * 2));

    expect(bar()).toBeNull();
  });

  it("finishes and then hides when the route changes", () => {
    const { rerender } = renderWithLink("/explore");

    act(() => click());
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));
    navigation.pathname = "/explore";
    rerender(
      <>
        <a href="/explore">go</a>
        <NavigationProgress />
      </>,
    );

    expect(bar()).toHaveAttribute("data-phase", "finishing");
    act(() => vi.advanceTimersByTime(FINISH_MS));
    expect(bar()).toBeNull();
  });

  it("gives up if the click never becomes a navigation", () => {
    renderWithLink("/explore");

    act(() => click());
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));
    expect(bar()).not.toBeNull();

    act(() => vi.advanceTimersByTime(GIVE_UP_MS));
    expect(bar()).toBeNull();
  });

  it.each([
    ["an external link", "https://example.com/", {}, {}],
    ["a new-tab link", "/explore", { target: "_blank" }, {}],
    ["a download link", "/file.pdf", { download: "" }, {}],
    ["a hash link on this page", "/#main-content", {}, {}],
    ["a cmd-click", "/explore", {}, { metaKey: true }],
  ])("ignores %s", (_label, href, attributes, init) => {
    renderWithLink(href, attributes);

    act(() => click(init));
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));

    expect(bar()).toBeNull();
  });
});
