import { expect, type Page } from "@playwright/test";

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}@example.com`;
}

/**
 * Drives the full new-member journey against the stub backend (see
 * tests/e2e/stub-backend/server.mjs): pick a tier on /join, create an
 * account, follow the stub's fake-Stripe redirect, and wait for
 * /join/complete's poller to reconcile onto the dashboard. Used as setup
 * by specs that need a signed-in member with an active membership rather
 * than re-testing the checkout journey itself (see checkout.spec.ts for
 * that).
 */
export async function joinAsNewMember(
  page: Page,
  {
    tier = "member",
    cadence = "monthly",
  }: { tier?: string; cadence?: string } = {},
): Promise<{ email: string }> {
  const email = uniqueEmail(tier);

  await page.goto(cadence === "annual" ? "/join?cadence=annual" : "/join");
  await page
    .getByRole("link", { name: new RegExp(`choose ${tier}`, "i") })
    .click();
  await expect(page).toHaveURL(/\/join\/create-account/);

  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Lovelace");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correcthorsebattery");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/account$/, { timeout: 15_000 });

  return { email };
}
