import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SupporterBlock from "./supporter-block";

vi.mock("./supporter-wall", () => ({
  default: ({ names }: { names: string[] }) => (
    <div data-testid="supporter-wall">{names.join(",")}</div>
  ),
}));

describe("SupporterBlock", () => {
  it("renders the CTA strip unchanged when there are no supporter names", () => {
    const { container, queryByTestId } = render(<SupporterBlock />);
    expect(container.textContent).toContain("Become a Supporter");
    expect(queryByTestId("supporter-wall")).toBeNull();
  });

  it("renders the CTA strip unchanged when supporterNames is explicitly empty", () => {
    const { queryByTestId } = render(<SupporterBlock supporterNames={[]} />);
    expect(queryByTestId("supporter-wall")).toBeNull();
  });

  it("always renders the supporter pitch copy, at every breakpoint", () => {
    const { container } = render(<SupporterBlock />);
    expect(container.textContent).toContain(
      "completely independent radio supporting local and international creatives",
    );
  });

  it("falls back to the support-impact list when there is no wall to show", () => {
    const { getByText, queryByTestId } = render(
      <SupporterBlock supporterNames={[]} />,
    );
    expect(queryByTestId("supporter-wall")).toBeNull();
    expect(getByText(/what your support keeps on air/i)).toBeInTheDocument();
  });

  it("shows the wall instead of the impact list once there are names", () => {
    const { getByTestId, queryByText } = render(
      <SupporterBlock supporterNames={["Ada"]} />,
    );
    expect(getByTestId("supporter-wall")).toBeInTheDocument();
    expect(queryByText(/what your support keeps on air/i)).toBeNull();
  });

  it("always renders the decorative signal meter", () => {
    const { getByTestId } = render(<SupporterBlock />);
    expect(getByTestId("support-signal-meter")).toBeInTheDocument();
  });

  it("renders the supporter wall row when there are opted-in names", () => {
    const { getByTestId } = render(
      <SupporterBlock supporterNames={["Ada", "Grace"]} />,
    );
    expect(getByTestId("supporter-wall")).toHaveTextContent("Ada,Grace");
  });

  it("still links the CTA to /join by default", () => {
    const { getByRole } = render(<SupporterBlock supporterNames={["Ada"]} />);
    expect(getByRole("link", { name: "Become a Supporter" })).toHaveAttribute(
      "href",
      "/join",
    );
  });
});
