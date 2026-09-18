@AGENTS.md

## Environments
- Production: www.voicesradio.co.uk. Staging: staging.voicesradio.co.uk, which sits behind basic auth (`ENABLE_STAGING_AUTH`, `STAGING_AUTH_USER`, `STAGING_PASSWORD`; see `middleware.ts`).
- Staging E2E against the real backend: `npx playwright test --config playwright.staging.config.ts` (needs the staging auth env vars).
- Backend data comes from the voices_backend API via `VOICES_API_BASE_URL` (client: `lib/voices/api.ts`). If a change needs new API data, the endpoint change belongs in voices_backend.

Also skip: `playwright-transform-cache-*/`, `playwright-report/`, `node-compile-cache/`, `artifacts/`.
