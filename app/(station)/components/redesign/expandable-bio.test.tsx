import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ExpandableBio from "./expandable-bio";

const BIO = "Line one\nLine two\nLine three\nLine four\nLine five\nLine six";

function mockHeights(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => scrollHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => clientHeight,
  });
}

afterEach(() => {
  // Remove the overrides so jsdom's own getters apply again.
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  delete proto.scrollHeight;
  delete proto.clientHeight;
});

describe("ExpandableBio", () => {
  it("expands and collapses a bio that the clamp cuts off", () => {
    mockHeights(240, 120);
    const { container } = render(<ExpandableBio bio={BIO} />);
    const text = container.querySelector("p")!;

    const button = screen.getByRole("button", { name: "(Read more)" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(text).toHaveClass("line-clamp-5");

    fireEvent.click(button);
    expect(text).not.toHaveClass("line-clamp-5");
    expect(screen.getByRole("button", { name: "(Read less)" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "(Read less)" }));
    expect(text).toHaveClass("line-clamp-5");
  });

  it("shows no toggle when the whole bio fits", () => {
    mockHeights(80, 80);
    render(<ExpandableBio bio="Short bio" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Short bio")).toBeInTheDocument();
  });
});
