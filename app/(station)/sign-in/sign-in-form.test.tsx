import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ signInAction: vi.fn() }));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormState: (_action: unknown, initial: unknown) => [initial, vi.fn()],
  useFormStatus: () => ({ pending: false }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("../verify-email/resend-verification", () => ({ default: () => null }));

const { default: SignInForm } = await import("./sign-in-form");

describe("SignInForm sign-up options", () => {
  it("offers a free account above the join-as-member link", () => {
    render(<SignInForm next="" />);

    const create = screen.getByRole("link", { name: "Create one here" });
    const join = screen.getByRole("link", { name: "Join as a member" });
    expect(create).toHaveAttribute("href", "/create-account");
    expect(join).toHaveAttribute("href", "/join");
    expect(screen.getByText(/Don.t have an account\?/)).toBeInTheDocument();
    // DOM order: Create one here comes first.
    expect(
      create.compareDocumentPosition(join) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("carries next into the create-account link", () => {
    render(<SignInForm next="/shows/abc" />);
    expect(screen.getByRole("link", { name: "Create one here" })).toHaveAttribute(
      "href",
      "/create-account?next=%2Fshows%2Fabc",
    );
  });
});
