import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./create-password-form", () => ({
  default: ({ token }: { token: string }) => <form data-testid="form" data-token={token} />,
}));
vi.mock("../verify-email/resend-verification", () => ({
  default: () => <div data-testid="resend" />,
}));

const { default: CreatePasswordPage, metadata } = await import("./page");

describe("CreatePasswordPage", () => {
  it("shows the form for a link with a token, without spending it", async () => {
    render(await CreatePasswordPage({ searchParams: Promise.resolve({ token: "abc" }) }));
    expect(screen.getByTestId("form")).toHaveAttribute("data-token", "abc");
    expect(screen.getByRole("heading", { name: /create your password/i })).toBeInTheDocument();
  });

  it("offers a new link when the code is missing", async () => {
    render(await CreatePasswordPage({ searchParams: Promise.resolve({}) }));
    expect(screen.queryByTestId("form")).not.toBeInTheDocument();
    expect(screen.getByTestId("resend")).toBeInTheDocument();
  });

  it("keeps the single-use token out of the Referer header and out of search", () => {
    expect(metadata.referrer).toBe("no-referrer");
    expect(metadata.robots).toMatchObject({ index: false });
  });
});
