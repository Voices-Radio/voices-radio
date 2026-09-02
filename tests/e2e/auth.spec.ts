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

  // React resets uncontrolled inputs once a form action settles, so before the
  // action echoed the submitted values back, a single short password wiped the
  // visitor's name and email too. Asserted in a real browser because the reset
  // is React DOM behaviour that jsdom does not reproduce.
  test("keeps name, email and consent after a failed submit", async ({
    page,
  }) => {
    await page.goto("/join/create-account");

    await page.getByLabel(/^first name$/i).fill("Ada");
    await page.getByLabel(/^last name$/i).fill("Lovelace");
    await page.getByLabel(/^email$/i).fill("ada@example.test");
    await page.getByRole("checkbox", { name: /voices news/i }).check();
    // Too short — fails validation without ever reaching the backend.
    await page.getByLabel(/^password$/i).fill("short");

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByTestId("form-error")).toBeVisible();
    await expect(page.getByText(/8 characters/i)).toBeVisible();

    await expect(page.getByLabel(/^first name$/i)).toHaveValue("Ada");
    await expect(page.getByLabel(/^last name$/i)).toHaveValue("Lovelace");
    await expect(page.getByLabel(/^email$/i)).toHaveValue("ada@example.test");
    await expect(
      page.getByRole("checkbox", { name: /voices news/i }),
    ).toBeChecked();
    // Never echoed back — re-populating it would put the plaintext in the HTML.
    await expect(page.getByLabel(/^password$/i)).toHaveValue("");
  });
});
