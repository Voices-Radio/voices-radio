# Voices Radio Membership — Backend API Contract (frontend requirements)

> Companion to [`voices-membership-frontend-implementation-brief.md`](./voices-membership-frontend-implementation-brief.md).
> **Status: implemented.** Every `TODO(backend)` below has been resolved and built against — see the "Resolved decisions" note under each section and the final summary. The backend now matches this document; where a decision required a real tradeoff (not just a confirmation), the reasoning is inline so it can be revisited if wrong.
>
> The frontend proxies all of this through Next.js route handlers (a BFF) — the browser never calls `api.voicesradio.co.uk` directly, and never sees a raw JWT. See `lib/voices/membership/session.ts` for the proxy implementation.
>
> ⚠️ **Deployment gap found 2026-08-11**: the frontend (Phases 4–7) is fully built and tested against this contract — see 163 unit tests / 28 E2E tests, all passing against a stub backend that mirrors this document exactly. But `https://api.voicesradio.co.uk` does not yet serve it in production:
> ```
> GET /api/auth/validate       -> 401 {"valid":false,...}        (pre-existing, live, as expected)
> GET /api/membership/tiers    -> 404 {"message":"Route not found"}
> GET /api/membership/me       -> 404 {"message":"Route not found"}
> ```
> So either these routes are only live on a different host (staging?) that isn't documented here, or the deploy to production is still pending. Until one of those is resolved, no real end-to-end run against the live backend is possible — only the stub-backed proof. Please confirm which it is and update this note.
>
> ⚠️ **Update 2026-08-11, later same day**: backend team pushed commit `469b90a` to `main`, expecting Vercel's GitHub integration to auto-deploy it. Re-checked `https://api.voicesradio.co.uk` after the push (two checks, several seconds apart, same result) — every route now returns a 500, **including the previously-working `/api/auth/validate`**:
> ```
> GET /api/auth/validate       -> 500 FUNCTION_INVOCATION_FAILED
> GET /api/membership/tiers    -> 500 FUNCTION_INVOCATION_FAILED
> GET /api/membership/me       -> 500 FUNCTION_INVOCATION_FAILED
> GET /api/membership/benefits -> 500 FUNCTION_INVOCATION_FAILED
> ```
> This reads as a bootstrap/import-time crash in the new commit (missing env var, throwing top-level import, DB client construction, etc.) rather than a still-propagating deploy — the build itself likely succeeded since Vercel is serving its runtime-error page, not a build-failure page. It's a regression: auth validation worked fine (401) before this push and is now broken for everyone, not just membership. Needs the Vercel function logs for `469b90a` to diagnose. No staging URL is documented for the backend, so this could not be re-checked against a separate staging host.
>
> ✅ **Update 2026-08-11, re-checked**: the 500s are gone. Re-probed every route above plus `POST /api/membership/checkout` and `GET /api/membership/profile` (with a deliberately bogus bearer token) — every route now returns correct, contract-shaped responses: `401`s with the right error codes for unauthenticated/invalid-token requests, and `200 {"tiers":[]}` for the public tiers endpoint. Auth enforcement and error envelopes look right across the board.
>
> ⚠️ **Remaining blocker**: `GET /api/membership/tiers` returns an **empty catalogue** (`{"tiers":[]}`) — not a bug, just no tier data entered yet in this environment. `/join` will correctly show the "pricing unavailable" state (as designed) until tiers are seeded. Full E2E against the real backend (register → checkout → complete → account → manage → redeem) is still blocked on: (1) tiers being populated, (2) Stripe test-mode keys being added, (3) a real test account to sign in with — auth-gated routes can't be meaningfully checked with a bogus token beyond confirming the 401 path.

## 0. Conventions

