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
    const { container } = render(
      <SupporterWall names={["Ada", "Grace", "Katherine", "Hedy"]} />,
    );
    const hiddenWrapper = container.querySelector('[aria-hidden="true"]');
    expect(hiddenWrapper).toBeInTheDocument();
    expect(
      hiddenWrapper?.querySelector('[data-testid="marquee-mock"]'),
    ).toBeTruthy();
  });

  const namesOf = (count: number) =>
    Array.from({ length: count }, (_, i) => `Supporter ${i + 1}`);

  it.each([
    [4, 2],
    [9, 2],
    [10, 3],
    [19, 3],
    [20, 5],
    [60, 5],
  ])("renders %i names across %i marquee rows", (count, rows) => {
    render(<SupporterWall names={namesOf(count)} />);
    expect(screen.getAllByTestId("marquee-mock")).toHaveLength(rows);
  });

  it.each([1, 2, 3])(
    "renders %i name(s) as a still, centred line with no marquee",
    (count) => {
      const { container } = render(<SupporterWall names={namesOf(count)} />);
      expect(
        container.querySelector('[data-testid="marquee-mock"]'),
      ).toBeNull();
      expect(screen.getAllByTestId("supporter-name")).toHaveLength(count);
      expect(container.querySelector(".justify-center")).toBeInTheDocument();
    },
  );

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
