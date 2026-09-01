import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SupporterWall from "./supporter-wall";

// The marquee itself is a third-party implementation detail (measures DOM
// width via ResizeObserver, duplicates children for autoFill) — none of
// that belongs in these tests, so it's replaced with a passthrough that
// just renders its children.
vi.mock("react-fast-marquee", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marquee-mock">{children}</div>
  ),
}));

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  fireIntersecting() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  mockMatchMedia(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SupporterWall", () => {
  it("renders nothing when there are no supporter names", () => {
    const { container } = render(<SupporterWall names={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the full name list for screen readers, unduplicated", () => {
    render(<SupporterWall names={["Ada", "Grace", "Katherine"]} />);
    const srText = screen.getByText("Supported by Ada, Grace, Katherine", {
      selector: "p.sr-only",
    });
    expect(srText).toBeInTheDocument();
  });

  it("marks the decorative marquee as aria-hidden so names aren't announced twice", () => {
    const { container } = render(<SupporterWall names={["Ada", "Grace"]} />);
    const hiddenWrapper = container.querySelector('[aria-hidden="true"]');
    expect(hiddenWrapper).toBeInTheDocument();
    expect(
      hiddenWrapper?.querySelector('[data-testid="marquee-mock"]'),
    ).toBeTruthy();
  });

  it("renders five marquee rows so the strip reads as a wall, not a line", () => {
    render(<SupporterWall names={["Ada", "Grace", "Katherine"]} />);
    expect(screen.getAllByTestId("marquee-mock")).toHaveLength(5);
  });

  it("gives every row the full name list, so one supporter still fills all five rows", () => {
    render(<SupporterWall names={["Ada"]} />);
    const rows = screen.getAllByTestId("marquee-mock");
    for (const row of rows) {
      expect(
        row.querySelectorAll('[data-testid="supporter-name"]'),
      ).toHaveLength(1);
      expect(row.textContent).toContain("Ada");
    }
  });

  it("renders a static (non-marquee) list under prefers-reduced-motion", () => {
    mockMatchMedia(true);
    const { container } = render(<SupporterWall names={["Ada", "Grace"]} />);
    expect(container.querySelector('[data-testid="marquee-mock"]')).toBeNull();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });

  it("stays a permutation of the same names (no loss or duplication) after the strip enters the viewport", () => {
    mockMatchMedia(true); // static list path — order is directly readable from the DOM
    const names = ["Ada", "Grace", "Katherine", "Margaret", "Hedy"];
    const { container } = render(<SupporterWall names={names} />);

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    FakeIntersectionObserver.instances[0].fireIntersecting();

    const rendered = Array.from(
      container.querySelectorAll('[data-testid="supporter-name"]'),
    ).map((el) => el.textContent?.replace("·", "").trim());

    expect(rendered).toHaveLength(names.length);
    expect([...rendered].sort()).toEqual([...names].sort());
  });
});
