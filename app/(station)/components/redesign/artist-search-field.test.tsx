import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/artists",
  useSearchParams: () => currentParams,
}));

import ArtistSearchField from "./artist-search-field";

describe("ArtistSearchField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockReset();
    currentParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a labelled search landmark seeded from the q param", () => {
    currentParams = new URLSearchParams("q=arnie");
    render(<ArtistSearchField />);

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByLabelText("Search artists")).toHaveValue("arnie");
  });

  it("debounces typing, then replaces the URL with q", () => {
    render(<ArtistSearchField />);
    fireEvent.change(screen.getByLabelText("Search artists"), {
      target: { value: "arn" },
    });

    expect(replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/artists?q=arn", { scroll: false });
  });

  it("keeps genre and tab params and drops expand", () => {
    currentParams = new URLSearchParams(
      "genre=a&genre=b&expand=all&tab=artists",
    );
    render(<ArtistSearchField />);
    fireEvent.change(screen.getByLabelText("Search artists"), {
      target: { value: "xy" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replace).toHaveBeenCalledWith(
      "/artists?genre=a&genre=b&tab=artists&q=xy",
      { scroll: false },
    );
  });

  it("removes q when the field is cleared", () => {
    currentParams = new URLSearchParams("q=arnie&genre=a");
    render(<ArtistSearchField />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(replace).toHaveBeenCalledWith("/artists?genre=a", {
      scroll: false,
    });
  });

  it("submits immediately on Enter without a page reload", () => {
    render(<ArtistSearchField />);
    const input = screen.getByLabelText("Search artists");
    fireEvent.change(input, { target: { value: "ar" } });
    fireEvent.submit(screen.getByRole("search"));

    expect(replace).toHaveBeenCalledWith("/artists?q=ar", { scroll: false });
  });

  it("does not search for a single character", () => {
    render(<ArtistSearchField />);
    fireEvent.change(screen.getByLabelText("Search artists"), {
      target: { value: "a" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replace).not.toHaveBeenCalled();
  });
});
