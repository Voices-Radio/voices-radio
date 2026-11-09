import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PasswordInput from "./password-input";

function renderField(onSubmit = vi.fn((event: { preventDefault(): void }) => event.preventDefault())) {
  render(
    <form onSubmit={onSubmit}>
      <label htmlFor="pw">Password</label>
      <PasswordInput id="pw" name="password" />
    </form>,
  );
  return {
    input: screen.getByLabelText(/^password$/i),
    toggle: screen.getByRole("button", { name: /show password/i }),
    onSubmit,
  };
}

describe("PasswordInput", () => {
  it("starts hidden, and its label still finds the input rather than the toggle", () => {
    const { input } = renderField();

    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("type")).toBe("password");
  });

  it("reveals and re-hides what was typed without losing it", async () => {
    const user = userEvent.setup();
    const { input, toggle } = renderField();

    await user.type(input, "hunter22");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    await user.click(toggle);
    expect(input.getAttribute("type")).toBe("text");
    expect((input as HTMLInputElement).value).toBe("hunter22");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");

    await user.click(toggle);
    expect(input.getAttribute("type")).toBe("password");
  });

  it("never submits the form it sits in", async () => {
    const user = userEvent.setup();
    const { toggle, onSubmit } = renderField();

    await user.click(toggle);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(toggle.getAttribute("type")).toBe("button");
  });
});
