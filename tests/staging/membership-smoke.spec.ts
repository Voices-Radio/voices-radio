import { expect, test } from "@playwright/test";

/**
 * Non-destructive checks against the live backend. Nothing here creates an
 * account or moves money, so it is safe to re-run at will.
 *
 * Prices are asserted against the real catalogue the backend confirmed as live:
 * Supporter £3/£30, Member £5/£50, Insider £15/£150, Patron £25/£250.
 */

test.describe("live tier catalogue", () => {
  test("renders every tier from the backend, not a fallback", async ({ page }) => {
    await page.goto("/join");

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    for (const tier of ["supporter", "member", "insider", "patron"]) {
      await expect(
        table.getByRole("columnheader", { name: new RegExp(tier, "i") }),
      ).toBeVisible();
    }

    // The honest-failure state must NOT be showing.
    await expect(page.getByText(/pricing (is )?(temporarily )?unavailable/i)).toHaveCount(0);
  });

  test("shows live monthly prices", async ({ page }) => {
    await page.goto("/join");
    const table = page.getByRole("table");

    for (const price of ["£3", "£5", "£15", "£25"]) {
      await expect(table).toContainText(price);
    }
  });

  test("cadence toggle switches to live annual prices", async ({ page }) => {
    await page.goto("/join");

    await page.getByRole("button", { name: /annual/i }).click();
    await expect(page).toHaveURL(/cadence=annual/);

    const table = page.getByRole("table");
    for (const price of ["£30", "£50", "£150", "£250"]) {
      await expect(table).toContainText(price);
    }
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
