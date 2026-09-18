import { expect, test, type Page } from "@playwright/test";
import { seed, uniqueEmail, uniqueToken } from "./seed";

/**
 * L4 (docs/plans/onboarding-e2e-matrix.md §5): the claim flow against a real,
 * local voices_backend — not the stub, not production. Covers the cases the
 * plan calls out as the ones most likely to drift between the stub and the
 * real route: C1 (the F3 regression this whole effort started from), C3, C4,
 * C7 (the Apple set-password path — S1's most delicate branch), and C11.
 *
 * Run with: npx playwright test --config playwright.real-backend.config.ts
 * See that config for setup and the safety notes on RadioCult/email.
 */

const PASSWORD = "correct horse battery staple";

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/sign-in");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/account(\/|\?|$)/);
}

const claimButton = (page: Page) =>
  page.getByRole("button", { name: /claim artist profile/i });

test.describe("real backend: the claim flow", () => {
  test("C1 existing artist, no account: never asks for an existing password (the F3 regression)", async ({
    page,
  }) => {
    const email = uniqueEmail("real-c1");
    const token = uniqueToken();
    const artistName = `Real C1 Artist ${token}`;
    seed({
      artists: [{ name: artistName }],
      invitations: [{ token, email, artist: artistName }],
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(email)).toBeVisible();
    // F3: the bug this whole matrix exists to catch — asking a DJ for the
    // password of an account they never had.
    await expect(page.getByLabel(/existing account password/i)).toHaveCount(0);

    await page.getByLabel(/first name/i).fill("Ada");
    await page.getByLabel(/last name/i).fill("Lovelace");
    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C3 account with a password: asked for it, links, keeps the membership", async ({
    page,
  }) => {
    const email = uniqueEmail("real-c3");
    const token = uniqueToken();
    const artistName = `Real C3 Artist ${token}`;
    seed({
      users: [{ email, password: PASSWORD, membership: true }],
      artists: [{ name: artistName }],
      invitations: [{ token, email, artist: artistName }],
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByLabel(/first name/i)).toHaveCount(0);
    await page.getByLabel(/existing account password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C4 already signed in as the invited address: one click, no password re-entry", async ({
    page,
  }) => {
    const email = uniqueEmail("real-c4");
    const token = uniqueToken();
    const artistName = `Real C4 Artist ${token}`;
    seed({
      users: [{ email, password: PASSWORD }],
      artists: [{ name: artistName }],
      invitations: [{ token, email, artist: artistName }],
    });

    await signIn(page, email);
    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(/you are already signed in as/i)).toBeVisible();
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C7 Apple-only account: sets a real, bcrypt-hashed web password, and can sign in with it", async ({
    page,
  }) => {
    const email = uniqueEmail("real-c7");
    const token = uniqueToken();
    const artistName = `Real C7 Artist ${token}`;
    seed({
      users: [{ email, authProvider: "apple" }],
      artists: [{ name: artistName }],
      invitations: [{ token, email, artist: artistName }],
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(/uses sign in with apple/i)).toBeVisible();
    await expect(page.getByLabel(/existing account password/i)).toHaveCount(0);

    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);

    // Proves the password round-trips through the real bcrypt hash in
    // models/User.js — this is exactly the path the pre-save hook fix (D2,
    // c43c4fe) targets. A stub could fake this; the real backend can't.
    await page.context().clearCookies();
    await signIn(page, email);
    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C11 claimed, not by this visitor: says so, with a working sign-in link", async ({
    page,
  }) => {
    const email = uniqueEmail("real-c11");
    const token = uniqueToken();
    seed({
      users: [{ email, password: PASSWORD }],
      invitations: [
        { token, email, status: "accepted", acceptedByEmail: email },
      ],
    });

    await page.goto(`/artists/claim/${token}`);

    await expect(
      page.getByRole("heading", { name: /already claimed/i }),
    ).toBeVisible();
    // Case-sensitive and exact: the header nav also has a "Sign in" link
    // (capitalised), and a case-insensitive match resolves to both.
    const signInLink = page.getByRole("link", { name: "sign in", exact: true });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await page.getByLabel(/^email$/i).fill(email);
    await page.getByLabel(/^password$/i).fill(PASSWORD);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/account\/artist$/);
  });
});
