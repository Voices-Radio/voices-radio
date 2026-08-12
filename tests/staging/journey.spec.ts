import { expect, test } from "@playwright/test";

/**
 * STATEFUL. Signs in as a real verified account and takes a real Stripe
 * test-mode payment against the production backend database.
 *
 * Assumes the account already exists and is email-verified — registration is a
 * one-shot, so it is not re-run here.
 *
 *   STAGING_AUTH_USER=voices STAGING_PASSWORD=... \
 *   E2E_EMAIL=... E2E_PASSWORD=... \
 *     npx playwright test --config playwright.staging.config.ts journey
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL and E2E_PASSWORD must be set");

const TEST_CARD = "4242424242424242";

test("signed-in member: not-a-member → checkout → Stripe → complete → active", async ({
  page,
}) => {
  test.setTimeout(300_000);

  // ---- 1. Sign in -------------------------------------------------------
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(EMAIL!);
  await page.locator('input[name="password"]').fill(PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/account/, { timeout: 60_000 });

  // ---- 2. status: null must read as "never joined", not "lapsed" --------
  await expect(page.getByText(/you.re not a member yet/i)).toBeVisible();
  await expect(page.getByText(/expired/i)).toHaveCount(0);
  await page.screenshot({ path: "artifacts/staging-01-not-a-member.png", fullPage: true });

  // ---- 3. Pick a tier ---------------------------------------------------
  await page.goto("/join");
  await page.getByRole("link", { name: /choose supporter/i }).first().click();

  // ---- 4. Handoff to Stripe --------------------------------------------
  // INVALID_REDIRECT_URL surfaces on /join as ?checkoutError=, so fail with
  // the real reason rather than an opaque navigation timeout.
  await page.waitForURL(/checkout\.stripe\.com|checkoutError=/, { timeout: 90_000 });
  if (/checkoutError=/.test(page.url())) {
    throw new Error(`Checkout refused: ${decodeURIComponent(page.url().split("checkoutError=")[1])}`);
  }
  await page.screenshot({ path: "artifacts/staging-02-stripe.png", fullPage: true });

  // ---- 5. Pay -----------------------------------------------------------
  await page.locator("#cardNumber").fill(TEST_CARD);
  await page.locator("#cardExpiry").fill("12/30");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("Jack Test");
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill("SW1A 1AA");
  await page.getByTestId("hosted-payment-submit-button").click();

  // ---- 6. Reconciliation ------------------------------------------------
  await page.waitForURL(/\/join\/complete/, { timeout: 150_000 });
  expect(page.url()).toMatch(/session_id=/);
  await page.screenshot({ path: "artifacts/staging-03-complete.png", fullPage: true });

  // ---- 7. Dashboard -----------------------------------------------------
  await page.waitForURL(/\/account(?!\/)/, { timeout: 150_000 });
  await expect(page.getByText(/you.re not a member yet/i)).toHaveCount(0);
  await expect(page.getByText(/supporter/i).first()).toBeVisible();
  await page.screenshot({ path: "artifacts/staging-04-account-active.png", fullPage: true });

  await page.context().storageState({ path: "tests/staging/.auth/member.json" });
});
