import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { createMailbox, linkFrom, type Mailbox } from "./helpers/mailbox";

/**
 * The signed-in journeys on real staging: live backend, Stripe TEST mode,
 * real email through Resend into disposable mail.tm inboxes.
 *
 * Run (manual only, never CI — it creates real accounts and test payments):
 *   npx playwright test --config playwright.staging.config.ts
 *
 * Serial on purpose: B → D and A → C reuse the accounts made earlier, and the
 * config has retries: 0 because a retry would repeat a payment. Every account
 * is named "E2E Test …" so it can be found later.
 */

test.describe.configure({ mode: "serial" });

const STAGING_HOST = new URL(
  process.env.STAGING_BASE_URL ?? "https://staging.voicesradio.co.uk",
).host;
const TEST_CARD = {
  number: "4242 4242 4242 4242",
  expiry: "12 / 34",
  cvc: "123",
  postcode: "N1C 4AA",
};

type Person = { mailbox: Mailbox; password: string; lastName: string };
const free = {} as Person;
const paid = {} as Person;

const strongPassword = () =>
  `E2e-${Math.random().toString(36).slice(2, 8)}-Aa1`;

async function snap(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(
    `${String(info.attachments.length + 1).padStart(2, "0")}-${name}.png`,
  );
  await page.screenshot({ path, fullPage: false });
  await info.attach(name, { path, contentType: "image/png" });
}

async function signIn(page: Page, person: Person) {
  await page.goto("/sign-in");
  await page
    .getByRole("textbox", { name: "Email" })
    .fill(person.mailbox.address);
  await page.getByRole("textbox", { name: "Password" }).fill(person.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 20_000 });
}

/**
 * Waits until the header shows the signed-in account button. Until the
 * session has loaded, a bookmark tap is treated as signed out (see the
 * "save before session loads" finding, 29 Oct 2026).
 */
async function waitForSignedInShell(page: Page) {
  await expect(page.getByRole("button", { name: /^Account menu/ }).first()).toBeVisible({ timeout: 20_000 });
}

/** Fills Stripe's hosted Checkout (test mode) and pays. */
async function payOnStripe(page: Page, info: TestInfo) {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45_000 });
  await expect(page.getByText("Payment method")).toBeVisible({ timeout: 30_000 });
  await snap(page, info, "stripe-checkout");
  // Card is one option among several (Klarna, Revolut Pay); its fields only
  // appear once it is chosen.
  // Stripe lays an invisible "Pay with card" button over the Card row.
  await page.getByTestId("card-accordion-item-button").dispatchEvent("click");
  await expect(page.locator("#cardNumber")).toBeVisible({ timeout: 20_000 });
  await page.locator("#cardNumber").fill(TEST_CARD.number);
  await page.locator("#cardExpiry").fill(TEST_CARD.expiry);
  await page.locator("#cardCvc").fill(TEST_CARD.cvc);
  const name = page.locator("#billingName");
  if (await name.isVisible().catch(() => false)) await name.fill("E2E Test");
  const postcode = page.locator("#billingPostalCode");
  if (await postcode.isVisible().catch(() => false)) await postcode.fill(TEST_CARD.postcode);
  // Never opt in to "Save my information for faster checkout".
  const save = page.getByRole("checkbox", { name: /Save my information/ });
  if (await save.isChecked().catch(() => false)) await save.uncheck();
  await snap(page, info, "stripe-filled");
  await page.getByTestId("hosted-payment-submit-button").click();
  await page.waitForURL((url) => url.host === STAGING_HOST, { timeout: 90_000 });
  await snap(page, info, "back-from-stripe");
}

