import { expect, test } from "@playwright/test";
import { joinAsNewMember } from "./helpers/join-as-member";

test.describe("/account/membership — changes preview before confirming", () => {
  test("upgrading shows a preview, then applies immediately on confirm", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "member" });
    await page.goto("/account/membership");

    await page.getByRole("button", { name: "Upgrade" }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Preview must load (contract §5) before the confirm button is usable.
    await expect(dialog.getByText(/effective/i)).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: /confirm upgrade/i }),
    ).toBeEnabled();

    await dialog.getByRole("button", { name: /confirm upgrade/i }).click();
    await expect(dialog).toBeHidden();

    await expect(page.getByRole("heading", { name: /insider/i })).toBeVisible();
  });

  test("cancelling then resuming round-trips the membership status", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "member" });
    await page.goto("/account/membership");

    await page.getByRole("button", { name: "Cancel membership" }).click();
    const cancelDialog = page.getByRole("dialog");
    await expect(
      cancelDialog.getByRole("button", { name: /confirm cancellation/i }),
    ).toBeEnabled();
    await cancelDialog
      .getByRole("button", { name: /confirm cancellation/i })
      .click();
    await expect(cancelDialog).toBeHidden();

    await expect(page.getByText(/cancelling/i).first()).toBeVisible();

    await page.getByRole("button", { name: /resume membership/i }).click();
    await expect(page.getByText(/^active$/i).first()).toBeVisible();
  });
});

test.describe("/account/benefits — redemption", () => {
  test("claiming a benefit moves it out of the actionable list and into redemption history with a member-facing code", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "member" });
    await page.goto("/account/benefits");

    const claimButton = page.getByRole("button", { name: /^claim$/i });
    await expect(claimButton).toBeVisible();
    await claimButton.click();

    await expect(
      page.getByRole("link", { name: /view your code/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^claim$/i })).toHaveCount(0);

    await page.goto("/account/redemptions");
    await expect(page.getByText(/VOICES-/)).toBeVisible();
  });

  test("a ballot-style benefit never says 'claimed' — eligibility to enter, not guaranteed", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "member" });
    await page.goto("/account/benefits");

    await expect(page.getByText(/eligible to enter/i)).toBeVisible();
    await page.getByRole("button", { name: /enter ballot/i }).click();

    await expect(page.getByText(/entry submitted/i)).toBeVisible();
    // "claimed" is deliberately never used for ballot-style benefits —
    // eligibility to submit, not guaranteed admission (brief requirement).
    await expect(page.getByText(/claimed/i)).toHaveCount(0);
  });
});

test.describe("/account/profile — independent consent controls", () => {
  test("marketing consent and supporter-wall opt-in save and persist independently", async ({
    page,
  }) => {
    await joinAsNewMember(page, { tier: "member" });
    await page.goto("/account/profile");

    const supporterWall = page.getByRole("checkbox", {
      name: /supporter wall/i,
    });
    const marketing = page.getByRole("checkbox", { name: /voices news/i });
    await expect(supporterWall).not.toBeChecked();
    await expect(marketing).not.toBeChecked();

    await marketing.check();
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/profile has been updated/i)).toBeVisible();

    // Reload to confirm this actually persisted server-side, not just a
    // live DOM checkbox the user happened to click.
    await page.reload();
    await expect(
      page.getByRole("checkbox", { name: /voices news/i }),
    ).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /supporter wall/i }),
    ).not.toBeChecked();
  });
});
