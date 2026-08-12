import { expect, test } from "@playwright/test";

/**
 * STATEFUL. Creates a real account and takes a real Stripe test-mode payment
 * against the production backend database. Not safe to re-run blindly — each
 * run needs a fresh email, so E2E_EMAIL is required rather than defaulted.
 *
 *   STAGING_AUTH_USER=voices STAGING_PASSWORD=... \
 *   E2E_EMAIL=someone@example.com E2E_PASSWORD=... \
 *     npx playwright test --config playwright.staging.config.ts journey
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL and E2E_PASSWORD must be set");

const TEST_CARD = "4242424242424242";

test("join → checkout → Stripe → complete → account", async ({ page }) => {
  test.setTimeout(300_000);

  // ---- 1. Choose a tier -------------------------------------------------
  await page.goto("/join");
  await page.getByRole("link", { name: /choose supporter/i }).first().click();
  await expect(page).toHaveURL(/create-account/);

  // ---- 2. Create the account -------------------------------------------
  await page.locator('input[name="firstName"]').fill("Jack");
  await page.locator('input[name="lastName"]').fill("Test");
  await page.locator('input[name="email"]').fill(EMAIL!);
  await page.locator('input[name="password"]').fill(PASSWORD!);

  await page.getByRole("button", { name: /create account/i }).click();

  // ---- 3. Handoff to Stripe --------------------------------------------
  // This is where INVALID_REDIRECT_URL surfaces if the origin is not allowed,
  // so fail loudly with whatever the form error says rather than on a timeout.
  const formError = page.getByTestId("form-error");
  await Promise.race([
    page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 }),
    formError.waitFor({ state: "visible", timeout: 60_000 }).then(async () => {
      throw new Error(`Checkout handoff failed: ${await formError.innerText()}`);
    }),
  ]);
  await expect(page).toHaveURL(/checkout\.stripe\.com/);

  // ---- 4. Pay -----------------------------------------------------------
  await page.locator("#cardNumber").fill(TEST_CARD);
  await page.locator("#cardExpiry").fill("12/30");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("Jack Test");
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill("SW1A 1AA");

  await page.getByTestId("hosted-payment-submit-button").click();

  // ---- 5. Reconciliation ------------------------------------------------
  await page.waitForURL(/\/join\/complete/, { timeout: 120_000 });
  await expect(page).toHaveURL(/session_id=/);

  // The poller must not claim success before the webhook lands.
  await expect(page.locator('[aria-live="polite"]')).toBeVisible();

  // ---- 6. Dashboard -----------------------------------------------------
  await page.waitForURL(/\/account/, { timeout: 120_000 });
  await expect(page.getByText(/supporter/i).first()).toBeVisible();
});
