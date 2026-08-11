import { expect, test } from "@playwright/test";

test.describe("/support", () => {
  test("leads with impact messaging and a primary CTA into /join", async ({
    page,
  }) => {
    await page.goto("/support");

    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible();

    // "Radio stays open" — membership must never read as a paywall.
    await expect(
      page.getByText(/radio stays open/i),
    ).toBeVisible();

    const primaryCta = page.getByRole("link", { name: /join voices/i });
    await expect(primaryCta).toBeVisible();
    await primaryCta.click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test("has no horizontal scroll at a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/support");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
