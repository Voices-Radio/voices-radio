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
