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

  // ---- 2. The dashboard must render, whatever the state ------------------
  // Not asserting status: null here — creating a checkout session moves the
  // account to pending_reconciliation, so this account only passes through
  // status: null once. What matters on every run is that the status card
  // renders a real state rather than the generic parse-failure message.
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  await page.screenshot({
    path: "artifacts/staging-01-dashboard.png",
    fullPage: true,
  });

  // This journey can only run against a member who has not yet subscribed —
  // checkout is correctly refused for someone already on a tier. Skip rather
  // than fail, so the rest of the staging suite stays re-runnable.
  const me = await page.request.get("/api/membership/me");
  const status = me.ok() ? (await me.json())?.status : null;
  test.skip(
    status === "active" || status === "cancelling",
    `Account is already ${status} — re-run needs a fresh, verified account.`,
  );

  // ---- 3. Pick a tier ---------------------------------------------------
  await page.goto("/join");
  await page
    .getByRole("link", { name: /choose supporter/i })
    .first()
    .click();

  // ---- 4. Handoff to Stripe --------------------------------------------
  // INVALID_REDIRECT_URL surfaces on /join as ?checkoutError=, so fail with
  // the real reason rather than an opaque navigation timeout.
  await page.waitForURL(/checkout\.stripe\.com|checkoutError=/, {
    timeout: 90_000,
  });
  if (/checkoutError=/.test(page.url())) {
    throw new Error(
      `Checkout refused: ${decodeURIComponent(page.url().split("checkoutError=")[1])}`,
    );
  }
  await page.screenshot({
    path: "artifacts/staging-02-stripe.png",
    fullPage: true,
  });

  // ---- 5. Pay -----------------------------------------------------------
  // Stripe offers Klarna and Revolut alongside Card, so the card fields only
  // mount once Card is selected.
  // The radio sits under an accordion overlay that swallows pointer events,
  // so check it directly rather than clicking through the visual row.
  const cardRadio = page.locator("#payment-method-accordion-item-title-card");
  // Wait for it to exist rather than probing count() — Stripe mounts the
  // payment-method list asynchronously, and a bare count() races it and
  // silently skips the selection.
  await cardRadio.waitFor({ state: "attached", timeout: 45_000 });
  await cardRadio.check({ force: true });

  await page
    .locator("#cardNumber")
    .waitFor({ state: "visible", timeout: 30_000 });
  await page.locator("#cardNumber").fill(TEST_CARD);
  await page.locator("#cardExpiry").fill("12/30");
  await page.locator("#cardCvc").fill("123");

  const name = page.locator("#billingName");
  if (await name.count()) await name.fill("Jack Test");
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill("SW1A 1AA");

  // Must be the hosted submit button specifically — a looser /pay/i match
  // picks up the Apple Pay express button, which lives in an iframe.
  await page.getByTestId("hosted-payment-submit-button").click();

  // ---- 6. Reconciliation ------------------------------------------------
  await page.waitForURL(/\/join\/complete/, { timeout: 150_000 });
  expect(page.url()).toMatch(/session_id=/);
  await page.screenshot({
    path: "artifacts/staging-03-complete.png",
    fullPage: true,
  });

  // ---- 7. Dashboard -----------------------------------------------------
  await page.waitForURL(/\/account(?!\/)/, { timeout: 150_000 });
  await page.waitForLoadState("networkidle");

  // Scope to the dashboard itself. The site footer carries a "Become a
  // Supporter" link, so an unscoped /supporter/i match passes even when the
  // dashboard has rendered nothing at all — which is exactly what happened
  // the first time this test went green.
  const main = page.getByRole("main");
  await expect(main.getByText(/you.re not a member yet/i)).toHaveCount(0);
  await expect(main.getByText(/something went wrong/i)).toHaveCount(0);
  await expect(main.getByText(/^active$/i).first()).toBeVisible();
  await expect(main.getByText(/supporter/i).first()).toBeVisible();
  await expect(main.getByText(/£3/).first()).toBeVisible();

  await page.screenshot({
    path: "artifacts/staging-04-account-active.png",
    fullPage: true,
  });

  await page
    .context()
    .storageState({ path: "tests/staging/.auth/member.json" });
});
