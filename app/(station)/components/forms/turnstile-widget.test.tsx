import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/env";
import TurnstileWidget from "./turnstile-widget";

const mutableEnv = env as { NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string };

function installTurnstile() {
  const api = {
    render: vi.fn().mockReturnValue("widget-1"),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  window.turnstile = api;
  return api;
}

beforeEach(() => {
  mutableEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
});

afterEach(() => {
  delete mutableEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  delete window.turnstile;
});

describe("TurnstileWidget", () => {
  it("renders nothing when no site key is configured", () => {
    delete mutableEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const api = installTurnstile();

    const { container } = render(<TurnstileWidget action="register" />);

    expect(container).toBeEmptyDOMElement();
    expect(api.render).not.toHaveBeenCalled();
  });

  it("renders the widget with the site key, the form's action and the field name the action reads", async () => {
    const api = installTurnstile();

    await act(async () => {
      render(<TurnstileWidget action="forgot_password" />);
    });

    expect(api.render).toHaveBeenCalledTimes(1);
    expect(api.render.mock.calls[0][1]).toMatchObject({
      sitekey: "1x00000000000000000000AA",
      action: "forgot_password",
      "response-field-name": "cf-turnstile-response",
    });
  });

  it("resets the widget when the form comes back with a result, because a token works only once", async () => {
    const api = installTurnstile();
    let rerender!: ReturnType<typeof render>["rerender"];

    await act(async () => {
      ({ rerender } = render(<TurnstileWidget action="register" />));
    });
    expect(api.reset).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<TurnstileWidget action="register" resetSignal={{ status: "error" }} />);
    });
    expect(api.reset).toHaveBeenCalledWith("widget-1");
  });

  it("removes the widget on unmount", async () => {
    const api = installTurnstile();
    let unmount!: () => void;

    await act(async () => {
      ({ unmount } = render(<TurnstileWidget action="register" />));
    });
    unmount();

    expect(api.remove).toHaveBeenCalledWith("widget-1");
  });

  it("loads the Cloudflare script once when it is not on the page yet", async () => {
    const appendSpy = vi.spyOn(document.head, "appendChild");

    render(<TurnstileWidget action="register" />);
    render(<TurnstileWidget action="register" />);

    const scripts = appendSpy.mock.calls
      .map(([node]) => node as HTMLScriptElement)
      .filter((node) => node.tagName === "SCRIPT");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    );
    appendSpy.mockRestore();
  });
});
