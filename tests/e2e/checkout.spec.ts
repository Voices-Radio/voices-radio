import { expect, test } from "@playwright/test";
import { joinAsNewMember, uniqueEmail } from "./helpers/join-as-member";

test.describe("Checkout handoff and reconciliation (against the stub backend)", () => {
  test("choosing a tier as a new visitor creates an account, hands off to Stripe, and reconciles onto the dashboard", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "member", cadence: "monthly" });

    // Landed on /account with the reconciled, active membership.
    await expect(page.getByText(/^active$/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /member/i })).toBeVisible();
  });

  test("the /join/complete page shows an activating state before the membership reconciles", async ({
    page,
  }) => {
    // Same journey, but we assert the in-between state instead of racing
    // straight to the end — the brief requires no success state renders
    // until the backend actually confirms it.
    const email = uniqueEmail("pending");
    await page.goto("/join");
    await page.getByRole("link", { name: /choose member/i }).click();
    await page.getByLabel("First name").fill("Ada");
    await page.getByLabel("Last name").fill("Lovelace");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correcthorsebattery");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/join\/complete/);
    await expect(
      page.getByText(/activating your membership|payment confirmed/i),
    ).toBeVisible();

    await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 });
  });

  test("an already-signed-in member choosing a different tier on /join skips account creation entirely", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "supporter", cadence: "monthly" });

    await page.goto("/join");
    await page.getByRole("link", { name: /choose insider/i }).click();

    // /join/checkout (not /join/create-account) handles the handoff for a
    // signed-in visitor and redirects straight through Stripe.
    await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /insider/i })).toBeVisible();
  });
});
