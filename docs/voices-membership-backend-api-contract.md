# Voices Radio Membership — Backend API Contract (frontend requirements)

> Companion to [`voices-membership-frontend-implementation-brief.md`](./voices-membership-frontend-implementation-brief.md).
> **Status: implemented, revised for the sliding-scale change.** Every `TODO(backend)` below has been resolved and built against — see the "Resolved decisions" note under each section and the final summary. The backend now matches this document; where a decision required a real tradeoff (not just a confirmation), the reasoning is inline so it can be revisited if wrong.
>
> **2026-09 revision — sliding scale replaces the four named tiers.** Membership is now a single contribution: £3.99–£15.99/month in £1 steps (default £5.99), or a single fixed £40.99/year. There is no `tierId`/`tierKey` anywhere in this contract anymore — every endpoint that referenced one now takes/returns `amountMinor` (checkout, changes) or `contributionAmountMinor` (state). `GET /api/membership/tiers` is renamed to `GET /api/membership/plans` (no deprecation alias — both repos deploy together). Benefits are flat: any live membership qualifies for every active benefit, so `GET /api/membership/benefits` no longer varies by amount. See `docs/plans/sliding-scale-membership.md` for the full rationale and impact analysis. Sections below are updated in place; historical tier language has been removed rather than struck through, since there are no live members to preserve continuity for (pre-launch).
>
> The frontend proxies all of this through Next.js route handlers (a BFF) — the browser never calls `api.voicesradio.co.uk` directly, and never sees a raw JWT. See `lib/voices/membership/session.ts` for the proxy implementation.

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

## 2. The sliding scale — `GET /api/membership/plans`

Returns the monthly scale (every currently valid amount, £3.99–£15.99) and the single fixed annual price. This is **authoritative price** — the numbers actually charged, resolved from our own `PriceVersion` collection, never from Sanity (Sanity is copy-only). The annual discount is derived server-side from the live prices, floored, and included so the frontend never computes or hardcodes it itself.

```jsonc
{
  "scale": {
    "minMinor": 399,
    "maxMinor": 1599,
    "defaultMinor": 599,
    "currency": "gbp",
    "points": [
      { "amountMinor": 399, "priceVersionId": "..." },
      { "amountMinor": 499, "priceVersionId": "..." }
      // ... £1 steps up to 1599
    ]
  },
  "annual": {
    "amountMinor": 4099,
    "currency": "gbp",
    "priceVersionId": "...",
    "comparedToMonthlyMinor": 4788, // cheapest active monthly price × 12
    "savingMinor": 689,
    "discountPercent": 14 // floor()'d — never rounds up, never overstates the saving
  }
}
```

**Resolved**: every `amountMinor` accepted anywhere in this contract (checkout, upgrade, downgrade) must be one of the `points[].amountMinor` values returned here for the relevant cadence, or the fixed `annual.amountMinor` — the backend validates every amount server-side against the active `PriceVersion` catalogue regardless of what this endpoint last returned, so a stale client-side copy of the scale can never be exploited to charge an unavailable amount.

**Resolved**: `annual` is `null` if no annual price is currently active — the frontend should hide the annual toggle entirely in that case, not show a broken price.

---

## 2a. What replaced tiers

There is no tier ladder. A member's benefits do not depend on how much they contribute — see section 6. The only two axes are **amount** (the monthly scale point, or the fixed annual price) and **cadence** (`monthly` | `annual`). Every place the old contract took a `tierId`/`toTierId` now takes `amountMinor`/`toAmountMinor`; every place it returned a `tierId` now returns `contributionAmountMinor`.

---

## 3. Checkout — `POST /api/membership/checkout`

Request:

```jsonc
{
  "amountMinor": 799, // must be a valid scale point (monthly) or the fixed annual price
  "cadence": "monthly", // "monthly" | "annual"
  "successUrl": "https://voicesradio.co.uk/join/complete",
  "cancelUrl": "https://voicesradio.co.uk/join"
}
```

