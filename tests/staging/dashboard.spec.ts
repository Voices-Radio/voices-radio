import { expect, test } from "@playwright/test";

/**
 * Read-only checks for a signed-in member against the live backend.
 * Non-destructive and re-runnable — nothing here mutates the membership.
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL and E2E_PASSWORD must be set");

test.beforeEach(async ({ page }) => {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(EMAIL!);
  await page.locator('input[name="password"]').fill(PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/account/, { timeout: 60_000 });
});

test("dashboard renders the live membership state", async ({ page }) => {
  await page.waitForLoadState("networkidle");
  const main = page.getByRole("main");

  // Assertions are scoped to <main>: the footer's "Become a Supporter" link
  // makes an unscoped /supporter/i match meaningless.
  await expect(main.getByText(/something went wrong/i)).toHaveCount(0);
  await expect(main.getByText(/you.re not a member yet/i)).toHaveCount(0);
  await expect(main.getByText(/supporter/i).first()).toBeVisible();

  await page.screenshot({ path: "artifacts/dashboard-active.png", fullPage: true });
});

test("membership page renders without error", async ({ page }) => {
  await page.goto("/account/membership");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("main").getByText(/something went wrong/i)).toHaveCount(0);
  await page.screenshot({ path: "artifacts/membership-page.png", fullPage: true });
});

test("benefits and redemptions render without error", async ({ page }) => {
  for (const [path, name] of [
    ["/account/benefits", "benefits"],
    ["/account/redemptions", "redemptions"],
    ["/account/profile", "profile"],
  ] as const) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main").getByText(/something went wrong/i)).toHaveCount(0);
    await page.screenshot({ path: `artifacts/${name}-page.png`, fullPage: true });
  }
});
