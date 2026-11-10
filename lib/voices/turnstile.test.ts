import { describe, expect, it } from "vitest";
import { TURNSTILE_RESPONSE_FIELD, turnstileTokenFrom } from "./turnstile";

function formWith(value?: string | Blob) {
  const data = new FormData();
  if (value !== undefined) data.set(TURNSTILE_RESPONSE_FIELD, value);
  return data;
}

describe("turnstileTokenFrom", () => {
  it("reads the token the widget put in the form", () => {
    expect(turnstileTokenFrom(formWith("tok-123"))).toBe("tok-123");
  });

  it("returns undefined when the widget added nothing", () => {
    expect(turnstileTokenFrom(formWith())).toBeUndefined();
    expect(turnstileTokenFrom(formWith(""))).toBeUndefined();
  });

  it("ignores a file posted under the token name", () => {
    expect(turnstileTokenFrom(formWith(new Blob(["x"])))).toBeUndefined();
  });
});