**Resolved — the amount allowlist (security-relevant)**: `amountMinor` arrives from the browser via the slider, so it is validated twice before it can ever reach Stripe: first against the fixed scale shape (`utils/membershipScale.js`'s `isValidAmount()` — off-step or out-of-range amounts are rejected with `VALIDATION_FAILED` before any DB call), then by resolving an **active** `PriceVersion` for that exact `(cadence, amountMinor)` pair (`PRICE_UNAVAILABLE` if none exists). There is no code path that constructs a Stripe `price_data` object from the request — checkout only ever uses a `stripePriceId` already sitting on a pre-seeded `PriceVersion`. See `docs/plans/sliding-scale-membership.md` R1.

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
  "contributionAmountMinor": 4099,
  "cadence": "annual",
  "priceMinor": 4099,
  "currency": "gbp",
  "renewsAt": "2027-09-05T00:00:00Z",
  "paidThroughAt": "2027-09-05T00:00:00Z",
  "scheduledChange": null, // or { "type": "downgrade", "toAmountMinor": 799, "toCadence": "monthly", "effectiveAt": "..." }
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

**Resolved — `scheduled_downgrade` is NOT a distinct status.** It's always `status: "active"` (or `"cancelling"`) + a populated `scheduledChange: { type, toAmountMinor, toCadence, effectiveAt }`. Check `scheduledChange !== null`, not a status string.

**Resolved — `pending_reconciliation` is real and implemented**: the Membership row is now created *eagerly*, at checkout-session creation, in an `incomplete` state — not first-created by the webhook. `GET /api/membership/me` maps `incomplete` → `pending_reconciliation` from the moment `/checkout` is called, closing the gap where a fast poll right after the Stripe redirect could otherwise see nothing at all.

---

## 5. Membership changes

All of these need a **preview** step, because the brief requires showing the financial/date consequence before the member confirms. "Upgrade" now means "increase your contribution amount" and "downgrade" means "decrease" it — there is no tier ladder, just amount comparison at the same cadence.

- `POST /api/membership/preview-change` — body `{ "action": "upgrade" | "downgrade" | "change_cadence" | "cancel", "toAmountMinor"?, "toCadence"? }` → returns `{ "effectiveAt", "priceMinor", "proratedAmountMinor"?, "description" }`. For `change_cadence`, `toAmountMinor` is optional (see `/change-cadence` below for how the target amount resolves).
- `POST /api/membership/upgrade` — body `{ "toAmountMinor" }`, must be a valid scale point strictly higher than the member's current amount. Immediate. Response: `{ applied: "immediate", contributionAmountMinor, cadence, scheduledChange: null, unlockedBenefits: [...] }` — `unlockedBenefits` is the full `GET /benefits`-shaped array (unaffected by the amount change now that benefits are flat — see section 6 — but still returned for a consistent response shape and so a future non-flat benefit doesn't need a contract change).
- `POST /api/membership/downgrade` — body `{ "toAmountMinor" }`, must be a valid scale point strictly lower than the current amount. Scheduled for next renewal; current access (including benefits) remains until then. Response: `{ applied: "scheduled", contributionAmountMinor (unchanged today), cadence, scheduledChange: { type: "downgrade", toAmountMinor, effectiveAt } }`.
- `POST /api/membership/change-cadence` — body `{ "toCadence", "toAmountMinor"? }`. Monthly and annual are not two prices on the same tier anymore, so there is no automatic "equivalent" amount across a cadence switch: switching **to annual** always resolves to the one active annual price (`toAmountMinor` is ignored if sent); switching **to monthly** uses the supplied `toAmountMinor` if valid, else defaults to the scale's default amount (£5.99) rather than erroring. Same scheduled response shape as downgrade, `scheduledChange.type: "change_cadence"`.
- `POST /api/membership/cancel` — body may include a `reason`. Response: `{ status: "cancelling", paidThroughAt }`.
- `POST /api/membership/resume` — only valid while `status === "cancelling"` and the paid-through date hasn't passed (`MEMBERSHIP_LAPSED` error if it has). Response: `{ status: "active" }`.
- **Resolved — payment-method update**: hosted, via `POST /api/membership/portal-session` (body: `{ returnUrl? }` → `{ url }`, a Stripe Customer Portal deep link). Chosen over a dedicated client-secret/embedded-form endpoint specifically to keep zero PCI scope on our side and inherit Stripe's own SCA/3DS handling — `/account/membership`'s "manage payment" action should be a redirect, not an embedded form.

**Resolved — idempotency under double-submit**: send an `Idempotency-Key` header on every mutating call in this section (`upgrade`, `downgrade`, `change-cadence`, `cancel`, `resume`). A resubmit with the same key within ~10 minutes replays the original response rather than re-running the handler — see `middleware/idempotency.js`. This is a UI-resubmit protection (short-lived, in-memory), separate from the redemption endpoint's durable idempotency (a permanent DB constraint) — the underlying state-machine guards (e.g. "no active membership to change") are still the backstop if a key is reused after the window expires.

---

## 6. Entitlements — `GET /api/membership/benefits`

Server-authoritative per-member benefit list. The frontend renders **only** what this returns — never infers entitlement from anything held in client state.

**Resolved — benefits are flat.** Any live membership (any contribution amount, £3.99 minimum) is eligible for every active benefit — there is no amount or tier threshold. There is currently exactly one seeded benefit (`submission_eligibility`); the array shape below still returns a list (not a single object) so adding a second benefit later is additive, not a contract change.

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

**Resolved**: `isFoundingMember` is true for the first 250 memberships to record a **successful first payment** (any contribution amount, either cadence). Complimentary and admin-granted memberships are explicitly excluded from the count. The badge is permanent — it is never revoked if the member later cancels or churns. Allocation is atomic under concurrency (an atomic capped counter increment, not a count-then-write) and capped at exactly 250 regardless of how many payments land simultaneously — see `services/FoundingMemberService.js`. The frontend just renders the boolean, as assumed; badge copy is CMS-driven, as assumed.

---

## Resolved decisions summary (for quick reference)

All fifteen were open questions when this document was written; all are now implemented and confirmed:

1. **CORS**: no action needed for the BFF's server-to-server calls (no browser `Origin` header sent). Direct browser calls to the API are a separate, lower-priority gap — see section 1.
2. Email verification does **not** block checkout.
3. Path prefix is `/api/membership/*` as assumed; error envelope is `{ error: { code, message } }` as assumed.
4. ~~Tier `id` slugs confirmed and made immutable at the model level.~~ Superseded 2026-09: tiers removed entirely in favour of a sliding-scale contribution — see the revision note at the top of this document.
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
