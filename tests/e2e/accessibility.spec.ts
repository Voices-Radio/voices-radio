import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/support", "/join", "/sign-in", "/join/create-account"];

for (const path of pages) {
  test(`${path} has no automatically-detectable serious/critical a11y violations`, async ({
    page,
  }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();

    const seriousOrWorse = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );

    expect(
      seriousOrWorse,
      seriousOrWorse
        .map((v) => `${v.id}: ${v.description}\n  ${v.helpUrl}`)
        .join("\n"),
    ).toEqual([]);
  });
}