test("A. free account: sign up, verify email, save a show, playlists are for members", async ({
  page,
}, info) => {
  free.mailbox = await createMailbox("free");
  free.password = strongPassword();
  free.lastName = `Free ${new Date().toISOString().slice(0, 16)}`;

  await test.step("create a free account", async () => {
    await page.goto("/create-account");
    await page.getByRole("textbox", { name: "First name" }).fill("E2E Test");
    await page.getByRole("textbox", { name: "Last name" }).fill(free.lastName);
    await page
      .getByRole("textbox", { name: "Email" })
      .fill(free.mailbox.address);
    await page
      .getByRole("textbox", { name: "Create a password" })
      .fill(free.password);
    await page
      .getByRole("textbox", { name: "Confirm your password" })
      .fill(free.password);
    await page.getByRole("button", { name: "Create free account" }).click();
    await expect(
      page.getByRole("heading", { name: /check your inbox/i }),
    ).toBeVisible({ timeout: 20_000 });
    await snap(page, info, "after-sign-up");
  });

  await test.step("verification email arrives and its link works", async () => {
    const email = await free.mailbox.waitForEmail(/verif|confirm/i);
    info.annotations.push({
      type: "email",
      description: `${email.subject} (from ${email.from})`,
    });
    const link = linkFrom(email, "verify");
    expect(
      new URL(link).host,
      "verification link must point at the site the person signed up on",
    ).toBe(STAGING_HOST);
    await page.goto(link);
    await page.waitForTimeout(3_000);
    await snap(page, info, "after-verify-link");
    await expect(
      page.getByText(/something went wrong|invalid|expired/i),
    ).toHaveCount(0);
  });

  await test.step("signed in", async () => {
    await page.goto("/account");
    if (/\/sign-in/.test(page.url())) await signIn(page, free);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account/);
    await snap(page, info, "account");
  });

  await test.step("save a show to favourites", async () => {
    await page.goto("/shows");
    await waitForSignedInShell(page);
    const save = page.getByRole("button", { name: /^Save / }).first();
    const label = (await save.getAttribute("aria-label")) ?? "";
    const title = label.replace(/^Save /, "");
    info.annotations.push({ type: "saved show", description: title });
    await save.click();
    await page.waitForTimeout(1_500);
    await snap(page, info, "after-save");
    await page.goto("/account/favourites");
    await expect(page.getByText(title, { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });
    await snap(page, info, "favourites");
  });

  await test.step("playlists are offered as a member benefit, not usable", async () => {
    await expect(page.getByPlaceholder("Playlist name")).toHaveCount(0);
    await expect(page.getByText(/member/i).first()).toBeVisible();
  });
});

test("B. paid join while signed out: details, Stripe test card, create password, member", async ({
  page,
}, info) => {
  paid.mailbox = await createMailbox("paid");
  paid.password = strongPassword();
  paid.lastName = `Paid ${new Date().toISOString().slice(0, 16)}`;

  await test.step("choose the lowest monthly amount", async () => {
    await page.goto("/join");
    const slider = page.getByRole("slider", { name: "Monthly contribution" });
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(
      page.getByRole("link", { name: /^Continue — £3\.99\/month/ }),
    ).toBeVisible();
    await snap(page, info, "join-amount");
    await page.getByRole("link", { name: /^Continue — / }).click();
  });

  await test.step("give details", async () => {
    await expect(page).toHaveURL(/\/join\/create-account/);
    await page.getByRole("textbox", { name: "First name" }).fill("E2E Test");
    await page.getByRole("textbox", { name: "Last name" }).fill(paid.lastName);
    await page
      .getByRole("textbox", { name: "Email" })
      .fill(paid.mailbox.address);
    await snap(page, info, "join-details");
    await page.getByRole("button", { name: "Continue to payment" }).click();
  });

  await test.step("pay with the Stripe test card", async () => {
    await payOnStripe(page, info);
  });

  await test.step("create-password email arrives and sets the password", async () => {
    const email = await paid.mailbox.waitForEmail(/password|account|welcome/i, {
      timeoutMs: 180_000,
    });
    info.annotations.push({
      type: "email",
      description: `${email.subject} (from ${email.from})`,
    });
    const link = linkFrom(email, "create-password");
    expect(new URL(link).host).toBe(STAGING_HOST);
    await page.goto(link);
    await page.locator("#password").fill(paid.password);
    await page.locator("#confirmPassword").fill(paid.password);
    await snap(page, info, "create-password");
    await page.locator("form").getByRole("button").last().click();
    await page.waitForTimeout(4_000);
    await snap(page, info, "after-create-password");
  });

  await test.step("account shows a membership", async () => {
    await page.goto("/account/membership");
    if (/\/sign-in/.test(page.url())) {
      await signIn(page, paid);
      await page.goto("/account/membership");
    }
    await expect(page.getByText(/£3\.99/).first()).toBeVisible({
      timeout: 20_000,
    });
    await snap(page, info, "membership");
  });

  await test.step("a member can make a playlist and add a show", async () => {
    await page.goto("/shows");
    await waitForSignedInShell(page);
    await page.getByRole("button", { name: /^Save / }).first().click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByText("Save to…")).toBeVisible({ timeout: 15_000 });
    await sheet.getByPlaceholder("New playlist name").fill("E2E playlist");
    await sheet.getByRole("button", { name: "Create playlist" }).click();
    await expect(sheet.getByText("E2E playlist")).toBeVisible({ timeout: 15_000 });
    await snap(page, info, "member-save-sheet");
    await sheet.getByRole("button", { name: "Done" }).click();
    await page.goto("/account/favourites");
    await expect(page.getByRole("button", { name: /E2E playlist/ }).or(page.getByRole("link", { name: /E2E playlist/ })).first()).toBeVisible({ timeout: 15_000 });
    await snap(page, info, "playlist-on-favourites");
  });

  await test.step("member emails arrived", async () => {
    const welcome = await paid.mailbox
      .waitForEmail(/welcome|member|thank/i, { timeoutMs: 60_000 })
      .catch(() => null);
    info.annotations.push({
      type: "member email",
      description: welcome ? welcome.subject : "NONE within 60s",
    });
  });
});

