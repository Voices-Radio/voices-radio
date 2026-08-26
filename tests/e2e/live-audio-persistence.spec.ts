import { expect, test } from "@playwright/test";

/**
 * `/chat` used to live at `app/chat/`, outside the `(station)` route group, so
 * opening it swapped out RedesignShell — and with it the `<audio>` elements
 * that ExploreLiveStrip owns. Live playback died on navigation.
 *
 * Rather than trying to play a real stream headlessly, this marks every audio
 * node before navigating and checks the same nodes are still there afterwards.
 * If the shell ever remounts again, the markers vanish and this fails.
 */
test("live audio elements survive navigating to chat", async ({ page }) => {
  await page.goto("/");

  const livePlayer = page.getByRole("region", { name: "Live player" });
  await expect(livePlayer).toBeAttached();

  const markedCount = await page.evaluate(() => {
    const players = Array.from(document.querySelectorAll("audio"));
    players.forEach((player) => {
      player.dataset.persistenceProbe = "marked";
    });
    return players.length;
  });

  expect(markedCount).toBeGreaterThan(0);

  await livePlayer.getByRole("link", { name: "Chat" }).first().click();
  await page.waitForURL("**/chat");

  // The shell — and therefore the audio host — is still mounted on /chat.
  await expect(page.getByRole("region", { name: "Live player" })).toBeAttached();

  const survivingCount = await page.evaluate(
    () => document.querySelectorAll("audio[data-persistence-probe='marked']").length,
  );

  expect(survivingCount).toBe(markedCount);
});
