import { defineConfig, devices } from "@playwright/test";

/**
 * Real-backend E2E against staging.voicesradio.co.uk.
 *
 * Deliberately separate from playwright.config.ts, which runs the deterministic
 * suite against the local stub backend. This config talks to the live API and
 * Stripe test mode, so it is manual-only and never part of CI: state is shared,
 * runs are not repeatable, and a failure here can mean "the backend changed"
 * rather than "the frontend regressed".
 *
 * Credentials come from the environment, never from source:
 *   STAGING_AUTH_USER=voices STAGING_PASSWORD=... \
 *     npx playwright test --config playwright.staging.config.ts
 */
const BASE_URL = process.env.STAGING_BASE_URL ?? "https://staging.voicesradio.co.uk";

const username = process.env.STAGING_AUTH_USER;
const password = process.env.STAGING_PASSWORD;

if (!username || !password) {
  throw new Error(
    "STAGING_AUTH_USER and STAGING_PASSWORD must be set — staging sits behind basic auth.",
  );
}

export default defineConfig({
  testDir: "./tests/staging",
  fullyParallel: false, // shared live account state; parallel runs corrupt each other
  workers: 1,
  retries: 0, // a retry would re-run a real payment
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { outputFolder: "playwright-report-staging", open: "never" }]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    httpCredentials: { username, password },
    trace: "on",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
