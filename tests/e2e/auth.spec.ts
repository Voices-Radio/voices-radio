import { expect, test } from "@playwright/test";

test.describe("account guard", () => {
  test("visiting /account while signed out redirects to /sign-in", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Faccount/);
  });
});

test.describe("/sign-in", () => {
  test("shows field-level and summary errors on empty submit, and focuses the summary", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    await page.getByRole("button", { name: /sign in/i }).click();

    const alert = page.getByTestId("form-error");
    await expect(alert).toBeVisible();
    await expect(alert).toBeFocused();
    await expect(page.getByText(/enter your email address/i)).toBeVisible();
    await expect(page.getByText(/enter your password/i)).toBeVisible();
  });

  test("email field is properly labelled", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });
});

test.describe("/join/create-account", () => {
  test("shows validation errors for an empty form and focuses the summary", async ({
    page,
  }) => {
    await page.goto("/join/create-account");

    await page.getByRole("button", { name: /create account/i }).click();

    const alert = page.getByTestId("form-error");
    await expect(alert).toBeVisible();
    await expect(alert).toBeFocused();
    await expect(page.getByText(/enter your first name/i)).toBeVisible();
    await expect(page.getByText(/enter your last name/i)).toBeVisible();
    await expect(page.getByText(/8 characters/i)).toBeVisible();
  });

  test("marketing consent checkbox is off by default and independent of account creation", async ({
    page,
  }) => {
    await page.goto("/join/create-account");

    const checkbox = page.getByRole("checkbox", { name: /voices news/i });
    await expect(checkbox).not.toBeChecked();
  });

  test("carries the chosen tier and cadence through from /join", async ({
    page,
  }) => {
    await page.goto("/join/create-account?tier=member&cadence=annual");

    await expect(
      page.getByText(/member membership, billed annual/i),
    ).toBeVisible();
  });
});