- Base URL: `VOICES_API_BASE_URL` (currently `https://api.voicesradio.co.uk`, see `lib/voices/config.ts`).
- **Resolved**: all membership endpoints live under `/api/membership/*`, exactly as assumed. Admin/operator endpoints (not called by the frontend) live separately under `/api/admin/membership/*`.
- All authenticated endpoints take `Authorization: Bearer <access_token>`, consistent with the existing auth endpoints documented in `docs/VOICES_RADIO_API_DOCUMENTATION.md`.
- **Resolved**: all money values are integer minor units (pence) + an explicit `currency` (`"gbp"`), as assumed.
- **Resolved**: the error envelope is built exactly as assumed — every error response is `{ error: { code, message } }`. See `utils/apiError.js` for the full code list (a superset of what's referenced per-endpoint below, e.g. `NO_ACTIVE_MEMBERSHIP`, `PRICE_UNAVAILABLE`, `ALREADY_ON_TIER`, `MEMBERSHIP_LAPSED`, `INVALID_REDIRECT_URL`).

```jsonc
{
  "error": {
    "code": "CAPACITY_FULL", // stable, machine-readable, SCREAMING_SNAKE_CASE
    "message": "This event has reached capacity." // human string, safe to show as fallback
  }
}
```

---

## 1. Auth reconciliation

The existing `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/validate` endpoints (documented already) were built for the mobile app. The web frontend will call these through a server-side proxy (httpOnly cookies), so:

- **Resolved — CORS**: server-to-server calls from the BFF carry no browser `Origin` header, so the membership routes' origin allowlist (`membershipCors` in `server.js`) passes them through automatically — no extra config needed on the BFF's behalf. Caveat worth knowing about, not a frontend concern: `vercel.json` currently sets `Access-Control-Allow-Origin: *` at the edge for every `/api/*` route, ahead of Express — so a *browser calling the API directly* (bypassing the BFF) would not actually be blocked by that allowlist today. Doesn't affect the BFF path; flagging so it isn't assumed to be a hard boundary if that assumption ever matters.
- **Resolved — email verification does NOT block checkout.** An unverified member can complete payment; verification remains a separate, non-blocking step. Chosen to keep the signup→payment path short, per the brief.
- **Resolved — Apple Sign-In**: the existing `/api/auth/apple-*` endpoints are provider-agnostic (not mobile-specific) and work as-is for web membership signup. No membership-specific work was needed.

---

## 2. Tiers & pricing — `GET /api/membership/tiers`

Returns the four launch tiers. This is presentation data (name, description) plus **authoritative price** — the number actually charged, which the frontend reconciles against Sanity CMS copy (Sanity is copy-only; this endpoint is the source of truth for money).

```jsonc
{
  "tiers": [
    {
      "id": "supporter",
      "name": "Supporter",
      "monthlyPriceMinor": 400,
      "annualPriceMinor": 4000,
      "currency": "gbp",
      "mostPopular": false,
      "sortOrder": 1
    },
    {
      "id": "member",
      "name": "Member",
      "monthlyPriceMinor": 800,
      "annualPriceMinor": 8000,
      "currency": "gbp",
      "mostPopular": true,
      "sortOrder": 2
    }
    // insider (£15/£150), patron (£30/£300)
  ]
}
```

**Resolved**: tier `id` slugs are exactly `supporter` / `member` / `insider` / `patron`, immutable at the model level (`models/Tier.js` marks `key` as `immutable: true` once created) — they cannot change post-launch without a deliberate migration.

---

## 3. Checkout — `POST /api/membership/checkout`

Request:

```jsonc
{
  "tierId": "member",
  "cadence": "monthly", // "monthly" | "annual"
  "successUrl": "https://voicesradio.co.uk/join/complete",
  "cancelUrl": "https://voicesradio.co.uk/join"
}
```

Response:

```jsonc
{ "checkoutUrl": "https://checkout.stripe.com/...", "sessionId": "cs_..." }
```

- **Resolved — Idempotency**: send an `Idempotency-Key` header. It's passed through as Stripe's own native `idempotencyKey` request option on `checkout.sessions.create` (scoped `checkout:{userId}:{key}`), so Stripe itself dedupes a retried request into the same Checkout Session rather than us reimplementing that logic. The same header is honoured (via `middleware/idempotency.js`, a short-lived response-replay cache) on `/upgrade`, `/downgrade`, `/change-cadence`, `/cancel`, `/resume` too — send it on all mutating calls.
- **Resolved**: Stripe does *not* append `session_id` automatically. The backend appends `?session_id={CHECKOUT_SESSION_ID}` to whatever `successUrl` you send (unless you've already included the template yourself) — `/join/complete` can rely on `?session_id=...` always being present.
- **Resolved — account-before-payment**, kept as originally planned: create account → checkout. Not changed.
- **New, not previously specified**: `successUrl`/`cancelUrl` are validated against an origin allowlist (`MEMBERSHIP_ALLOWED_ORIGINS` env var) — an arbitrary redirect URL is rejected with `INVALID_REDIRECT_URL` (400). Make sure `voicesradio.co.uk` (and any preview/staging domains) are in that list, or checkout will 400.

---

## 4. Membership state — `GET /api/membership/me`

The single source of truth the dashboard and `/account/membership` render from. Needs to express every state in the brief:

```jsonc
{
  "status": "active", // see enum below
  "tierId": "member",
  "cadence": "annual",
  "priceMinor": 8000,
  "currency": "gbp",
  "renewsAt": "2027-09-05T00:00:00Z",
  "paidThroughAt": "2027-09-05T00:00:00Z",
  "scheduledChange": null, // or { "type": "downgrade", "toTierId": "supporter", "effectiveAt": "..." }
  "isFoundingMember": true,
  "paymentIssue": null // or { "code": "CARD_DECLINED", "gracePeriodEndsAt": "..." }
}
```

**Resolved — status enum**:

| Value | Brief's term | Notes |
|---|---|---|
| `active` | Active | |
| `cancelling` | Cancelling / active until date | |
| `grace` | Payment grace period | `paymentIssue` is populated |
| `complimentary` | Complimentary membership | admin-granted, no Stripe subscription |
| `expired` | Expired/cancelled | covers both internal `cancelled` and `expired` states — no UI-relevant distinction between them |
| `pending_reconciliation` | Payment succeeded, reconciliation pending | see below |
| `null` (not a string) | *(new — not in the brief's enum)* | no Membership exists at all: this user never checked out. Render as "not a member yet", distinct from `expired` ("was a member, isn't now"). |

**Resolved — `scheduled_downgrade` is NOT a distinct status.** It's always `status: "active"` (or `"cancelling"`) + a populated `scheduledChange: { type, toTierId, effectiveAt }`. Check `scheduledChange !== null`, not a status string.

**Resolved — `pending_reconciliation` is real and implemented**: the Membership row is now created *eagerly*, at checkout-session creation, in an `incomplete` state — not first-created by the webhook. `GET /api/membership/me` maps `incomplete` → `pending_reconciliation` from the moment `/checkout` is called, closing the gap where a fast poll right after the Stripe redirect could otherwise see nothing at all.

---

## 5. Membership changes

All of these need a **preview** step, because the brief requires showing the financial/date consequence before the member confirms:

- `POST /api/membership/preview-change` — body `{ "action": "upgrade" | "downgrade" | "change_cadence" | "cancel", "toTierId"?, "toCadence"? }` → returns `{ "effectiveAt", "priceMinor", "proratedAmountMinor"?, "description" }`.
- `POST /api/membership/upgrade` — body `{ "toTierId" }`. Immediate. Response: `{ applied: "immediate", tierId, cadence, scheduledChange: null, unlockedBenefits: [...] }` — `unlockedBenefits` is the full `GET /benefits`-shaped array, computed fresh post-upgrade, so the success screen can render it without a second round trip.
- `POST /api/membership/downgrade` — body `{ "toTierId" }`. Scheduled for next renewal; current tier's benefits remain until then. Response: `{ applied: "scheduled", tierId (unchanged today), cadence, scheduledChange: { type: "downgrade", toTierId, effectiveAt } }`.
- `POST /api/membership/change-cadence` — body `{ "toCadence" }`. Same scheduled shape as downgrade, `scheduledChange.type: "change_cadence"`.
- `POST /api/membership/cancel` — body may include a `reason`. Response: `{ status: "cancelling", paidThroughAt }`.
- `POST /api/membership/resume` — only valid while `status === "cancelling"` and the paid-through date hasn't passed (`MEMBERSHIP_LAPSED` error if it has). Response: `{ status: "active" }`.
- **Resolved — payment-method update**: hosted, via `POST /api/membership/portal-session` (body: `{ returnUrl? }` → `{ url }`, a Stripe Customer Portal deep link). Chosen over a dedicated client-secret/embedded-form endpoint specifically to keep zero PCI scope on our side and inherit Stripe's own SCA/3DS handling — `/account/membership`'s "manage payment" action should be a redirect, not an embedded form.

**Resolved — idempotency under double-submit**: send an `Idempotency-Key` header on every mutating call in this section (`upgrade`, `downgrade`, `change-cadence`, `cancel`, `resume`). A resubmit with the same key within ~10 minutes replays the original response rather than re-running the handler — see `middleware/idempotency.js`. This is a UI-resubmit protection (short-lived, in-memory), separate from the redemption endpoint's durable idempotency (a permanent DB constraint) — the underlying state-machine guards (e.g. "no active membership to change") are still the backstop if a key is reused after the window expires.

---

## 6. Entitlements — `GET /api/membership/benefits`

Server-authoritative per-member benefit list. The frontend renders **only** what this returns — never infers entitlement from the tier held in client state.

```jsonc
{
  "benefits": [
    {
      "id": "shop-discount",
      "slug": "shop-discount",
      "name": "10% off Voices merch",
      "state": "available", // see enum below
      "capacityRemaining": null, // null = uncapped; number = capacity-limited
      "action": "show_code", // "show_code" | "claim" | "enter_ballot" | "submit" | "book" | "view_offer" | null
      "availableFrom": null, // ISO date, for "not yet available"
      "expiresAt": null
    }
  ]
}
```

**State enum** (all nine from the brief): `available`, `claimed`, `used`, `expired`, `not_yet_available`, `capacity_full`, `ineligible`, `requires_action`, `ballot_entered`.

**Resolved — capacity-limited "apply" benefits**: no separate submission endpoint; `requires_action` and `ballot_entered` are their own states within this same benefit, transitioned by the *same* `POST /benefits/{id}/redeem` call. Specifically, for ballot-style benefits (`studio_ballot` type — studio sessions, Open Decks/Supporter Radio-style lotteries): `requires_action` before the member has submitted an entry, `ballot_entered` after — deliberately never `available`/`claimed`, so the copy can never imply guaranteed admission. Non-lottery capacity benefits (`event_presale` — a first-come booking window, not a draw) use the ordinary `available` → `claimed` → `capacity_full` progression instead, since there's no admission uncertainty to signal. This mapping is implemented in `services/EntitlementService.js`'s `ACTION_BY_TYPE`/`resolveState` — genuinely a first-pass interpretation of the brief, not a certainty; worth a quick look from whoever owns the ballot UX copy.

---

## 7. Redemption — `POST /api/membership/benefits/{id}/redeem`

Request includes a client-generated idempotency key:

```jsonc
{ "idempotencyKey": "uuid-v4" }
```

Response is either the updated benefit (now `claimed`/`used`) or a structured error using the codes the frontend needs to give distinct copy for:

`ALREADY_REDEEMED`, `CAPACITY_FULL`, `EXPIRED`, `INELIGIBLE`, `RACE_LOST` (lost a capacity race to another member).

**Resolved — idempotency key replay, with a real distinction worth knowing about**: the *same* `idempotencyKey` replayed always returns the original result, never an error (backed by a durable unique DB index on `{userId, idempotencyKey}`, not the short-lived cache used elsewhere) — this is what makes brief test #12 deterministic. A genuinely *different* key against an already-consumed single-use benefit is treated as a **new** attempt and correctly rejected with `ALREADY_REDEEMED` — replay-safety was never meant to mean "unlimited free redemptions via a new key each time."

`CAPACITY_FULL` vs `RACE_LOST` are genuinely distinguished server-side (not both collapsed to one code): `CAPACITY_FULL` means the benefit was already full before this request started; `RACE_LOST` means it was open when checked but lost the atomic race to a concurrent redeemer in the same instant — different frontend copy is warranted ("this is gone" vs "so close — try the next one").

---

## 8. Redemption history — `GET /api/membership/redemptions`

```jsonc
{
  "redemptions": [
    {
      "benefitName": "Studio session ballot",
      "status": "used",
      "claimedAt": "...",
      "usedAt": "...",
      "expiresAt": "...",
      "instructions": "...",
      "code": "VOICES-XXXX", // short, member-facing — NOT an internal redemption ID
      "terms": "..."
    }
  ]
}
```

**Resolved**: `code` is always a generated `VOICES-XXXXXX` string (6 hex chars), never the internal Mongo `_id` — generated at redemption time for *every* redemption model (not just partner-code ones), so this field is always populated.

---

## 9. Profile & recognition

- `GET/PATCH /api/membership/profile` — body/response: `{ displayName, supporterWallOptIn, marketingConsent, address }`. `supporterWallOptIn` and `marketingConsent` are independently controlled (brief test #16) — each only writes a consent-history record when it actually changes, and neither touches the other. `address` is never required; sending it just stores it, nothing enforces it must be present.
- **Resolved**: the backend tells the frontend when to ask, via `requiresAddress: boolean` on each entry in `GET /api/membership/benefits` (section 6) — a benefit needing physical fulfilment sets it, everything else omits/false. Prompt for address only when the member is about to redeem a benefit with `requiresAddress: true`.

---

## 10. Reconciliation after redirect from Stripe

The frontend's `/join/complete` page lands here immediately after Stripe redirects back, which can be **before your webhook has processed the payment**. Frontend will poll `GET /api/membership/me` for up to ~15s waiting for `status` to leave `pending_reconciliation`.

**Resolved**: `pending_reconciliation` is exactly that state (see section 4), and polling is the implemented strategy — no websocket/SSE push exists or is planned. One clarification: the Membership row (and therefore `pending_reconciliation`) exists from the moment `/checkout` is called, not from Stripe's redirect — so polling can safely start immediately after `/checkout` returns, not only after landing on `/join/complete`.

---

## 11. Founding member cohort

**Resolved**: `isFoundingMember` is true for the first 250 memberships to record a **successful first payment** (any tier, either cadence). Complimentary and admin-granted memberships are explicitly excluded from the count. The badge is permanent — it is never revoked if the member later cancels or churns. Allocation is atomic under concurrency (an atomic capped counter increment, not a count-then-write) and capped at exactly 250 regardless of how many payments land simultaneously — see `services/FoundingMemberService.js`. The frontend just renders the boolean, as assumed; badge copy is CMS-driven, as assumed.

---

## Resolved decisions summary (for quick reference)

All fifteen were open questions when this document was written; all are now implemented and confirmed:

1. **CORS**: no action needed for the BFF's server-to-server calls (no browser `Origin` header sent). Direct browser calls to the API are a separate, lower-priority gap — see section 1.
2. Email verification does **not** block checkout.
3. Path prefix is `/api/membership/*` as assumed; error envelope is `{ error: { code, message } }` as assumed.
4. Tier `id` slugs confirmed and made immutable at the model level.
5. Idempotency: `Idempotency-Key` header on checkout (passed to Stripe natively) and on every membership-change endpoint (10-minute response replay).
6. Stripe does not auto-append `session_id` — the backend does it for you.
7. Kept as account-before-checkout; not changed.
8. Status enum confirmed, with one addition (`status: null` for "never subscribed") and `scheduled_downgrade` confirmed as *not* a distinct status.
9. Payment-method update is a hosted Stripe Customer Portal session (`POST /api/membership/portal-session`).
10. Capacity-limited ballot benefits use `requires_action`/`ballot_entered` on the same redeem endpoint, not a separate submission flow — first-pass interpretation, worth a copy-owner sanity check.
11. Idempotency-key replay confirmed, with the "different key vs already-consumed" distinction made explicit.
12. Redemption `code` confirmed always member-facing, generated, never an internal ID.
13. Postal address timing is signalled via `requiresAddress` on each benefit.
14. Reconciliation is polling-based, and the pollable state exists from checkout-session creation, not from the Stripe redirect.
15. Founding-member cohort: first 250 successful first payments, permanent, excludes comps/admin grants, concurrency-safe.

One thing found during implementation that wasn't a question in this document: the upgrade endpoint's response now includes `unlockedBenefits` (the full post-upgrade benefit list), matching section 5's "show these immediately on success" requirement — flagging since it wasn't in the original request/response examples above.

---

## 🔴 Bug found during FE E2E — 2026-08-12: every scheduled change 500s after an immediate upgrade overtakes one

**Update, same day**: broader than first scoped — this isn't downgrade-specific. `change-cadence` fails identically:

```
POST /api/membership/downgrade      {"toTierId":"insider"}   (adjacent tier)
POST /api/membership/downgrade      {"toTierId":"supporter"} (skip-tier)
POST /api/membership/change-cadence {"toCadence":"annual"}
→ all three: 500 {"error":{"code":"INTERNAL","message":"Failed to <downgrade|change cadence>"}}
```

**Reproduced live** against `jonslow4@gmail.com` (Stripe test mode), both via the real `/account/membership` UI and directly against the API. Not tier- or action-specific — adjacent-tier downgrade, skip-tier downgrade, and cadence change all fail identically from the account's current tier (Patron). `preview-change` succeeds (200) for all three; only the confirm step 500s. The account can currently *preview* any scheduled change but never complete one — immediate upgrades are the only mutation still working on it.

This matches the root-cause hypothesis below exactly: both `/downgrade` and `/change-cadence` route through the same scheduled branch of `applyChange` (`services/MembershipChangeService.js:121-171`), so anything reaching that branch hits the same orphaned-schedule collision.

**✅ Fixed — 2026-08-12, `d11e2a4`.** Re-verified live against the same account, same two endpoints:

```
POST /api/membership/change-cadence {"toCadence":"annual"}
→ 200 {"applied":"scheduled","scheduledChange":{"type":"change_cadence", ..., "stripeScheduleId":"sub_sched_1U3cryGcvYl5L8Letz8lew5S"}}

POST /api/membership/downgrade {"toTierId":"insider"}
→ 200 {"applied":"scheduled","scheduledChange":{"type":"downgrade", ..., "stripeScheduleId":"sub_sched_1U3cryGcvYl5L8Letz8lew5S"}}
```

Both succeed, and — worth noting — the second call reused the *same* `stripeScheduleId` rather than erroring, which is exactly the "member changes their mind about the target, replace the existing schedule's phase" path the original code comment described. That path now works too, not just the create-fresh path. Full state-matrix suite re-run below.

**Sequence that produced it**, all against the same account, in order:
1. Checkout → active/supporter (immediate).
2. Upgrade → member (immediate).
3. Downgrade → supporter, scheduled — `MembershipChangeService.applyChange`'s scheduled branch creates a Stripe Subscription Schedule ("schedule A").
4. Cancel while that downgrade was pending — correctly releases schedule A (`changes.js:159-162`) before setting `cancel_at_period_end`. This step is fine, and is the "cancelling wins" regression you fixed on the 11th — confirmed still correct.
5. Resume — clean, only touches `cancel_at_period_end`.
6. Switch to annual billing, scheduled — creates a fresh Stripe schedule ("schedule B"), correctly, since step 4 had cleared `scheduledChange` in Mongo.
7. **Upgrade → insider (immediate)**, with schedule B still attached and un-released.

**Root-cause hypothesis** (code-level, not confirmed against your Stripe dashboard — flagging confidence honestly): the *immediate* branch of `applyChange` (`services/MembershipChangeService.js:100-118`) calls `stripe.subscriptions.update()` directly and sets `membership.scheduledChange = null` (line 113), but — unlike `cancel` (`routes/membership/changes.js:159-160`) — never calls `stripe.subscriptionSchedules.release()` first. If a schedule is attached when an immediate upgrade happens, Mongo forgets about it (`scheduledChange` is now `null`) while Stripe still has it attached. The next scheduled-change attempt takes the `else` branch at `MembershipChangeService.js:129-131`, sees no `stripeScheduleId` on the Mongo doc, and calls `subscriptionSchedules.create({ from_subscription: ... })` — which is exactly the rejection the comment on lines 122-128 already anticipated for a *different* trigger ("attempting create() while one already exists"), just reached via this path instead of the one it was written to guard against.

If right, the fix is symmetric with `cancel`'s: release any attached schedule (`membership.scheduledChange?.stripeScheduleId`) as part of the immediate-upgrade branch, before nulling the field.

**Impact**: any member who schedules a downgrade or cadence change, then changes their mind and upgrades immediately instead (a plausible real flow, not an edge case), permanently loses the ability to schedule *any* future downgrade or cadence change — every attempt 500s. Worth checking whether `jonslow4@gmail.com` is the only account currently in this state or whether it's been hit elsewhere.

---

## 🟡 Frontend finding — 2026-08-12: live-player-bar contrast, out of scope for this branch

`axe` (`tests/staging/accessibility.spec.ts`, `/account` scan) flagged a marginal AA contrast failure on the persistent live-player bar rendered on every page, including the homepage:

```
color-contrast: #756f6b on #f8efe0 → 4.34:1 (needs 4.5:1 for normal text)
```

Not caused by, or fixable within, the membership work on `staging/redesign-preview` — the player bar is a shared, site-wide component untouched by any file in Phases 4–7, and the same contrast ratio is present on pages with no membership content at all (confirmed on `/`). It's a real, pre-existing AA violation (fails by a small margin — 0.16 short of threshold), not a false positive like the earlier zoom-reflow test artifact.

**Not fixed here** — flagging for its own ticket rather than bundling an unrelated visual change into this branch. Likely the same class of fix as `voicesNext.orangeText` in `tailwind.config.js`: darken/lighten one of the two tokens by a small, hue-preserved amount until it clears 4.5:1, then audit for other places `#756f6b`-on-`#f8efe0` (or equivalent token pairing) is reused.

**Not fixed here** — this is `voices_backend`, out of scope for the frontend branch this session is testing. Frontend behavior is correct throughout: the confirm-dialog UI surfaced the backend's own error text (`"Failed to downgrade"`) rather than masking it, which is exactly what the error-envelope work from earlier today was for.
