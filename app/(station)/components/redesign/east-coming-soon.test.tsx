import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EastComingSoonStrip } from "./east-coming-soon";

describe("EastComingSoonStrip", () => {
  it("lets the teaser text shrink so the orange icon cell stays inside the strip", () => {
    const { container } = render(<EastComingSoonStrip />);

    const strip = screen.getByLabelText("Voices East coming late summer");
    const contentGrid = container.querySelector(".grid");

    expect(strip).toHaveClass("overflow-hidden");
    expect(contentGrid).toHaveClass("min-w-0");
    expect(contentGrid).toHaveClass("grid-cols-[52px_minmax(0,1fr)_auto]");
  });
});
