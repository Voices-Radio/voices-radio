import { expect, test } from "@playwright/test";

/**
 * Non-destructive checks against the live backend. Nothing here creates an
 * account or moves money, so it is safe to re-run at will.
 *
 * /join is a sliding scale, not a tier table: one slider from the cheapest to
 * the dearest live monthly price, plus a Monthly/Annual toggle. The range below
 * is the live catalogue (18 prices, 399p to 1999p). A change to it is a pricing
 * decision, so this test should fail until someone updates it on purpose.
 */

const MIN_PENCE = 399;
const MAX_PENCE = 1999;

test.describe("live membership scale", () => {
  test("renders the live price range from the backend, not a fallback", async ({
    page,
  }) => {
    await page.goto("/join");

    await expect(
      page.getByRole("heading", { level: 1, name: /choose what you give/i }),
    ).toBeVisible();

    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("min", String(MIN_PENCE));
    await expect(slider).toHaveAttribute("max", String(MAX_PENCE));
    await expect(
      page.getByText(/pricing (is )?(temporarily )?unavailable/i),
    ).toHaveCount(0);
  });

  test("the slider drives the monthly amount on the Continue link", async ({
    page,
  }) => {
    await page.goto("/join");
    const slider = page.getByRole("slider");
    const cta = page.getByRole("link", { name: /^continue/i });

    await slider.focus();
    await page.keyboard.press("End");
    await expect(cta).toContainText("£19.99/month");

    await page.keyboard.press("Home");
    await expect(cta).toContainText("£3.99/month");
  });

  test("the annual toggle switches the Continue link to a yearly price", async ({
    page,
  }) => {
    await page.goto("/join");
    const cta = page.getByRole("link", { name: /^continue/i });

    await page.getByRole("button", { name: /annual/i }).click();
    await expect(cta).toContainText(/£\d+\.\d{2}\/year/);

    await page.getByRole("button", { name: /^monthly$/i }).click();
    await expect(cta).toContainText(/£\d+\.\d{2}\/month/);
  });
});

test.describe("auth guard", () => {
  // The layout guard exists specifically to stop members being bounced hourly,
  // but it must still refuse an unauthenticated visitor.
  for (const path of ["/account", "/account/membership", "/account/benefits", "/account/profile"]) {
    test(`${path} sends a signed-out visitor to sign-in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    });
  }

  test("no membership data leaks into the signed-out shell", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByText(/renews|cancel membership|your tier/i)).toHaveCount(0);
  });
});

test.describe("backend error envelope", () => {
  test("BFF returns the contract error shape when signed out", async ({ request }) => {
    const response = await request.get("/api/membership/me");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      error: { code: expect.any(String), message: expect.any(String) },
    });
    // The message must be human-readable, not a raw internal string.
    expect(body.error.message).not.toMatch(/undefined|null|\[object/i);
  });
});
