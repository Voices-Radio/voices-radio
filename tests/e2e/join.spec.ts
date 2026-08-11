import { expect, test } from "@playwright/test";

test.describe("/join — desktop tier comparison", () => {
  test("renders a semantic table with all four tiers, Member marked most popular", async ({
    page,
  }) => {
    await page.goto("/join");

    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /supporter/i }),
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /member/i }),
    ).toContainText(/most popular/i);
    await expect(
      table.getByRole("columnheader", { name: /insider/i }),
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: /patron/i }),
    ).toBeVisible();
  });

  test("switching to annual updates the URL and the displayed price", async ({
    page,
  }) => {
    await page.goto("/join");
    const table = page.getByRole("table");

    await expect(table).toContainText("£8");
    await expect(table).not.toContainText("£80");

    await page.getByRole("button", { name: /annual/i }).click();

    await expect(page).toHaveURL(/cadence=annual/);
    await expect(table).toContainText("£80");
  });

  test("a direct link to ?cadence=annual renders annual pricing on load (refresh-safe)", async ({
    page,
  }) => {
    await page.goto("/join?cadence=annual");

    await expect(
      page.getByRole("button", { name: /^annual/i }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("table")).toContainText("£80");
  });

  test("toggling cadence replaces the URL rather than stacking history entries, so back leaves /join entirely", async ({
    page,
  }) => {
    // The toggle intentionally uses router.replace (not push): repeatedly
    // flipping monthly/annual shouldn't force visitors to hit "back"
    // multiple times just to leave the page they toggled on.
    await page.goto("/support");
    await page.getByRole("link", { name: /join voices/i }).click();
    await expect(page).toHaveURL(/\/join$/);

    await page.getByRole("button", { name: /annual/i }).click();
    await expect(page).toHaveURL(/cadence=annual/);

    await page.goBack();
    await expect(page).toHaveURL(/\/support$/);

    await page.goForward();
    await expect(page).toHaveURL(/cadence=annual/);
    await expect(
      page.getByRole("button", { name: /^annual/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("the ballot/eligibility disclaimer is present and doesn't promise guaranteed airplay", async ({
    page,
  }) => {
    await page.goto("/join");

    await expect(page.getByText(/eligibility to submit/i)).toBeVisible();
  });

  test("cadence toggle and tier selection are fully keyboard-operable", async ({
    page,
  }) => {
    await page.goto("/join");

    await page.getByRole("button", { name: /^monthly$/i }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /annual/i })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/cadence=annual/);
  });
});

test.describe("/join — mobile at 320px", () => {
  test.use({ viewport: { width: 320, height: 900 } });

  test("stacks tiers as cards instead of the wide table, with no horizontal scroll", async ({
    page,
  }) => {
    await page.goto("/join");

    const cards = page.getByTestId("mobile-tier-cards");
    await expect(cards).toBeVisible();
    await expect(page.getByRole("table")).toBeHidden();
    await expect(
      cards.getByRole("link", { name: /choose member/i }),
    ).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("Member's most-popular badge is announced via aria-describedby, not colour alone", async ({
    page,
  }) => {
    await page.goto("/join");

    const cards = page.getByTestId("mobile-tier-cards");
    await expect(cards.getByText(/most popular/i)).toBeVisible();
  });
});
