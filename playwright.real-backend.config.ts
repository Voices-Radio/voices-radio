import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/**
 * Onboarding E2E against a REAL, LOCAL voices_backend — not production, not
 * the stub. This is L4 in docs/plans/onboarding-e2e-matrix.md: it exists
 * because the stub backend (tests/e2e/stub-backend/server.mjs) is a
 * hand-written model of routes/artistInvitations.js that can drift from the
 * real thing, and because playwright.staging.config.ts *cannot* cover the
 * claim flow at all — staging.voicesradio.co.uk deliberately calls the
 * production backend (see memory: staging-never-merges-to-main), so a real
 * claim there would create a real Artist/User and elevate a real account's
 * role.
 *
 * Manual only, never CI, for the same reason playwright.staging.config.ts
 * is manual only: it mutates real state (a local one, here) and a failure can
 * mean "the backend changed" rather than "the frontend regressed".
 *
 * ── Setup ──
 *
 *   1. Start a disposable local MongoDB, e.g.:
 *        mongod --dbpath /tmp/voices-e2e-mongo --port 27191 --fork --logpath /tmp/voices-e2e-mongo.log
 *   2. Point this config at the sibling voices_backend checkout (defaults to
 *      ../voices_backend, matching the workspace layout in the root
 *      CLAUDE.md) and at a database whose name ends `_e2e`:
 *        VOICES_BACKEND_DIR=/path/to/voices_backend \
 *        E2E_MONGODB_URI=mongodb://127.0.0.1:27191/onboarding_e2e \
 *          npx playwright test --config playwright.real-backend.config.ts
 *
 * ── Safety ──
 *
 * `assertLocalE2eUri` below is the frontend-side twin of
 * scripts/e2e/seedOnboarding.js's assertLocalE2eDatabase — the same
 * local-only, `_e2e`-suffixed check, independently enforced on this side of
 * the repo boundary since the backend's guard cannot see what this config is
 * about to pass it.
 *
 * The backend process is started with RADIOCULT_SECRET_KEY and every
 * EMAIL_* var explicitly blanked in `env` below. Node's `dotenv.config()`
 * (which server.js calls on startup) never overwrites a variable already
 * present in the environment, so this wins over whatever real credentials
 * happen to be sitting in the backend's own .env — without this, a claim run
 * here would silently create live artists in RadioCult. Nothing in the claim
 * flow itself sends email (I5 in the plan), so blanking EMAIL_* costs this
 * suite nothing; RadioCult push is best-effort by contract
 * (pushArtistToRadioCult) and fails closed into `pending_review` with no
 * outward call, which is exactly the state this suite asserts against.
 */

const PORT = process.env.E2E_PORT ?? "3200";
const BASE_URL = `http://localhost:${PORT}`;
const BACKEND_PORT = process.env.REAL_BACKEND_PORT ?? "4200";
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const BACKEND_DIR = path.resolve(
  process.env.VOICES_BACKEND_DIR ?? path.join(__dirname, "..", "voices_backend"),
);

const MONGODB_URI = process.env.E2E_MONGODB_URI;

function assertLocalE2eUri(uri: string | undefined): asserts uri is string {
  if (!uri) {
    throw new Error(
      "E2E_MONGODB_URI must be set — a local MongoDB URI whose database name ends in _e2e. " +
        "This config refuses to run without it rather than fall back to any default.",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error(`E2E_MONGODB_URI is not a valid URI: ${uri}`);
  }
  const database = parsed.pathname.replace(/^\//, "");
  const localHosts = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
  if (parsed.protocol !== "mongodb:" || !localHosts.has(parsed.hostname) || !/_e2e$/.test(database)) {
    throw new Error(
      `Refusing to run against ${parsed.protocol}//${parsed.hostname}/${database}: ` +
        "E2E_MONGODB_URI must be a local mongodb:// URI naming a database that ends in _e2e.",
    );
  }
}

assertLocalE2eUri(MONGODB_URI);

export default defineConfig({
  testDir: "./tests/e2e-real",
  fullyParallel: false, // one shared local database; parallel runs corrupt each other
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { outputFolder: "playwright-report-real-backend", open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node server.js",
      cwd: BACKEND_DIR,
      url: `${BACKEND_URL}/api/health`,
      reuseExistingServer: false, // a real backend already running is almost certainly pointed at production data
      timeout: 30_000,
      env: {
        PORT: BACKEND_PORT,
        MONGODB_URI,
        NODE_ENV: "test",
        FRONTEND_URL: BASE_URL,
        ARTIST_CLAIM_BASE_URL: BASE_URL,
        // See "Safety" above — these two lines are load-bearing.
        RADIOCULT_SECRET_KEY: "",
        EMAIL_HOST: "",
        EMAIL_USER: "",
        EMAIL_PASSWORD: "",
      },
    },
    {
      command: `PORT=${PORT} VOICES_MEMBERSHIP_API_BASE_URL=${BACKEND_URL} VOICES_API_BASE_URL=${BACKEND_URL} NEXT_PUBLIC_SITE_URL=${BASE_URL} npm run dev`,
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
