import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShareButton from "./share-button";

function stubNavigator(values: Record<string, unknown>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(navigator, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
}

afterEach(() => {
  stubNavigator({ share: undefined, clipboard: undefined });
});

describe("ShareButton", () => {
  it("uses the native share sheet when the browser has one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    stubNavigator({ share, clipboard: { writeText } });

    const user = userEvent.setup();
    render(<ShareButton title="Inside the new studio" />);
    await user.click(screen.getByRole("button", { name: /share/i }));

    expect(share).toHaveBeenCalledWith({
      title: "Inside the new studio",
      url: window.location.href,
    });
    // The native sheet handles the confirmation itself; copying on top of it
    // would put the link on the clipboard without the reader asking.
    expect(writeText).not.toHaveBeenCalled();
  });

  it("does not fall back to copying when the share sheet is dismissed", async () => {
    const share = vi.fn().mockRejectedValue(new Error("AbortError"));
    const writeText = vi.fn();
    stubNavigator({ share, clipboard: { writeText } });

    const user = userEvent.setup();
    render(<ShareButton title="Inside the new studio" />);
    await user.click(screen.getByRole("button", { name: /share/i }));

    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText("Link copied")).toBeNull();
  });

  it("copies the link and confirms it when there is no share sheet", async () => {
    // userEvent.setup() installs its own navigator.clipboard stub, so the
    // real assertion target has to be applied after it.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share: undefined, clipboard: { writeText } });

    render(<ShareButton title="Inside the new studio" />);
    await user.click(screen.getByRole("button", { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() =>
      expect(screen.getByText("Link copied")).toBeInTheDocument(),
    );
  });

  it("never shows a success state when copying was blocked", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const prompt = vi.fn();
    stubNavigator({ share: undefined, clipboard: { writeText } });
    vi.stubGlobal("prompt", prompt);

    render(<ShareButton title="Inside the new studio" />);
    await user.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => expect(prompt).toHaveBeenCalled());
    expect(screen.queryByText("Link copied")).toBeNull();

    vi.unstubAllGlobals();
  });
});
