import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ updateProfileAction: vi.fn() }));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormState: (_action: unknown, initial: unknown) => [initial, vi.fn()],
  useFormStatus: () => ({ pending: false }),
}));

const { default: ProfileForm } = await import("./profile-form");

const profile = {
  displayName: "Ada",
  supporterWallOptIn: true,
  marketingConsent: true,
  memberUpdates: true,
  address: null,
};

describe("ProfileForm", () => {
  it("shows every member control for a member", () => {
    render(<ProfileForm profile={profile} showAddress={false} />);

    expect(screen.getByLabelText("Recognition name")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /supporter wall/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /newsletter/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /member-only updates/i })).toBeInTheDocument();
  });

  it("shows only the newsletter choice for a free account, and marks itself as free", () => {
    const { container } = render(
      <ProfileForm profile={profile} showAddress freeAccount />,
    );

    expect(screen.getByRole("checkbox", { name: /newsletter/i })).toBeChecked();
    expect(screen.queryByLabelText("Recognition name")).toBeNull();
    expect(screen.queryByRole("checkbox", { name: /supporter wall/i })).toBeNull();
    expect(screen.queryByRole("checkbox", { name: /member-only updates/i })).toBeNull();
    expect(screen.queryByText(/postal address/i)).toBeNull();
    expect(container.querySelector('input[name="freeAccount"]')).toHaveValue("1");
  });
});
