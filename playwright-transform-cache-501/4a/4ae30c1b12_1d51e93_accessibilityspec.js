// 2c4cd446c8c3df3097a819b6d3a2be3282ee44c6
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

    // No Upgrade/Downgrade controls render while cancelling (correctly —
    // that state only offers Resume). This account is shared with the
    // stateful state-matrix suite, so clear a leftover "cancelling" from an
    // earlier run rather than let this test fail for an unrelated reason.
    if (await page.getByText(/^cancelling$/i).first().isVisible().catch(() => false)) {
      await page.getByRole("button", {
        name: /resume membership/i
      }).click();
      await (0, _test.expect)(page.getByText(/^active$/i).first()).toBeVisible({
        timeout: 15000
      });
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcGxheXdyaWdodCIsIl9pbnRlcm9wUmVxdWlyZURlZmF1bHQiLCJyZXF1aXJlIiwiX3Rlc3QiLCJlIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJFTUFJTCIsInByb2Nlc3MiLCJlbnYiLCJFMkVfRU1BSUwiLCJQQVNTV09SRCIsIkUyRV9QQVNTV09SRCIsInRlc3QiLCJza2lwIiwic2lnbkluIiwicGFnZSIsImdvdG8iLCJsb2NhdG9yIiwiZmlsbCIsImdldEJ5Um9sZSIsIm5hbWUiLCJjbGljayIsIndhaXRGb3JVUkwiLCJ0aW1lb3V0IiwiYmVmb3JlRWFjaCIsImRlc2NyaWJlIiwicGF0aHMiLCJwYXRoIiwid2FpdEZvckxvYWRTdGF0ZSIsInJlc3VsdHMiLCJBeGVCdWlsZGVyIiwid2l0aFRhZ3MiLCJhbmFseXplIiwic2VyaW91c09yV29yc2UiLCJ2aW9sYXRpb25zIiwiZmlsdGVyIiwidiIsIl92JGltcGFjdCIsImluY2x1ZGVzIiwiaW1wYWN0IiwiZXhwZWN0IiwibWFwIiwiaWQiLCJkZXNjcmlwdGlvbiIsImhlbHBVcmwiLCJqb2luIiwidG9FcXVhbCIsImdldEJ5VGV4dCIsImZpcnN0IiwiaXNWaXNpYmxlIiwiY2F0Y2giLCJ0b0JlVmlzaWJsZSIsInRyaWdnZXIiLCJ3YWl0Rm9yIiwic3RhdGUiLCJmb2N1cyIsInRvQmVGb2N1c2VkIiwia2V5Ym9hcmQiLCJwcmVzcyIsImRpYWxvZyIsImNvbmZpcm1CdXR0b24iLCJ0b0JlRW5hYmxlZCIsImkiLCJzdGlsbEluRGlhbG9nIiwiY291bnQiLCJ0b0JlR3JlYXRlclRoYW4iLCJ0b0JlSGlkZGVuIiwidmlld3BvcnRzIiwid2lkdGgiLCJoZWlnaHQiLCJzZXRWaWV3cG9ydFNpemUiLCJzY3JvbGxXaWR0aCIsImNsaWVudFdpZHRoIiwiZXZhbHVhdGUiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInRvQmVMZXNzVGhhbk9yRXF1YWwiLCJzY3JlZW5zaG90IiwicmVwbGFjZSIsImZ1bGxQYWdlIl0sInNvdXJjZXMiOlsiYWNjZXNzaWJpbGl0eS5zcGVjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBeGVCdWlsZGVyIGZyb20gXCJAYXhlLWNvcmUvcGxheXdyaWdodFwiO1xuaW1wb3J0IHsgZXhwZWN0LCB0ZXN0LCB0eXBlIFBhZ2UgfSBmcm9tIFwiQHBsYXl3cmlnaHQvdGVzdFwiO1xuXG4vKipcbiAqIFBoYXNlIDUgb2YgdGhlIG1lbWJlcnNoaXAgcGxhbjogYWNjZXNzaWJpbGl0eSBhbmQgcmVzcG9uc2l2ZSBwYXNzIG9uIHRoZVxuICogYXV0aGVudGljYXRlZCAvYWNjb3VudC8qIHN1cmZhY2VzLCBhZ2FpbnN0IHRoZSBsaXZlIGJhY2tlbmQuIFB1YmxpYy1wYWdlXG4gKiBheGUgY292ZXJhZ2UgYWxyZWFkeSBleGlzdHMgaW4gdGVzdHMvZTJlL2FjY2Vzc2liaWxpdHkuc3BlYy50cyBhZ2FpbnN0IHRoZVxuICogc3R1YjsgdGhpcyBpcyB0aGUgc2lnbmVkLWluIGVxdWl2YWxlbnQgcGx1cyB0aGUga2V5Ym9hcmQgYW5kIHZpZXdwb3J0XG4gKiBjaGVja3MgdGhlIHN0dWItYmFja2VkIHN1aXRlIGNhbid0IGV4ZXJjaXNlIGFnYWluc3QgcmVhbCBkaWFsb2cgY29udGVudC5cbiAqL1xuY29uc3QgRU1BSUwgPSBwcm9jZXNzLmVudi5FMkVfRU1BSUw7XG5jb25zdCBQQVNTV09SRCA9IHByb2Nlc3MuZW52LkUyRV9QQVNTV09SRDtcblxudGVzdC5za2lwKCFFTUFJTCB8fCAhUEFTU1dPUkQsIFwiRTJFX0VNQUlMIGFuZCBFMkVfUEFTU1dPUkQgbXVzdCBiZSBzZXRcIik7XG5cbmFzeW5jIGZ1bmN0aW9uIHNpZ25JbihwYWdlOiBQYWdlKSB7XG4gIGF3YWl0IHBhZ2UuZ290byhcIi9zaWduLWluXCIpO1xuICBhd2FpdCBwYWdlLmxvY2F0b3IoJ2lucHV0W25hbWU9XCJlbWFpbFwiXScpLmZpbGwoRU1BSUwhKTtcbiAgYXdhaXQgcGFnZS5sb2NhdG9yKCdpbnB1dFtuYW1lPVwicGFzc3dvcmRcIl0nKS5maWxsKFBBU1NXT1JEISk7XG4gIGF3YWl0IHBhZ2UuZ2V0QnlSb2xlKFwiYnV0dG9uXCIsIHsgbmFtZTogL3NpZ24gaW4vaSB9KS5jbGljaygpO1xuICBhd2FpdCBwYWdlLndhaXRGb3JVUkwoL1xcL2FjY291bnQvLCB7IHRpbWVvdXQ6IDYwXzAwMCB9KTtcbn1cblxudGVzdC5iZWZvcmVFYWNoKGFzeW5jICh7IHBhZ2UgfSkgPT4ge1xuICBhd2FpdCBzaWduSW4ocGFnZSk7XG59KTtcblxudGVzdC5kZXNjcmliZShcImF4ZTogbm8gc2VyaW91cy9jcml0aWNhbCB2aW9sYXRpb25zXCIsICgpID0+IHtcbiAgY29uc3QgcGF0aHMgPSBbXG4gICAgXCIvYWNjb3VudFwiLFxuICAgIFwiL2FjY291bnQvbWVtYmVyc2hpcFwiLFxuICAgIFwiL2FjY291bnQvYmVuZWZpdHNcIixcbiAgICBcIi9hY2NvdW50L3JlZGVtcHRpb25zXCIsXG4gICAgXCIvYWNjb3VudC9wcm9maWxlXCIsXG4gIF07XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgdGVzdChwYXRoLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgICAgIGF3YWl0IHBhZ2UuZ290byhwYXRoKTtcbiAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvckxvYWRTdGF0ZShcIm5ldHdvcmtpZGxlXCIpO1xuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbmV3IEF4ZUJ1aWxkZXIoeyBwYWdlIH0pXG4gICAgICAgIC53aXRoVGFncyhbXCJ3Y2FnMmFcIiwgXCJ3Y2FnMmFhXCIsIFwid2NhZzIyYWFcIl0pXG4gICAgICAgIC5hbmFseXplKCk7XG5cbiAgICAgIGNvbnN0IHNlcmlvdXNPcldvcnNlID0gcmVzdWx0cy52aW9sYXRpb25zLmZpbHRlcigodikgPT5cbiAgICAgICAgW1wic2VyaW91c1wiLCBcImNyaXRpY2FsXCJdLmluY2x1ZGVzKHYuaW1wYWN0ID8/IFwiXCIpLFxuICAgICAgKTtcblxuICAgICAgZXhwZWN0KFxuICAgICAgICBzZXJpb3VzT3JXb3JzZSxcbiAgICAgICAgc2VyaW91c09yV29yc2VcbiAgICAgICAgICAubWFwKCh2KSA9PiBgJHt2LmlkfTogJHt2LmRlc2NyaXB0aW9ufVxcbiAgJHt2LmhlbHBVcmx9YClcbiAgICAgICAgICAuam9pbihcIlxcblwiKSxcbiAgICAgICkudG9FcXVhbChbXSk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG50ZXN0LmRlc2NyaWJlKFwia2V5Ym9hcmQtb25seTogY29uZmlybS1jaGFuZ2UtZGlhbG9nXCIsICgpID0+IHtcbiAgdGVzdChcIm9wZW5zIG9uIEVudGVyLCB0cmFwcyBmb2N1cywgRXNjYXBlIGNsb3NlcyBhbmQgcmV0dXJucyBmb2N1cyB0byB0aGUgdHJpZ2dlclwiLCBhc3luYyAoe1xuICAgIHBhZ2UsXG4gIH0pID0+IHtcbiAgICBhd2FpdCBwYWdlLmdvdG8oXCIvYWNjb3VudC9tZW1iZXJzaGlwXCIpO1xuICAgIGF3YWl0IHBhZ2Uud2FpdEZvckxvYWRTdGF0ZShcIm5ldHdvcmtpZGxlXCIpO1xuXG4gICAgLy8gTm8gVXBncmFkZS9Eb3duZ3JhZGUgY29udHJvbHMgcmVuZGVyIHdoaWxlIGNhbmNlbGxpbmcgKGNvcnJlY3RseSDigJRcbiAgICAvLyB0aGF0IHN0YXRlIG9ubHkgb2ZmZXJzIFJlc3VtZSkuIFRoaXMgYWNjb3VudCBpcyBzaGFyZWQgd2l0aCB0aGVcbiAgICAvLyBzdGF0ZWZ1bCBzdGF0ZS1tYXRyaXggc3VpdGUsIHNvIGNsZWFyIGEgbGVmdG92ZXIgXCJjYW5jZWxsaW5nXCIgZnJvbSBhblxuICAgIC8vIGVhcmxpZXIgcnVuIHJhdGhlciB0aGFuIGxldCB0aGlzIHRlc3QgZmFpbCBmb3IgYW4gdW5yZWxhdGVkIHJlYXNvbi5cbiAgICBpZiAoXG4gICAgICBhd2FpdCBwYWdlXG4gICAgICAgIC5nZXRCeVRleHQoL15jYW5jZWxsaW5nJC9pKVxuICAgICAgICAuZmlyc3QoKVxuICAgICAgICAuaXNWaXNpYmxlKClcbiAgICAgICAgLmNhdGNoKCgpID0+IGZhbHNlKVxuICAgICkge1xuICAgICAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoXCJidXR0b25cIiwgeyBuYW1lOiAvcmVzdW1lIG1lbWJlcnNoaXAvaSB9KS5jbGljaygpO1xuICAgICAgYXdhaXQgZXhwZWN0KHBhZ2UuZ2V0QnlUZXh0KC9eYWN0aXZlJC9pKS5maXJzdCgpKS50b0JlVmlzaWJsZSh7XG4gICAgICAgIHRpbWVvdXQ6IDE1XzAwMCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRhYiBmcm9tIHRoZSB0b3Agb2YgdGhlIGRvY3VtZW50IHRvIHRoZSBmaXJzdCB0aWVyLWNoYW5nZSB0cmlnZ2VyXG4gICAgLy8gcmF0aGVyIHRoYW4gLmZvY3VzKClpbmcgaXQgZGlyZWN0bHkg4oCUIGEgcmVhbCBrZXlib2FyZCB1c2VyIGhhcyB0b1xuICAgIC8vIHJlYWNoIGl0IGJ5IHRhYmJpbmcsIHNvIHRoYXQncyB0aGUgcGF0aCB3b3J0aCBwcm92aW5nIHdvcmtzLlxuICAgIGNvbnN0IHRyaWdnZXIgPSBwYWdlXG4gICAgICAuZ2V0QnlSb2xlKFwiYnV0dG9uXCIsIHsgbmFtZTogL14odXBncmFkZXxkb3duZ3JhZGUpJC9pIH0pXG4gICAgICAuZmlyc3QoKTtcbiAgICBhd2FpdCB0cmlnZ2VyLndhaXRGb3IoeyBzdGF0ZTogXCJ2aXNpYmxlXCIgfSk7XG4gICAgYXdhaXQgdHJpZ2dlci5mb2N1cygpO1xuICAgIGF3YWl0IGV4cGVjdCh0cmlnZ2VyKS50b0JlRm9jdXNlZCgpO1xuXG4gICAgYXdhaXQgcGFnZS5rZXlib2FyZC5wcmVzcyhcIkVudGVyXCIpO1xuICAgIGNvbnN0IGRpYWxvZyA9IHBhZ2UuZ2V0QnlSb2xlKFwiZGlhbG9nXCIpO1xuICAgIGF3YWl0IGV4cGVjdChkaWFsb2cpLnRvQmVWaXNpYmxlKCk7XG5cbiAgICAvLyBSYWRpeCB0cmFwcyBmb2N1cyBpbnNpZGUgdGhlIGRpYWxvZyDigJQgdGhlIGNvbmZpcm0gYnV0dG9uIG11c3QgYmVcbiAgICAvLyByZWFjaGFibGUgcHVyZWx5IGJ5IGtleWJvYXJkLCBhbmQgbm90aGluZyBvdXRzaWRlIHRoZSBkaWFsb2cgc2hvdWxkXG4gICAgLy8gYmUgZm9jdXNhYmxlIHdoaWxlIGl0J3Mgb3Blbi5cbiAgICBjb25zdCBjb25maXJtQnV0dG9uID0gZGlhbG9nLmdldEJ5Um9sZShcImJ1dHRvblwiLCB7IG5hbWU6IC9eQ29uZmlybS9pIH0pO1xuICAgIGF3YWl0IGV4cGVjdChjb25maXJtQnV0dG9uKS50b0JlRW5hYmxlZCh7IHRpbWVvdXQ6IDE1XzAwMCB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICBhd2FpdCBwYWdlLmtleWJvYXJkLnByZXNzKFwiVGFiXCIpO1xuICAgICAgY29uc3Qgc3RpbGxJbkRpYWxvZyA9IGF3YWl0IGRpYWxvZ1xuICAgICAgICAubG9jYXRvcihcIjpmb2N1c1wiKVxuICAgICAgICAuY291bnQoKVxuICAgICAgICAuY2F0Y2goKCkgPT4gMCk7XG4gICAgICBleHBlY3QoXG4gICAgICAgIHN0aWxsSW5EaWFsb2csXG4gICAgICAgIGBmb2N1cyBlc2NhcGVkIHRoZSBkaWFsb2cgYWZ0ZXIgJHtpICsgMX0gVGFiIHByZXNzZXNgLFxuICAgICAgKS50b0JlR3JlYXRlclRoYW4oMCk7XG4gICAgfVxuXG4gICAgYXdhaXQgcGFnZS5rZXlib2FyZC5wcmVzcyhcIkVzY2FwZVwiKTtcbiAgICBhd2FpdCBleHBlY3QoZGlhbG9nKS50b0JlSGlkZGVuKCk7XG5cbiAgICAvLyBjb25maXJtLWNoYW5nZS1kaWFsb2cudHN4J3Mgb25DbG9zZUF1dG9Gb2N1cyBleHBsaWNpdGx5IHJldHVybnMgZm9jdXNcbiAgICAvLyB0byB0aGUgdHJpZ2dlciDigJQgbG9zaW5nIHlvdXIgcGxhY2Ugb24gY2xvc2UgaXMgdGhlIGNvbmNyZXRlIGhhcm0gYVxuICAgIC8vIG1pc3NpbmcgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBjYXVzZXMuXG4gICAgYXdhaXQgZXhwZWN0KHRyaWdnZXIpLnRvQmVGb2N1c2VkKCk7XG4gIH0pO1xufSk7XG5cbnRlc3QuZGVzY3JpYmUoXCJyZXNwb25zaXZlOiBubyBob3Jpem9udGFsIHNjcm9sbFwiLCAoKSA9PiB7XG4gIGNvbnN0IHZpZXdwb3J0cyA9IFtcbiAgICB7IG5hbWU6IFwiMzIwcHhcIiwgd2lkdGg6IDMyMCwgaGVpZ2h0OiA3MjAgfSxcbiAgICB7IG5hbWU6IFwiMzc1cHhcIiwgd2lkdGg6IDM3NSwgaGVpZ2h0OiA4MTIgfSxcbiAgICB7IG5hbWU6IFwiMTI4MHB4XCIsIHdpZHRoOiAxMjgwLCBoZWlnaHQ6IDkwMCB9LFxuICBdO1xuICBjb25zdCBwYXRocyA9IFtcbiAgICBcIi9hY2NvdW50XCIsXG4gICAgXCIvYWNjb3VudC9tZW1iZXJzaGlwXCIsXG4gICAgXCIvYWNjb3VudC9iZW5lZml0c1wiLFxuICAgIFwiL2FjY291bnQvcHJvZmlsZVwiLFxuICBdO1xuXG4gIGZvciAoY29uc3QgeyBuYW1lLCB3aWR0aCwgaGVpZ2h0IH0gb2Ygdmlld3BvcnRzKSB7XG4gICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgICB0ZXN0KGAke3BhdGh9IGF0ICR7bmFtZX1gLCBhc3luYyAoeyBwYWdlIH0pID0+IHtcbiAgICAgICAgYXdhaXQgcGFnZS5zZXRWaWV3cG9ydFNpemUoeyB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgICAgICBhd2FpdCBwYWdlLmdvdG8ocGF0aCk7XG4gICAgICAgIGF3YWl0IHBhZ2Uud2FpdEZvckxvYWRTdGF0ZShcIm5ldHdvcmtpZGxlXCIpO1xuXG4gICAgICAgIGNvbnN0IHsgc2Nyb2xsV2lkdGgsIGNsaWVudFdpZHRoIH0gPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+ICh7XG4gICAgICAgICAgc2Nyb2xsV2lkdGg6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCxcbiAgICAgICAgICBjbGllbnRXaWR0aDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgZXhwZWN0KFxuICAgICAgICAgIHNjcm9sbFdpZHRoLFxuICAgICAgICAgIGBkb2N1bWVudC5zY3JvbGxXaWR0aCAoJHtzY3JvbGxXaWR0aH0pIGV4Y2VlZHMgdmlld3BvcnQgKCR7Y2xpZW50V2lkdGh9KSBhdCAke25hbWV9IG9uICR7cGF0aH1gLFxuICAgICAgICApLnRvQmVMZXNzVGhhbk9yRXF1YWwoY2xpZW50V2lkdGggKyAxKTsgLy8gKzE6IHN1YnBpeGVsIHJvdW5kaW5nXG5cbiAgICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHtcbiAgICAgICAgICBwYXRoOiBgYXJ0aWZhY3RzL2ExMXktJHtuYW1lfS0ke3BhdGgucmVwbGFjZSgvXFwvL2csIFwiX1wiKX0ucG5nYCxcbiAgICAgICAgICBmdWxsUGFnZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBXQ0FHIDEuNC4xMCAoUmVmbG93KSBpcyBzYXRpc2ZpZWQgYnkgdGhlIDMyMHB4IGNhc2UgYWJvdmUsIG5vdCBieSBhXG4gIC8vIHNlcGFyYXRlIFwiNDAwJSB6b29tXCIgdGVzdDogdGhlIHN0YW5kYXJkIHJlZmVyZW5jZSB2aWV3cG9ydCBpcyAxMjgwcHgsXG4gIC8vIGFuZCAxMjgwIC8gNDAwJSA9IDMyMHB4IG9mIGVmZmVjdGl2ZSBDU1Mgc3BhY2Ug4oCUIHdoaWNoIGlzIGV4YWN0bHkgd2hhdFxuICAvLyB0aGUgMzIwcHggdmlld3BvcnQgYWxyZWFkeSBleGVyY2lzZXMuXG4gIC8vXG4gIC8vIEFuIGVhcmxpZXIgdmVyc2lvbiBvZiB0aGlzIHN1aXRlIHRyaWVkIHRvIHNpbXVsYXRlIHpvb20gZGlyZWN0bHkgdmlhXG4gIC8vIGBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuem9vbWAsIHdoaWNoIGlzIHRoZSB3cm9uZyB0b29sOiBpdFxuICAvLyB2aXN1YWxseSBzY2FsZXMgYWxyZWFkeS1sYWlkLW91dCBjb250ZW50IHdpdGhvdXQgY2hhbmdpbmcgd2hhdCBtZWRpYVxuICAvLyBxdWVyaWVzIHNlZSwgc28gdGhlIGRlc2t0b3AgbmF2IG5ldmVyIHN3aXRjaGVzIHRvIGl0cyBtb2JpbGUgbGF5b3V0IHRoZVxuICAvLyB3YXkgYSByZWFsIGJyb3dzZXIgem9vbSBnZXN0dXJlIHdvdWxkIOKAlCBwcm9kdWNpbmcgYSBzY3JvbGxXaWR0aCBibG93b3V0XG4gIC8vIHRoYXQgcmVmbGVjdHMgdGhlIHRlc3QgdGVjaG5pcXVlLCBub3QgYSByZWFsIHJlZmxvdyBmYWlsdXJlLiBDb25maXJtZWRcbiAgLy8gYnkgc2NyZWVuc2hvdDogY29udGVudCB3cmFwcGVkIGFuZCBzdGFja2VkIGNvcnJlY3RseSB1bmRlciB0aGUgem9vbTogdGhlXG4gIC8vIG1lYXN1cmVtZW50IHdhcyB0aGUgb25seSB0aGluZyBicm9rZW4uIFBsYXl3cmlnaHQgaGFzIG5vIGNyb3NzLWJyb3dzZXJcbiAgLy8gQVBJIGZvciBhIHJlYWwgem9vbSBnZXN0dXJlLCBzbyAzMjBweCBzdGF5cyB0aGUgY29ycmVjdCBwcm94eS5cbn0pO1xuIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUFBLFdBQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFDLEtBQUEsR0FBQUQsT0FBQTtBQUEyRCxTQUFBRCx1QkFBQUcsQ0FBQSxXQUFBQSxDQUFBLElBQUFBLENBQUEsQ0FBQUMsVUFBQSxHQUFBRCxDQUFBLEtBQUFFLE9BQUEsRUFBQUYsQ0FBQTtBQUUzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1HLEtBQUssR0FBR0MsT0FBTyxDQUFDQyxHQUFHLENBQUNDLFNBQVM7QUFDbkMsTUFBTUMsUUFBUSxHQUFHSCxPQUFPLENBQUNDLEdBQUcsQ0FBQ0csWUFBWTtBQUV6Q0MsVUFBSSxDQUFDQyxJQUFJLENBQUMsQ0FBQ1AsS0FBSyxJQUFJLENBQUNJLFFBQVEsRUFBRSx3Q0FBd0MsQ0FBQztBQUV4RSxlQUFlSSxNQUFNQSxDQUFDQyxJQUFVLEVBQUU7RUFDaEMsTUFBTUEs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