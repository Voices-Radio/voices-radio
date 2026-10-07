import { expect, test } from "@playwright/test";

test.describe("About", () => {
  test("keeps the original editorial content in one scroll-driven story", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "About Voices Radio", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /how we got here/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /ossia bookings/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /our values/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /our community/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText("Avalon Emerson", { exact: true }),
    ).toBeVisible();

    const sun = page.getByTestId("about-sun");
    await expect(sun).toBeVisible();
    const beforeScroll = await sun.getAttribute("style");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(async () => sun.getAttribute("style"))
      .not.toEqual(beforeScroll);
  });

  test("stays within the viewport at every supported responsive size", async ({
    page,
  }) => {
    for (const { width, height } of [
      { width: 320, height: 720 },
      { width: 390, height: 844 },
      { width: 768, height: 900 },
      { width: 1024, height: 900 },
      { width: 1280, height: 900 },
      { width: 1440, height: 960 },
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/about");

      const { clientWidth, scrollWidth } = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(scrollWidth, `${width}px page width`).toBeLessThanOrEqual(
        clientWidth + 1,
      );
    }
  });

  test("uses the static presentation when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");

    await expect(page.locator("#main-content")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    await expect(page.getByTestId("about-sun")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /our community/i, level: 2 }),
    ).toBeVisible();
  });
});
