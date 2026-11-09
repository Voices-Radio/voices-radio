import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GenreFilterChips from "./genre-filter-chips";

describe("GenreFilterChips", () => {
  it("renders nothing when no genres are selected", () => {
    const { container } = render(
      <GenreFilterChips genres={[]} basePath="/explore" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one removable chip per genre, each dropping only itself", () => {
    render(
      <GenreFilterChips
        genres={["a", "b"]}
        basePath="/explore"
        extraParams={{ category: "music" }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Remove a filter" }),
    ).toHaveAttribute("href", "/explore?category=music&genre=b");
    expect(
      screen.getByRole("link", { name: "Remove b filter" }),
    ).toHaveAttribute("href", "/explore?category=music&genre=a");
  });

  it("clears every genre via Clear all while keeping extra params", () => {
    render(
      <GenreFilterChips
        genres={["a"]}
        basePath="/explore"
        extraParams={{ category: "music" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Clear all" })).toHaveAttribute(
      "href",
      "/explore?category=music",
    );
  });

  it("exposes the filter row as a labelled region", () => {
    render(<GenreFilterChips genres={["a"]} basePath="/artists" />);
    expect(
      screen.getByRole("region", { name: "Active genre filters" }),
    ).toBeInTheDocument();
  });
});
