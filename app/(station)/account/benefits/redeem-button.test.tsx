import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/voices/membership/analytics", () => ({ trackMembershipEvent: vi.fn() }));
vi.mock("./actions", () => ({ redeemAction: vi.fn() }));

const { redeemAction } = await import("./actions");
const { default: RedeemButton } = await import("./redeem-button");

describe("RedeemButton", () => {
  it("shows the code after a successful redeem", async () => {
    vi.mocked(redeemAction).mockResolvedValue({ ok: true, code: "VOICES10" });

    render(<RedeemButton benefitId="merch_discount_10" benefitSlug="merch_discount_10" label="Show code" />);
    fireEvent.click(screen.getByRole("button", { name: "Show code" }));

    expect(await screen.findByText("VOICES10")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
