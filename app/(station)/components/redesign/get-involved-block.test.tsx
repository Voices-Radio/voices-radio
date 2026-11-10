import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GetInvolvedBlock from "./get-involved-block";

vi.mock("./supporter-wall", () => ({
  default: ({ names }: { names: string[] }) => (
    <div data-testid="supporter-wall">{names.join(",")}</div>
  ),
}));

const applyBanner = {
  heading: "Apply for a show!",
  mobileBody: "Apply to join our community of presenters.",
  ctaText: "Apply for a show",
};

const renderBlock = (props = {}) =>
  render(
    <GetInvolvedBlock
      applyBanner={applyBanner}
      applyUrl="https://example.com/apply"
      {...props}
    />,
  );

describe("GetInvolvedBlock", () => {
  it("renders both the supporter and apply halves in one section", () => {
    const { container, getByRole } = renderBlock();
    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(
      getByRole("heading", { name: "Become a Supporter" }),
    ).toBeInTheDocument();
    expect(
      getByRole("heading", { name: "Apply for a show!" }),
    ).toBeInTheDocument();
  });

  it("links the supporter CTA to /join by default", () => {
    const { getByRole } = renderBlock();
    expect(getByRole("link", { name: "Become a Supporter" })).toHaveAttribute(
      "href",
      "/join",
    );
  });

  it("links the apply CTA to the apply url in a new tab", () => {
    const { getByRole } = renderBlock();
    const link = getByRole("link", { name: "Apply for a show" });
    expect(link).toHaveAttribute("href", "https://example.com/apply");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("renders the apply body copy", () => {
    const { container } = renderBlock();
    expect(container.textContent).toContain(applyBanner.mobileBody);
  });

  it("always renders the supporter pitch copy", () => {
    const { container } = renderBlock();
    expect(container.textContent).toContain(
      "completely independent radio supporting local and international creatives",
    );
  });

  it("falls back to the support-impact list when there is no wall", () => {
    const { getByText, queryByTestId } = renderBlock({ supporterNames: [] });
    expect(queryByTestId("supporter-wall")).toBeNull();
    expect(getByText(/what your support keeps on air/i)).toBeInTheDocument();
  });

  it("shows the wall instead of the impact list once there are names", () => {
    const { getByTestId, queryByText } = renderBlock({
      supporterNames: ["Ada", "Grace"],
    });
    expect(getByTestId("supporter-wall")).toHaveTextContent("Ada,Grace");
    expect(queryByText(/what your support keeps on air/i)).toBeNull();
  });

  it("always renders the decorative signal meter", () => {
    const { getByTestId } = renderBlock();
    expect(getByTestId("support-signal-meter")).toBeInTheDocument();
  });
});
