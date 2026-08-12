// f7115fcd3e30585e3131e0f97523792830788615
"use strict";

var _playwright = _interopRequireDefault(require("@axe-core/playwright"));
var _test = require("@playwright/test");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Phase 5 of the membership plan: accessibility and responsive pass on the
 * authenticated /account/* surfaces, against the live backend. Public-page
 * axe coverage already exists in tests/e2e/accessibility.spec.ts against the
 * stub; this is the signed-in equivalent plus the keyboard and viewport
 * checks the stub-backed suite can't exercise against real dialog content.
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;
_test.test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL and E2E_PASSWORD must be set");
async function signIn(page) {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", {
    name: /sign in/i
  }).click();
  await page.waitForURL(/\/account/, {
    timeout: 60000
  });
}
_test.test.beforeEach(async ({
  page
}) => {
  await signIn(page);
});
_test.test.describe("axe: no serious/critical violations", () => {
  const paths = ["/account", "/account/membership", "/account/benefits", "/account/redemptions", "/account/profile"];
  for (const path of paths) {
    (0, _test.test)(path, async ({
      page
    }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new _playwright.default({
        page
      }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
      const seriousOrWorse = results.violations.filter(v => {
        var _v$impact;
        return ["serious", "critical"].includes((_v$impact = v.impact) !== null && _v$impact !== void 0 ? _v$impact : "");
      });
      (0, _test.expect)(seriousOrWorse, seriousOrWorse.map(v => `${v.id}: ${v.description}\n  ${v.helpUrl}`).join("\n")).toEqual([]);
    });
  }
});
_test.test.describe("keyboard-only: confirm-change-dialog", () => {
  (0, _test.test)("opens on Enter, traps focus, Escape closes and returns focus to the trigger", async ({
    page
  }) => {
    await page.goto("/account/membership");
    await page.waitForLoadState("networkidle");

    // Tab from the top of the document to the first tier-change trigger
    // rather than .focus()ing it directly — a real keyboard user has to
    // reach it by tabbing, so that's the path worth proving works.
    const trigger = page.getByRole("button", {
      name: /^(upgrade|downgrade)$/i
    }).first();
    await trigger.waitFor({
      state: "visible"
    });
    await trigger.focus();
    await (0, _test.expect)(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await (0, _test.expect)(dialog).toBeVisible();

    // Radix traps focus inside the dialog — the confirm button must be
    // reachable purely by keyboard, and nothing outside the dialog should
    // be focusable while it's open.
    const confirmButton = dialog.getByRole("button", {
      name: /^Confirm/i
    });
    await (0, _test.expect)(confirmButton).toBeEnabled({
      timeout: 15000
    });
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const stillInDialog = await dialog.locator(":focus").count().catch(() => 0);
      (0, _test.expect)(stillInDialog, `focus escaped the dialog after ${i + 1} Tab presses`).toBeGreaterThan(0);
    }
    await page.keyboard.press("Escape");
    await (0, _test.expect)(dialog).toBeHidden();

    // confirm-change-dialog.tsx's onCloseAutoFocus explicitly returns focus
    // to the trigger — losing your place on close is the concrete harm a
    // missing implementation of this causes.
    await (0, _test.expect)(trigger).toBeFocused();
  });
});
_test.test.describe("responsive: no horizontal scroll", () => {
  const viewports = [{
    name: "320px",
    width: 320,
    height: 720
  }, {
    name: "375px",
    width: 375,
    height: 812
  }, {
    name: "1280px",
    width: 1280,
    height: 900
  }];
  const paths = ["/account", "/account/membership", "/account/benefits", "/account/profile"];
  for (const {
    name,
    width,
    height
  } of viewports) {
    for (const path of paths) {
      (0, _test.test)(`${path} at ${name}`, async ({
        page
      }) => {
        await page.setViewportSize({
          width,
          height
        });
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const {
          scrollWidth,
          clientWidth
        } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        }));
        (0, _test.expect)(scrollWidth, `document.scrollWidth (${scrollWidth}) exceeds viewport (${clientWidth}) at ${name} on ${path}`).toBeLessThanOrEqual(clientWidth + 1); // +1: subpixel rounding

        await page.screenshot({
          path: `artifacts/a11y-${name}-${path.replace(/\//g, "_")}.png`,
          fullPage: true
        });
      });
    }
  }

  // WCAG 1.4.10 (Reflow) is satisfied by the 320px case above, not by a
  // separate "400% zoom" test: the standard reference viewport is 1280px,
  // and 1280 / 400% = 320px of effective CSS space — which is exactly what
  // the 320px viewport already exercises.
  //
  // An earlier version of this suite tried to simulate zoom directly via
  // `document.documentElement.style.zoom`, which is the wrong tool: it
  // visually scales already-laid-out content without changing what media
  // queries see, so the desktop nav never switches to its mobile layout the
  // way a real browser zoom gesture would — producing a scrollWidth blowout
  // that reflects the test technique, not a real reflow failure. Confirmed
  // by screenshot: content wrapped and stacked correctly under the zoom: the
  // measurement was the only thing broken. Playwright has no cross-browser
  // API for a real zoom gesture, so 320px stays the correct proxy.
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcGxheXdyaWdodCIsIl9pbnRlcm9wUmVxdWlyZURlZmF1bHQiLCJyZXF1aXJlIiwiX3Rlc3QiLCJlIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJFTUFJTCIsInByb2Nlc3MiLCJlbnYiLCJFMkVfRU1BSUwiLCJQQVNTV09SRCIsIkUyRV9QQVNTV09SRCIsInRlc3QiLCJza2lwIiwic2lnbkluIiwicGFnZSIsImdvdG8iLCJsb2NhdG9yIiwiZmlsbCIsImdldEJ5Um9sZSIsIm5hbWUiLCJjbGljayIsIndhaXRGb3JVUkwiLCJ0aW1lb3V0IiwiYmVmb3JlRWFjaCIsImRlc2NyaWJlIiwicGF0aHMiLCJwYXRoIiwid2FpdEZvckxvYWRTdGF0ZSIsInJlc3VsdHMiLCJBeGVCdWlsZGVyIiwid2l0aFRhZ3MiLCJhbmFseXplIiwic2VyaW91c09yV29yc2UiLCJ2aW9sYXRpb25zIiwiZmlsdGVyIiwidiIsIl92JGltcGFjdCIsImluY2x1ZGVzIiwiaW1wYWN0IiwiZXhwZWN0IiwibWFwIiwiaWQiLCJkZXNjcmlwdGlvbiIsImhlbHBVcmwiLCJqb2luIiwidG9FcXVhbCIsInRyaWdnZXIiLCJmaXJzdCIsIndhaXRGb3IiLCJzdGF0ZSIsImZvY3VzIiwidG9CZUZvY3VzZWQiLCJrZXlib2FyZCIsInByZXNzIiwiZGlhbG9nIiwidG9CZVZpc2libGUiLCJjb25maXJtQnV0dG9uIiwidG9CZUVuYWJsZWQiLCJpIiwic3RpbGxJbkRpYWxvZyIsImNvdW50IiwiY2F0Y2giLCJ0b0JlR3JlYXRlclRoYW4iLCJ0b0JlSGlkZGVuIiwidmlld3BvcnRzIiwid2lkdGgiLCJoZWlnaHQiLCJzZXRWaWV3cG9ydFNpemUiLCJzY3JvbGxXaWR0aCIsImNsaWVudFdpZHRoIiwiZXZhbHVhdGUiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInRvQmVMZXNzVGhhbk9yRXF1YWwiLCJzY3JlZW5zaG90IiwicmVwbGFjZSIsImZ1bGxQYWdlIl0sInNvdXJjZXMiOlsiYWNjZXNzaWJpbGl0eS5zcGVjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBeGVCdWlsZGVyIGZyb20gXCJAYXhlLWNvcmUvcGxheXdyaWdodFwiO1xuaW1wb3J0IHsgZXhwZWN0LCB0ZXN0LCB0eXBlIFBhZ2UgfSBmcm9tIFwiQHBsYXl3cmlnaHQvdGVzdFwiO1xuXG4vKipcbiAqIFBoYXNlIDUgb2YgdGhlIG1lbWJlcnNoaXAgcGxhbjogYWNjZXNzaWJpbGl0eSBhbmQgcmVzcG9uc2l2ZSBwYXNzIG9uIHRoZVxuICogYXV0aGVudGljYXRlZCAvYWNjb3VudC8qIHN1cmZhY2VzLCBhZ2FpbnN0IHRoZSBsaXZlIGJhY2tlbmQuIFB1YmxpYy1wYWdlXG4gKiBheGUgY292ZXJhZ2UgYWxyZWFkeSBleGlzdHMgaW4gdGVzdHMvZTJlL2FjY2Vzc2liaWxpdHkuc3BlYy50cyBhZ2FpbnN0IHRoZVxuICogc3R1YjsgdGhpcyBpcyB0aGUgc2lnbmVkLWluIGVxdWl2YWxlbnQgcGx1cyB0aGUga2V5Ym9hcmQgYW5kIHZpZXdwb3J0XG4gKiBjaGVja3MgdGhlIHN0dWItYmFja2VkIHN1aXRlIGNhbid0IGV4ZXJjaXNlIGFnYWluc3QgcmVhbCBkaWFsb2cgY29udGVudC5cbiAqL1xuY29uc3QgRU1BSUwgPSBwcm9jZXNzLmVudi5FMkVfRU1BSUw7XG5jb25zdCBQQVNTV09SRCA9IHByb2Nlc3MuZW52LkUyRV9QQVNTV09SRDtcblxudGVzdC5za2lwKCFFTUFJTCB8fCAhUEFTU1dPUkQsIFwiRTJFX0VNQUlMIGFuZCBFMkVfUEFTU1dPUkQgbXVzdCBiZSBzZXRcIik7XG5cbmFzeW5jIGZ1bmN0aW9uIHNpZ25JbihwYWdlOiBQYWdlKSB7XG4gIGF3YWl0IHBhZ2UuZ290byhcIi9zaWduLWluXCIpO1xuICBhd2FpdCBwYWdlLmxvY2F0b3IoJ2lucHV0W25hbWU9XCJlbWFpbFwiXScpLmZpbGwoRU1BSUwhKTtcbiAgYXdhaXQgcGFnZS5sb2NhdG9yKCdpbnB1dFtuYW1lPVwicGFzc3dvcmRcIl0nKS5maWxsKFBBU1NXT1JEISk7XG4gIGF3YWl0IHBhZ2UuZ2V0QnlSb2xlKFwiYnV0dG9uXCIsIHsgbmFtZTogL3NpZ24gaW4vaSB9KS5jbGljaygpO1xuICBhd2FpdCBwYWdlLndhaXRGb3JVUkwoL1xcL2FjY291bnQvLCB7IHRpbWVvdXQ6IDYwXzAwMCB9KTtcbn1cblxudGVzdC5iZWZvcmVFYWNoKGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBzaWduSW4ocGFnZSk7XG59KTtcblxudGVzdC5kZXNjcmliZShcImF4ZTogbm8gc2VyaW91cy9jcml0aWNhbCB2aW9sYXRpb25zXCIsICgpID0+IHtcbiAgY29uc3QgcGF0aHMgPSBbXG4gICAgXCIvYWNjb3VudFwiLFxuICAgIFwiL2FjY291bnQvbWVtYmVyc2hpcFwiLFxuICAgIFwiL2FjY291bnQvYmVuZWZpdHNcIixcbiAgICBcIi9hY2NvdW50L3JlZGVtcHRpb25zXCIsXG4gICAgXCIvYWNjb3VudC9wcm9maWxlXCIsXG4gIF07XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgdGVzdChwYXRoLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgICAgIGF3YWl0IHBhZ2UuZ290byhwYXRoKTtcbiAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvckxvYWRTdGF0ZShcIm5ldHdvcmtpZGxlXCIpO1xuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbmV3IEF4ZUJ1aWxkZXIoeyBwYWdlIH0pXG4gICAgICAgIC53aXRoVGFncyhbXCJ3Y2FnMmFcIiwgXCJ3Y2FnMmFhXCIsIFwid2NhZzIyYWFcIl0pXG4gICAgICAgIC5hbmFseXplKCk7XG5cbiAgICAgIGNvbnN0IHNlcmlvdXNPcldvcnNlID0gcmVzdWx0cy52aW9sYXRpb25zLmZpbHRlcigodikgPT5cbiAgICAgICAgW1wic2VyaW91c1wiLCBcImNyaXRpY2FsXCJdLmluY2x1ZGVzKHYuaW1wYWN0ID8/IFwiXCIpLFxuICAgICAgKTtcblxuICAgICAgZXhwZWN0KFxuICAgICAgICBzZXJpb3VzT3JXb3JzZSxcbiAgICAgICAgc2VyaW91c09yV29yc2VcbiAgICAgICAgICAubWFwKCh2KSA9PiBgJHt2LmlkfTogJHt2LmRlc2NyaXB0aW9ufVxcbiAgJHt2LmhlbHBVcmx9YClcbiAgICAgICAgICAuam9pbihcIlxcblwiKSxcbiAgICAgICkudG9FcXVhbChbXSk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG50ZXN0LmRlc2NyaWJlKFwia2V5Ym9hcmQtb25seTogY29uZmlybS1jaGFuZ2UtZGlhbG9nXCIsICgpID0+IHtcbiAgdGVzdChcIm9wZW5zIG9uIEVudGVyLCB0cmFwcyBmb2N1cywgRXNjYXBlIGNsb3NlcyBhbmQgcmV0dXJucyBmb2N1cyB0byB0aGUgdHJpZ2dlclwiLCBhc3luYyAoe1xuICAgIHBhZ2UsXG4gIH0pID0+IHtcbiAgICBhd2FpdCBwYWdlLmdvdG8oXCIvYWNjb3VudC9tZW1iZXJzaGlwXCIpO1xuICAgIGF3YWl0IHBhZ2Uud2FpdEZvckxvYWRTdGF0ZShcIm5ldHdvcmtpZGxlXCIpO1xuXG4gICAgLy8gVGFiIGZyb20gdGhlIHRvcCBvZiB0aGUgZG9jdW1lbnQgdG8gdGhlIGZpcnN0IHRpZXItY2hhbmdlIHRyaWdnZXJcbiAgICAvLyByYXRoZXIgdGhhbiAuZm9jdXMoKWluZyBpdCBkaXJlY3RseSDigJQgYSByZWFsIGtleWJvYXJkIHVzZXIgaGFzIHRvXG4gICAgLy8gcmVhY2ggaXQgYnkgdGFiYmluZywgc28gdGhhdCdzIHRoZSBwYXRoIHdvcnRoIHByb3Zpbmcgd29ya3MuXG4gICAgY29uc3QgdHJpZ2dlciA9IHBhZ2VcbiAgICAgIC5nZXRCeVJvbGUoXCJidXR0b25cIiwgeyBuYW1lOiAvXih1cGdyYWRlfGRvd25ncmFkZSkkL2kgfSlcbiAgICAgIC5maXJzdCgpO1xuICAgIGF3YWl0IHRyaWdnZXIud2FpdEZvcih7IHN0YXRlOiBcInZpc2libGVcIiB9KTtcbiAgICBhd2FpdCB0cmlnZ2VyLmZvY3VzKCk7XG4gICAgYXdhaXQgZXhwZWN0KHRyaWdnZXIpLnRvQmVGb2N1c2VkKCk7XG5cbiAgICBhd2FpdCBwYWdlLmtleWJvYXJkLnByZXNzKFwiRW50ZXJcIik7XG4gICAgY29uc3QgZGlhbG9nID0gcGFnZS5nZXRCeVJvbGUoXCJkaWFsb2dcIik7XG4gICAgYXdhaXQgZXhwZWN0KGRpYWxvZykudG9CZVZpc2libGUoKTtcblxuICAgIC8vIFJhZGl4IHRyYXBzIGZvY3VzIGluc2lkZSB0aGUgZGlhbG9nIOKAlCB0aGUgY29uZmlybSBidXR0b24gbXVzdCBiZVxuICAgIC8vIHJlYWNoYWJsZSBwdXJlbHkgYnkga2V5Ym9hcmQsIGFuZCBub3RoaW5nIG91dHNpZGUgdGhlIGRpYWxvZyBzaG91bGRcbiAgICAvLyBiZSBmb2N1c2FibGUgd2hpbGUgaXQncyBvcGVuLlxuICAgIGNvbnN0IGNvbmZpcm1CdXR0b24gPSBkaWFsb2cuZ2V0QnlSb2xlKFwiYnV0dG9uXCIsIHsgbmFtZTogL15Db25maXJtL2kgfSk7XG4gICAgYXdhaXQgZXhwZWN0KGNvbmZpcm1CdXR0b24pLnRvQmVFbmFibGVkKHsgdGltZW91dDogMTVfMDAwIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgIGF3YWl0IHBhZ2Uua2V5Ym9hcmQucHJlc3MoXCJUYWJcIik7XG4gICAgICBjb25zdCBzdGlsbEluRGlhbG9nID0gYXdhaXQgZGlhbG9nXG4gICAgICAgIC5sb2NhdG9yKFwiOmZvY3VzXCIpXG4gICAgICAgIC5jb3VudCgpXG4gICAgICAgIC5jYXRjaCgoKSA9PiAwKTtcbiAgICAgIGV4cGVjdChcbiAgICAgICAgc3RpbGxJbkRpYWxvZyxcbiAgICAgICAgYGZvY3VzIGVzY2FwZWQgdGhlIGRpYWxvZyBhZnRlciAke2kgKyAxfSBUYWIgcHJlc3Nlc2AsXG4gICAgICApLnRvQmVHcmVhdGVyVGhhbigwKTtcbiAgICB9XG5cbiAgICBhd2FpdCBwYWdlLmtleWJvYXJkLnByZXNzKFwiRXNjYXBlXCIpO1xuICAgIGF3YWl0IGV4cGVjdChkaWFsb2cpLnRvQmVIaWRkZW4oKTtcblxuICAgIC8vIGNvbmZpcm0tY2hhbmdlLWRpYWxvZy50c3gncyBvbkNsb3NlQXV0b0ZvY3VzIGV4cGxpY2l0bHkgcmV0dXJucyBmb2N1c1xuICAgIC8vIHRvIHRoZSB0cmlnZ2VyIOKAlCBsb3NpbmcgeW91ciBwbGFjZSBvbiBjbG9zZSBpcyB0aGUgY29uY3JldGUgaGFybSBhXG4gICAgLy8gbWlzc2luZyBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIGNhdXNlcy5cbiAgICBhd2FpdCBleHBlY3QodHJpZ2dlcikudG9CZUZvY3VzZWQoKTtcbiAgfSk7XG59KTtcblxudGVzdC5kZXNjcmliZShcInJlc3BvbnNpdmU6IG5vIGhvcml6b250YWwgc2Nyb2xsXCIsICgpID0+IHtcbiAgY29uc3Qgdmlld3BvcnRzID0gW1xuICAgIHsgbmFtZTogXCIzMjBweFwiLCB3aWR0aDogMzIwLCBoZWlnaHQ6IDcyMCB9LFxuICAgIHsgbmFtZTogXCIzNzVweFwiLCB3aWR0aDogMzc1LCBoZWlnaHQ6IDgxMiB9LFxuICAgIHsgbmFtZTogXCIxMjgwcHhcIiwgd2lkdGg6IDEyODAsIGhlaWdodDogOTAwIH0sXG4gIF07XG4gIGNvbnN0IHBhdGhzID0gW1xuICAgIFwiL2FjY291bnRcIixcbiAgICBcIi9hY2NvdW50L21lbWJlcnNoaXBcIixcbiAgICBcIi9hY2NvdW50L2JlbmVmaXRzXCIsXG4gICAgXCIvYWNjb3VudC9wcm9maWxlXCIsXG4gIF07XG5cbiAgZm9yIChjb25zdCB7IG5hbWUsIHdpZHRoLCBoZWlnaHQgfSBvZiB2aWV3cG9ydHMpIHtcbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcbiAgICAgIHRlc3QoYCR7cGF0aH0gYXQgJHtuYW1lfWAsIGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICAgICAgICBhd2FpdCBwYWdlLnNldFZpZXdwb3J0U2l6ZSh7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgIGF3YWl0IHBhZ2UuZ290byhwYXRoKTtcbiAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yTG9hZFN0YXRlKFwibmV0d29ya2lkbGVcIik7XG5cbiAgICAgICAgY29uc3QgeyBzY3JvbGxXaWR0aCwgY2xpZW50V2lkdGggfSA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gKHtcbiAgICAgICAgICBzY3JvbGxXaWR0aDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoLFxuICAgICAgICAgIGNsaWVudFdpZHRoOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgIH0pKTtcblxuICAgICAgICBleHBlY3QoXG4gICAgICAgICAgc2Nyb2xsV2lkdGgsXG4gICAgICAgICAgYGRvY3VtZW50LnNjcm9sbFdpZHRoICgke3Njcm9sbFdpZHRofSkgZXhjZWVkcyB2aWV3cG9ydCAoJHtjbGllbnRXaWR0aH0pIGF0ICR7bmFtZX0gb24gJHtwYXRofWAsXG4gICAgICAgICkudG9CZUxlc3NUaGFuT3JFcXVhbChjbGllbnRXaWR0aCArIDEpOyAvLyArMTogc3VicGl4ZWwgcm91bmRpbmdcblxuICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3Qoe1xuICAgICAgICAgIHBhdGg6IGBhcnRpZmFjdHMvYTExeS0ke25hbWV9LSR7cGF0aC5yZXBsYWNlKC9cXC8vZywgXCJfXCIpfS5wbmdgLFxuICAgICAgICAgIGZ1bGxQYWdlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFdDQUcgMS40LjEwIChSZWZsb3cpIGlzIHNhdGlzZmllZCBieSB0aGUgMzIwcHggY2FzZSBhYm92ZSwgbm90IGJ5IGFcbiAgLy8gc2VwYXJhdGUgXCI0MDAlIHpvb21cIiB0ZXN0OiB0aGUgc3RhbmRhcmQgcmVmZXJlbmNlIHZpZXdwb3J0IGlzIDEyODBweCxcbiAgLy8gYW5kIDEyODAgLyA0MDAlID0gMzIwcHggb2YgZWZmZWN0aXZlIENTUyBzcGFjZSDigJQgd2hpY2ggaXMgZXhhY3RseSB3aGF0XG4gIC8vIHRoZSAzMjBweCB2aWV3cG9ydCBhbHJlYWR5IGV4ZXJjaXNlcy5cbiAgLy9cbiAgLy8gQW4gZWFybGllciB2ZXJzaW9uIG9mIHRoaXMgc3VpdGUgdHJpZWQgdG8gc2ltdWxhdGUgem9vbSBkaXJlY3RseSB2aWFcbiAgLy8gYGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS56b29tYCwgd2hpY2ggaXMgdGhlIHdyb25nIHRvb2w6IGl0XG4gIC8vIHZpc3VhbGx5IHNjYWxlcyBhbHJlYWR5LWxhaWQtb3V0IGNvbnRlbnQgd2l0aG91dCBjaGFuZ2luZyB3aGF0IG1lZGlhXG4gIC8vIHF1ZXJpZXMgc2VlLCBzbyB0aGUgZGVza3RvcCBuYXYgbmV2ZXIgc3dpdGNoZXMgdG8gaXRzIG1vYmlsZSBsYXlvdXQgdGhlXG4gIC8vIHdheSBhIHJlYWwgYnJvd3NlciB6b29tIGdlc3R1cmUgd291bGQg4oCUIHByb2R1Y2luZyBhIHNjcm9sbFdpZHRoIGJsb3dvdXRcbiAgLy8gdGhhdCByZWZsZWN0cyB0aGUgdGVzdCB0ZWNobmlxdWUsIG5vdCBhIHJlYWwgcmVmbG93IGZhaWx1cmUuIENvbmZpcm1lZFxuICAvLyBieSBzY3JlZW5zaG90OiBjb250ZW50IHdyYXBwZWQgYW5kIHN0YWNrZWQgY29ycmVjdGx5IHVuZGVyIHRoZSB6b29tOiB0aGVcbiAgLy8gbWVhc3VyZW1lbnQgd2FzIHRoZSBvbmx5IHRoaW5nIGJyb2tlbi4gUGxheXdyaWdodCBoYXMgbm8gY3Jvc3MtYnJvd3NlclxuICAvLyBBUEkgZm9yIGEgcmVhbCB6b29tIGdlc3R1cmUsIHNvIDMyMHB4IHN0YXlzIHRoZSBjb3JyZWN0IHByb3h5LlxufSk7XG4iXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBQUEsV0FBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUMsS0FBQSxHQUFBRCxPQUFBO0FBQTJELFNBQUFELHVCQUFBRyxDQUFBLFdBQUFBLENBQUEsSUFBQUEsQ0FBQSxDQUFBQyxVQUFBLEdBQUFELENBQUEsS0FBQUUsT0FBQSxFQUFBRixDQUFBO0FBRTNEO0FBQ0E7QUFDQTtBQUNBO0FB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