import { expect, test, type Page } from "@playwright/test";

/**
 * STATEFUL. Drives real mutations (upgrade/downgrade/cadence/cancel/resume)
 * against the live backend for one real account. Tests run in sequence and
 * each depends on the state the previous one left behind — not safe to
 * reorder or run in parallel (see playwright.staging.config.ts: workers: 1).
 *
 *   STAGING_AUTH_USER=voices STAGING_PASSWORD=... \
 *   E2E_EMAIL=... E2E_PASSWORD=... \
 *     npx playwright test --config playwright.staging.config.ts state-matrix
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL and E2E_PASSWORD must be set");
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(EMAIL!);
  await page.locator('input[name="password"]').fill(PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/account/, { timeout: 60_000 });
  await page.goto("/account/membership");
  await page.waitForLoadState("networkidle");
});

/** Opens a change-tier dialog, waits for the preview to load, confirms it. */
async function confirmChange(
  page: Page,
  triggerName: RegExp,
  confirmName: RegExp,
) {
  await page.getByRole("button", { name: triggerName }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const confirmButton = dialog.getByRole("button", { name: confirmName });
  // Disabled until the preview-change call resolves — waiting for "enabled"
  // is also proof the preview actually loaded rather than erroring.
  await expect(confirmButton).toBeEnabled({ timeout: 15_000 });

  const previewText = await dialog.textContent();
  await confirmButton.click();
  await expect(dialog).toBeHidden({ timeout: 15_000 });

  return previewText;
}

test("1. upgrade: supporter -> member is immediate", async ({ page }) => {
  const preview = await confirmChange(page, /^Upgrade$/, /^Confirm upgrade$/);
  expect(preview).toMatch(/£5/); // Member's price, shown in the preview

  await page.waitForLoadState("networkidle");
  const me = await (await page.request.get("/api/membership/me")).json();
  expect(me.tierId).toBe("member");
  expect(me.status).toBe("active");
  expect(me.scheduledChange).toBeNull();
});

test("2. downgrade: member -> supporter is scheduled, not immediate", async ({
  page,
  request,
}) => {
  const preview = await confirmChange(
    page,
    /^Downgrade$/,
    /^Confirm downgrade$/,
  );
  expect(preview).toMatch(/£3/); // Supporter's price

  await page.waitForLoadState("networkidle");
  const me = await (await page.request.get("/api/membership/me")).json();
  // Still on the current (higher) tier until the scheduled date — a
  // downgrade must never take benefits away immediately.
  expect(me.tierId).toBe("member");
  expect(me.status).toBe("active");
  expect(me.scheduledChange).toMatchObject({
    type: "downgrade",
    toTierId: "supporter",
  });

  await page.screenshot({
    path: "artifacts/matrix-02-downgrade-scheduled.png",
    fullPage: true,
  });
});

test("3. cancel while a downgrade is scheduled: cancelling wins", async ({
  page,
}) => {
  // The regression the backend fixed: a member who has a pending downgrade,
  // then cancels, must end up cancelling on their *current* tier — the
  // scheduled downgrade must never apply. "Cancel or switch down" offers
  // "Switch to Supporter" as a genuine peer option beside "Cancel
  // membership" (per the brief) — a confirm dialog gates the real mutation.
  await page.getByRole("button", { name: /^cancel membership$/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /^confirm cancellation$/i }).click();

  // Wait for the mutation to actually land: the status card flips from
  // "ACTIVE" to "CANCELLING" once the Server Action's revalidatePath takes
  // effect. Polling the BFF immediately after networkidle can outrace it.
  await expect(page.getByText(/^cancelling$/i).first()).toBeVisible({
    timeout: 15_000,
  });

  const me = await (await page.request.get("/api/membership/me")).json();
  expect(me.status).toBe("cancelling");
  expect(me.tierId).toBe("member"); // NOT supporter — the downgrade never applied
  expect(me.scheduledChange).toBeNull(); // cleared, not carried forward

  await page.goto("/account/membership");
  await page.waitForLoadState("networkidle");
  const main = page.getByRole("main");
  await expect(main.getByText(/cancelling/i).first()).toBeVisible();
  await expect(main.getByText(/scheduled/i)).toHaveCount(0);
  await page.screenshot({
    path: "artifacts/matrix-03-cancel-wins.png",
    fullPage: true,
  });
});

test("4. resume clears cancellation and keeps the current tier", async ({
  page,
}) => {
  await page.getByRole("button", { name: /resume membership/i }).click();
  await expect(page.getByText(/^active$/i).first()).toBeVisible({
    timeout: 15_000,
  });

  const me = await (await page.request.get("/api/membership/me")).json();
  expect(me.status).toBe("active");
  expect(me.tierId).toBe("member");
  // The discarded downgrade must not reappear on resume.
  expect(me.scheduledChange).toBeNull();

  await page.screenshot({
    path: "artifacts/matrix-04-resumed.png",
    fullPage: true,
  });
});

// Numbered 5b, not 6: declared here (before the annual-cadence test) so it
// runs in file order against the Member tier the redemption benefit needs —
// test.describe.configure({ mode: "serial" }) runs tests in declaration
// order, not by the number in their name.
test("5b. redeem an available benefit, idempotently", async ({ page }) => {
  // e2e_test_merch_discount goes eligible -> available once the account
  // reaches Member. Only benefit currently seeded, so this is the one
  // redemption path testable against the live backend right now.
  await page.goto("/account/benefits");
  await page.waitForLoadState("networkidle");

  const redeemButton = page.getByRole("button", { name: /^show code$/i });
  // The seeded benefit has exactly one unit of capacity, so this only has
  // something to redeem once — skip rather than fail on a re-run once it's
  // already used, so the suite stays green without needing new fixtures.
  test.skip(
    (await redeemButton.count()) === 0,
    "e2e_test_merch_discount already redeemed (capacity was 1) — nothing left to test.",
  );
  await redeemButton.click();

  // The button carries one idempotency key for its whole mounted lifetime
  // (see redeem-button.tsx) — a second click while the page hasn't
  // refreshed must be a no-op dedup, not a second redemption. router.refresh()
  // fires on success, which unmounts this exact button, so a genuine second
  // click can only race the same key through, never mint a new one.
  // No BFF proxy exists for GET /api/membership/benefits (only /me does —
  // see app/api/membership/me/route.ts), so confirm via the rendered page
  // rather than an API call the frontend has no route for.
  await page.goto("/account/benefits");
  await page.waitForLoadState("networkidle");
  await expect(
    page
      .getByRole("main")
      .getByText(/^used$/i)
      .first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^show code$/i })).toHaveCount(
    0,
  );

  await page.goto("/account/redemptions");
  await page.waitForLoadState("networkidle");
  // Member-facing code, never an internal ID.
  await expect(page.getByText(/VOICES-[A-Z0-9]+/i)).toBeVisible();
  await page.screenshot({
    path: "artifacts/matrix-06-redeemed.png",
    fullPage: true,
  });
});

test("5. switch to annual billing", async ({ page }) => {
  const preview = await confirmChange(
    page,
    /switch to annual billing/i,
    /^Confirm (switch|change)/i,
  );
  expect(preview).toMatch(/£50/); // Member's annual price

  await page.waitForLoadState("networkidle");
  const me = await (await page.request.get("/api/membership/me")).json();
  // Cadence changes are scheduled for renewal, same as a downgrade — not
  // an immediate re-charge.
  expect(
    me.cadence === "annual" || me.scheduledChange?.type === "change_cadence",
  ).toBe(true);

  await page.screenshot({
    path: "artifacts/matrix-05-annual.png",
    fullPage: true,
  });
});