test("C. join while signed in: the free account becomes a member", async ({
  page,
}, info) => {
  test.skip(!free.mailbox, "needs the account from A");
  await signIn(page, free);
  await page.goto("/join");
  await page.getByRole("slider", { name: "Monthly contribution" }).focus();
  await page.keyboard.press("Home");
  await snap(page, info, "join-signed-in");
  await page.getByRole("link", { name: /^Continue — / }).click();
  await payOnStripe(page, info);
  await page.goto("/account/membership");
  await expect(page.getByText(/£3\.99/).first()).toBeVisible({
    timeout: 30_000,
  });
  await snap(page, info, "membership");
});

test("D. change and cancel the membership", async ({ page }, info) => {
  test.skip(!paid.mailbox, "needs the member from B");
  await signIn(page, paid);
  await page.goto("/account/membership");
  await snap(page, info, "membership-before");

  await test.step("switch billing (monthly → annual) is offered and confirmable", async () => {
    const trigger = page.getByRole("button", {
      name: /Switch to annual billing/,
    });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await snap(page, info, "switch-dialog");
    await page.getByRole("button", { name: "Confirm change" }).click();
    await page.waitForTimeout(5_000);
    await snap(page, info, "after-switch");
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });

  await test.step("cancel", async () => {
    await page.reload();
    await page
      .getByRole("button", { name: "Cancel membership" })
      .first()
      .click();
    await snap(page, info, "cancel-dialog");
    await page.getByRole("button", { name: "Confirm cancellation" }).click();
    await page.waitForTimeout(5_000);
    await page.reload();
    await expect(
      page.getByRole("button", { name: /Resume membership/ }),
    ).toBeVisible({ timeout: 20_000 });
    await snap(page, info, "after-cancel");
  });
});

test("E. sign out and sign in again", async ({ page }, info) => {
  test.skip(!paid.mailbox, "needs the member from B");
  await signIn(page, paid);
  await page.goto("/account");
  await page
    .getByRole("button", { name: "Sign out" })
    .first()
    .click()
    .catch(async () => {
      // Desktop puts Sign out inside the menu.
      await page.getByRole("button", { name: "Open menu" }).first().click();
      await page.getByRole("button", { name: "Sign out" }).first().click();
    });
  await page.waitForTimeout(2_000);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in/);
  await snap(page, info, "signed-out");
  await signIn(page, paid);
  await snap(page, info, "signed-in-again");
});

test("F. forgot password: email, reset, sign in with the new one", async ({
  page,
}, info) => {
  test.skip(!free.mailbox, "needs the account from A");
  const since = new Date();
  await page.goto("/forgot-password");
  await page.getByRole("textbox", { name: "Email" }).fill(free.mailbox.address);
  await page.getByRole("button", { name: "Send reset email" }).click();
  await page.waitForTimeout(2_000);
  await snap(page, info, "reset-requested");
  const email = await free.mailbox.waitForEmail(/reset|password/i, { since });
  info.annotations.push({
    type: "email",
    description: `${email.subject} (from ${email.from})`,
  });
  const link = linkFrom(email, "reset-password");
  expect(new URL(link).host).toBe(STAGING_HOST);
  await page.goto(link);
  free.password = strongPassword();
  await page.locator("#password").fill(free.password);
  await page.locator("#confirmPassword").fill(free.password);
  await page.locator("form").getByRole("button").last().click();
  await page.waitForTimeout(3_000);
  await snap(page, info, "after-reset");
  await signIn(page, free);
  await snap(page, info, "signed-in-with-new-password");
});

test("G. phone: menu, contact, KX player, search", async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Contact" }).first(),
  ).toBeVisible();
  await snap(page, info, "menu");
  await dialog
    .getByRole("searchbox")
    .first()
    .fill("house")
    .catch(() => {});
  await page.waitForTimeout(2_000);
  await snap(page, info, "search");
  await page.keyboard.press("Escape");
  const play = page.getByRole("button", { name: /play/i }).first();
  await play.click();
  await page.waitForTimeout(3_000);
  await snap(page, info, "kx-playing");
  await context.close();
});
