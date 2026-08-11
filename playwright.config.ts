import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = `http://localhost:${PORT}`;
const STUB_BACKEND_PORT = process.env.STUB_BACKEND_PORT ?? "4100";
const STUB_BACKEND_URL = `http://localhost:${STUB_BACKEND_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Stand-in for api.voicesradio.co.uk (see tests/e2e/stub-backend/server.mjs)
      // — never imported by application code, only started for E2E runs so
      // checkout/dashboard/benefits flows are testable without touching the
      // real backend, real Stripe, or real member data.
      command: `STUB_BACKEND_PORT=${STUB_BACKEND_PORT} STUB_BACKEND_APP_ORIGIN=${BASE_URL} node tests/e2e/stub-backend/server.mjs`,
      url: STUB_BACKEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      // Only membership/auth traffic is redirected to the stub — the
      // general Voices API (shows, blog, search) keeps hitting the real
      // backend, same as every other E2E spec already relies on.
      command: `PORT=${PORT} VOICES_MEMBERSHIP_API_BASE_URL=${STUB_BACKEND_URL} NEXT_PUBLIC_SITE_URL=${BASE_URL} npm run dev`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
