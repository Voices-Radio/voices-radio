import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OverflowMarquee from "./overflow-marquee";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("@/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => reducedMotion.value,
}));

// jsdom does no layout, so widths come from this table, keyed by the
// `data-marquee` part. The second copy sits one loop (text + gap) to the right.
const layout = { viewport: 200, text: 120, gap: 40 };

function rectFor(element: Element): DOMRect {
  const part = element.getAttribute("data-marquee");
  const left = part === "copy" ? layout.text + layout.gap : 0;
  const width =
    part === "viewport"
      ? layout.viewport
      : part === "text" || part === "copy"
        ? layout.text
        : 0;
  return { left, width, right: left + width } as DOMRect;
}

type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
};

let animations: FakeAnimation[] = [];

beforeEach(() => {
  reducedMotion.value = false;
  layout.viewport = 200;
  layout.text = 120;
  animations = [];
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      return rectFor(this);
    },
  );
  Element.prototype.animate = vi.fn(function (
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) {
    const animation = {
      keyframes,
      options,
      pause: vi.fn(),
      play: vi.fn(),
      cancel: vi.fn(),
    };
    animations.push(animation);
    return animation as unknown as Animation;
  }) as unknown as Element["animate"];
});

afterEach(() => {
  vi.restoreAllMocks();
});

function longTitle() {
  layout.text = 480;
}

describe("OverflowMarquee", () => {
  it("shows a title that fits as plain, still text", () => {
    render(<OverflowMarquee text="Short show" />);

    expect(screen.getAllByText("Short show")).toHaveLength(1);
    expect(animations).toHaveLength(0);
  });

  it("scrolls a title that is too long, right to left, at a constant speed", () => {
    longTitle();
    render(<OverflowMarquee text="A very long show title" />);

    expect(animations).toHaveLength(1);
    const [animation] = animations;
    const loop = layout.text + layout.gap;
    // It holds at the start, then moves exactly one loop to the left, so the
    // second copy lands where the first began and the loop has no jump.
    expect(animation.keyframes[0].transform).toBe("translate3d(0px, 0, 0)");
    expect(animation.keyframes[1].transform).toBe("translate3d(0px, 0, 0)");
    expect(animation.keyframes[2].transform).toBe(
      `translate3d(-${loop}px, 0, 0)`,
    );
    expect(animation.options.iterations).toBe(Infinity);
    expect(animation.options.easing).toBe("linear");

    // Twice the length takes twice the travel time: the speed stays the same.
    const hold =
      Number(animation.keyframes[1].offset) *
      Number(animation.options.duration);
    const travel = Number(animation.options.duration) - hold;
    expect(travel).toBeCloseTo((loop / 35) * 1000, 0);
    expect(hold).toBeCloseTo(1500, 0);
  });

  it("gives screen readers the title once, not once per copy", () => {
    longTitle();
    render(<OverflowMarquee text="A very long show title" />);

    const copies = screen.getAllByText("A very long show title");
    expect(copies).toHaveLength(2);
    expect(copies[0]).not.toHaveAttribute("aria-hidden");
    expect(copies[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("does not scroll when the device asks for reduced motion", () => {
    longTitle();
    reducedMotion.value = true;
    render(
      <OverflowMarquee
        text="A very long show title"
        fallbackClassName="line-clamp-2"
      />,
    );

    expect(animations).toHaveLength(0);
    const title = screen.getByText("A very long show title");
    expect(title).toHaveClass("line-clamp-2");
    expect(title).toHaveAttribute("title", "A very long show title");
  });

  it("pauses on a tap and starts again on the next tap", () => {
    longTitle();
    render(<OverflowMarquee text="A very long show title" />);
    const [animation] = animations;
    const viewport = screen.getByTitle("A very long show title");

    fireEvent.click(viewport);
    expect(animation.pause).toHaveBeenCalledTimes(1);

    fireEvent.click(viewport);
    expect(animation.play).toHaveBeenCalledTimes(1);
  });

  it("restarts from the beginning when the title changes", () => {
    longTitle();
    const { rerender } = render(<OverflowMarquee text="First long title" />);
    expect(animations).toHaveLength(1);

    act(() => {
      rerender(<OverflowMarquee text="Second long title" />);
    });

    expect(animations[0].cancel).toHaveBeenCalled();
    expect(animations).toHaveLength(2);
    expect(screen.getAllByText("Second long title")).toHaveLength(2);
  });
});
