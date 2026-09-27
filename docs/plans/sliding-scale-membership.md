# Sliding-scale membership — impact analysis & implementation plan

**Status:** awaiting confirmation. No code written.
**Date:** 2026-09-22
**Repos:** `voices_backend` (branch off `staging/2026-09-13`), `voices-radio` (branch off `staging/redesign-preview`)

---

## 1. Requirements restatement

Replace the four-tier membership ladder (supporter / member / insider / patron) with a **single sliding contribution scale**:

| Parameter | Value |
|---|---|
| Minimum | £3.99 / month |
| Default (slider start) | £5.99 / month |
| Maximum | £15.99 / month |
| Step | £1.00, `.99` endings → 13 points (£3.99, £4.99 … £15.99) |
| Annual | **£40.99 / year**, single fixed price, discount shown on screen |
| Currency | GBP, integer minor units throughout (unchanged) |

Confirmed decisions:

1. **Benefits are flat.** Every subscriber paying the £3.99 minimum or above gets everything. **Exactly one benefit exists** — no tiers, no thresholds, no amount-based gating.
2. **Annual = £40.99/yr**, a single fixed option separate from the monthly scale, with the discount percentage displayed.
3. **13 pre-seeded Stripe Prices** for the monthly scale + 1 annual = 14 total.
4. **No live members** — pre-launch; schema changes outright, no grandfathering or member comms.
5. **Rename `/tiers` → `/plans` outright** — no deprecation shim; both repos deploy together.

### 1.1 Annual discount maths

| | Minor units | Display |
|---|---|---|
| Cheapest monthly × 12 | `399 × 12 = 4788` | £47.88 |
| Annual price | `4099` | £40.99 |
| Saving | `689` | £6.89 |
| Discount | `689 / 4788 = 14.39%` | **"Save 14%"** |

Two rules for this figure:

- **Derived, never hardcoded.** The backend computes it in `GET /plans` from the two live `PriceVersion` amounts, so it can't drift out of sync when a price changes. The frontend renders what the API returns.
- **Rounded down** (`Math.floor`), never up. 14.39% is advertised as 14%, not 15% — overstating a discount is a consumer-protection problem, and rounding down is the only safe direction.

Note that £40.99/yr is £3.42/month equivalent — *below* the £3.99 monthly floor. That is the intended shape of an annual discount, but it means copy must never say "membership starts at £3.99" without qualification. Correct phrasing: **"from £3.99 a month, or £40.99 a year (save 14%)"**.

---

## 2. Impact analysis

### 2.1 Where membership actually lives (important scoping finding)

- **The membership UI is not live.** `voices-radio` `main` (production, voicesradio.co.uk) contains **zero** membership files. The entire frontend — `/join`, `/support`, `/account/membership`, the Sanity membership schemas — exists only on `staging/redesign-preview` (97 files) and `feat/onboarding-matrix` (98 files).
- **The backend is deployed** at `api.voicesradio.co.uk` in **Stripe test mode**, fully E2E-tested per `docs/membership-fe-e2e-handoff.md`.
- `voices-admin` has **no membership UI** — its only tier-adjacent file is `AuthContext.tsx`. Admin surfaces are backend-only routes.

Consequence: "across the entire website" means **the staging branch**, and there is no production copy sweep to do. This substantially de-risks the change.

### 2.2 `tier` is load-bearing, not just a price label

Tier is threaded through commerce, entitlement, analytics and copy:

**Backend — data model**
| File | Coupling |
|---|---|
| `models/Tier.js` | `key` enum + `rank` 1–4, `immutable: true`. The rank ladder is what upgrade/downgrade logic reads. |
| `models/Membership.js` | `tierKey` required enum |
| `models/PriceVersion.js` | `tierKey` enum; **unique partial index on `(tierKey, cadence, status:'active')`** |
| `models/Benefit.js` | `eligibleTierKeys[]` — drives all benefit eligibility |
| `models/MembershipEvent.js` | `tierKey` on every funnel + lifecycle event |
| `models/Redemption.js`, `models/Entitlement.js`, `models/User.js`, `models/ConsentRecord.js` | tier references |

**Backend — logic**
| File | Coupling |
|---|---|
| `services/MembershipChangeService.js` | `isImmediateUpgrade()` compares `Tier.rank`. This is the rule that decides *immediate prorated charge* vs *scheduled at renewal* — the most behaviourally sensitive line in the system. |
| `services/EntitlementService.js` | `benefit.eligibleTierKeys.includes(membership.tierKey)` |
| `services/PriceVersionService.js` | Everything keyed by `(tierKey, cadence)`; creates one Stripe Product per tier via `product_data` |
| `services/membership/reconcile.js`, `processPaymentEvent.js`, `normalizeStripeEvent.js` | tierKey on reconciliation |
| `services/SanityContentService.js`, `RedemptionService.js`, `FoundingMemberService.js` | tier copy / tier refs |

**Backend — API surface**
`routes/membership/catalogue.js` (`GET /tiers`), `checkout.js` (`{tierId, cadence}` body + hardcoded `validTiers`), `changes.js`, `status.js` (`tierId` in response), `routes/accountCapabilities.js`, `routes/adminMembershipMetrics.js` (`$group: {_id:'$tierKey'}`), `routes/membershipCmsWebhook.js` (`membershipTier` case with a `DEFAULT_RANK` map), `routes/adminMembership.js`, `routes/membershipCron.js`, `utils/membershipEmails.js`, `utils/templateVariables.js`, `scripts/seedMembership.js`.

**Frontend (`staging/redesign-preview`)** — 54 files reference tiers. Highest density:
`lib/voices/membership/constants.ts` (47 mentions), `components/membership/tier-comparison.tsx` (34), `account/membership/page.tsx` (21), `account/membership/plan-switcher.tsx` (18), `components/membership/tier-card.tsx` (13), `join/page.tsx` (13), plus `schemas.ts`, `analytics.ts`, `membership-client.ts`, `start-checkout.ts`, `join/checkout/route.ts`.

**Sitewide copy** (not just the buy page): `components/redesign/supporter-block.tsx`, `supporter-wall.tsx`, `support-signal-meter.tsx`, `site-header.tsx`, `site-footer.tsx`, `app/(station)/page.tsx` (home), `explore/page.tsx`, `shows/[id]/page.tsx`, `artists/[id]/page.tsx`, `support/page.tsx`, `join/create-account/create-account-form.tsx`, `account/page.tsx`, `account/profile/profile-form.tsx`.

**Sanity CMS**: `schemas/membershipTier.ts`, `schemas/membershipBenefit.ts`, `schemas/membershipPage.ts` (copy strings hardcoding "£4", "Switch to Supporter — £4/month"), `sanity.queries.ts`, `sanity.client.ts`.

**Tests**: ~20 backend test files, ~14 FE unit test files, 3 `tests/e2e/*.spec.ts`, 4 `tests/staging/*.spec.ts`.

### 2.3 What flat benefits simplify away

Decision 1 removes a whole dimension of work that a threshold-based model would have required:

- **No `minAmountMinor` field, no benefit ladder remap, no sign-off on floors.**
- **No monthly-equivalent normalisation.** A threshold model would have had to compare a £40.99/yr member (£3.42/mo) against monthly thresholds — an inherently awkward comparison, and the source of two of the risks in the previous draft. Both are now gone.
- **`EntitlementService` gating collapses** from a four-clause tier/cadence/campaign test to "is this membership live?".
- **`Benefit.eligibleCadences` becomes unused** — the only cadence-specific benefit was `annual_pack`, which does not survive.

The benefit **machinery** (the 9-state resolver, `Redemption`, quotas, capacity, `/account/benefits`, `/account/redemptions`) is already built and tested. The plan **keeps it and seeds a single benefit row** rather than ripping it out — minimal impact, and it leaves room to add benefits later without rebuilding. Removing it entirely is a separate decision, not required by this change.

### 2.4 What the sliding scale preserves

- **Versioned, immutable pricing** — `PriceVersion` + one Stripe Price per amount is exactly the right shape for 13 fixed scale points. The invariant ("a member keeps the price they signed up at") survives untouched.
- **Membership holds its own `priceVersionId`** — price changes never retroactively affect subscribers.
- **Upgrade/downgrade semantics translate directly** — rank comparison becomes amount comparison. Increase = immediate prorated; decrease = scheduled at renewal; cadence change = scheduled. No Stripe logic changes.
- **Founding-member 250 counter** is tier-independent and survives untouched.

---

## 3. Target design

### 3.1 Data model

```
PriceVersion   keyed by (cadence, unitAmount) instead of (tierKey, cadence)
               unique active index → (cadence, unitAmount, status:'active')
               drop tierKey

Membership     drop tierKey enum
               add contributionAmountMinor (denormalised from the PriceVersion
               for metrics/display; priceVersionId stays authoritative)

Benefit        drop eligibleTierKeys[]   — no gating at all
               eligibleCadences retained but unused (seed empty)

Tier           DELETE (model, collection, seed, Sanity doc type, webhook case)
```

### 3.2 Benefit gating

`EntitlementService.resolve()` loses the tier test entirely:

```js
// before
const tierEligible = membershipLive
  && (benefit.eligibleTierKeys.length === 0 || benefit.eligibleTierKeys.includes(membership.tierKey))
  && (benefit.eligibleCadences.length === 0 || benefit.eligibleCadences.includes(membership.cadence))
  && (!benefit.campaignKey || ...);

// after
const eligible = membershipLive
  && (!benefit.campaignKey || ...);   // founding_250 campaign check is unrelated to amount
```

The `founding_250` campaign check stays — it keys off `user.membershipProfile.foundingMember`, not amount, and is orthogonal to this change.

**The single surviving benefit** — the seven seeded benefits (`submission_eligibility`, `merch_discount`, `event_presale`, `studio_ballot`, `workshop_priority`, `annual_pack`, `patron_experience`) collapse to one. **Proposed: `submission_eligibility`** — it is the only one the existing site copy treats as a core membership proposition (`join_ballot_disclaimer` in `MEMBERSHIP_FALLBACK_COPY` describes Open Decks / Supporter Radio submission eligibility). *Confirm this is the right survivor — see §7.*

### 3.3 Upgrade/downgrade

```js
isImmediateChange(membership, targetAmount, targetCadence)
  = targetCadence === membership.cadence
    && targetAmount > membership.contributionAmountMinor
```

Everything else stays scheduled. Stripe proration, Subscription Schedule handling, and the schedule-release ordering fix in `applyChange()` are untouched.

Note one consequence of the annual discount: monthly → annual is a *price decrease* in absolute terms (£47.88/yr equivalent → £40.99/yr) but is already handled as a **cadence change**, which is always scheduled at renewal. No special case needed.

### 3.4 API contract changes

| Before | After |
|---|---|
| `GET /api/membership/tiers` → `{tiers:[{id,name,monthlyPriceMinor,annualPriceMinor,mostPopular,sortOrder}]}` | `GET /api/membership/plans` (outright rename, no shim) |
| `POST /checkout {tierId, cadence}` | `POST /checkout {amountMinor, cadence}` |
| `POST /changes {tierId, cadence}` | `POST /changes {amountMinor, cadence}` |
| `GET /status → {tierId, …}` | `GET /status → {contributionAmountMinor, …}` |
| `POST /events {type:'tier_selected', tierKey}` | `{type:'amount_selected', amountMinor}` |

New `GET /api/membership/plans` response:

```jsonc
{
  "scale": {
    "minMinor": 399,
    "maxMinor": 1599,
    "stepMinor": 100,
    "defaultMinor": 599,
    "currency": "gbp",
    "points": [ { "amountMinor": 399, "priceVersionId": "…" }, /* … 13 total */ ]
  },
  "annual": {
    "amountMinor": 4099,
    "currency": "gbp",
    "comparedToMonthlyMinor": 4788,   // cheapest monthly × 12
    "savingMinor": 689,
    "discountPercent": 14             // floor(689/4788*100) — derived, never stored
  }
}
```

`docs/voices-membership-backend-api-contract.md` §2/§3/§5/§6 and the FE brief both need rewriting in the same PR.

### 3.5 Stripe

- **One Product**: "Voices Radio Membership" (replaces the four per-tier Products that `product_data` creates implicitly).
- **14 Prices**: 13 monthly recurring (£3.99…£15.99) + 1 annual (£40.99), each with `metadata: {amountMinor, cadence, priceVersionId}`.
- **Archive** the 8 existing test-mode tier Prices and their Products.
- Checkout resolves the Price from the seeded allowlist — **never** from a client-supplied `price_data`.
- The discount percentage is **display-only**. It is *not* a Stripe Coupon or discount object — annual is simply its own Price. Nothing in Stripe needs to know the number.

### 3.6 Frontend

**New**: `components/membership/contribution-slider.tsx` — native `<input type="range">` (keyboard + screen-reader accessible by default), `step=100` minor units, `aria-valuetext` reading "£5.99 per month", live formatted readout, ≥44px thumb target, £3.99/£15.99 end labels.

**New**: `components/membership/annual-discount-badge.tsx` — renders "Save 14%" from `discountPercent` in the API response. Renders nothing if the field is absent or ≤0, so a pricing change that erases the discount can't leave a stale or nonsensical badge on screen.

**Replaced**: `tier-card.tsx`, `tier-comparison.tsx` (+ tests) → slider + `contribution-summary.tsx` (chosen amount, what it funds, the single benefit).

**Reworked**: `cadence-toggle.tsx` (monthly-scale ↔ annual-fixed, carrying the discount badge; slider hides on annual), `account/membership/plan-switcher.tsx` (change-your-amount slider), `cancel-flow.tsx` (retention offer "reduce to £3.99" replaces "switch to Supporter — £4").

**Simplified by flat benefits**: `benefit-card.tsx`, `benefit-copy.ts`, `/account/benefits` and `/account/redemptions` now render a single item. They keep working unchanged — worth a visual pass to confirm a one-item list doesn't look broken in a grid built for four.

---

## 4. Risks

| # | Sev | Risk | Mitigation |
|---|---|---|---|
| **R1** | **HIGH** | **Client-controlled price.** `amountMinor` now arrives from the browser. A naive implementation lets someone subscribe at £0.01. | Server-side allowlist: resolve `amountMinor` against an **active `PriceVersion`** and reject anything else with `PRICE_UNAVAILABLE`. Never construct `price_data` from the request. Adversarial test posting £0.01, £0, negative, £4.49 (off-step) and £99.99. |
| **R2** | **HIGH** | **Both repos must ship together.** The outright `/tiers` → `/plans` rename (decision 5) means a backend-first deploy breaks staging's `/join` immediately — the FE calls a route that no longer exists. | Coordinated deploy; backend merged and deployed only once the FE branch is ready to follow within the same window. Smoke-test `/join` on the Vercel Preview before backend merge. |
| **R3** | **MED** | **Sanity `membershipTier` documents are published content.** Four live docs orphan; the webhook's `membershipTier` case rejects unknown keys with a 400, so a stale publish errors after deploy. | Remove the webhook case and the Sanity schema in the same deploy; delete/migrate the four documents as an explicit Phase 4 step. |
| **R4** | **MED** | **Index and enum removal is not automatic.** Mongoose won't drop the existing unique partial index on `(tierKey, cadence, status)` or the `membership_tiers` collection. | Explicit migration script; verify with `db.membership_price_versions.getIndexes()` before and after. |
| **R5** | **MED** | **Discount percentage drifts or misleads.** A hardcoded "Save 14%" silently becomes wrong the moment either price changes; rounding up overstates the saving. | Derive server-side from live `PriceVersion` amounts; `Math.floor`; unit-test the rounding boundary. Badge renders nothing when `discountPercent <= 0`. |
| **R6** | **LOW** | **"From £3.99" copy is wrong for annual** (£40.99/yr = £3.42/mo). | Copy standard fixed in §1.1; Phase 7 sweep enforces it everywhere. |
| **R7** | **LOW** | FE zod schemas are strict on `mostPopular`/`sortOrder`, which disappear. | Schema rewrite is in Phase 5, ahead of the UI work. |
| **R8** | **LOW** | Benefit UI built for a four-item grid now renders one. | Visual pass in Phase 6. |
| **R9** | **LOW** | Funnel analytics continuity — `tier_selected` history becomes uncomparable to `amount_selected`. | Accept (pre-launch, no meaningful history); note in the metrics route. |

*Two risks from the previous draft — annual/monthly benefit-threshold ambiguity, and old benefit floors exceeding the new maximum — are eliminated by the flat-benefit decision.*

---

## 5. Implementation phases

### Phase 0 — Stripe setup
- [ ] Create the single "Voices Radio Membership" Stripe Product (test mode)
- [ ] Inventory + archive the 8 existing tier Prices and their Products

### Phase 1 — Backend data model *(TDD)*
- [ ] `models/PriceVersion.js` — rekey to `(cadence, unitAmount)`, swap the unique partial index
- [ ] `models/Membership.js` — drop `tierKey`, add `contributionAmountMinor`
- [ ] `models/Benefit.js` — drop `eligibleTierKeys`
- [ ] `models/MembershipEvent.js` — `tierKey` → `amountMinor`
- [ ] Delete `models/Tier.js`
- [ ] Migration script: drop `membership_tiers`, drop the stale index, re-seed
- [ ] `scripts/seedMembership.js` — 13 monthly + 1 annual (£40.99) PriceVersion, **one** benefit

### Phase 2 — Backend services *(TDD)*
- [ ] `PriceVersionService` — `createPriceVersion({cadence, unitAmount})`, `getActivePriceVersion(cadence, amountMinor)`, `getScale()`; single shared Stripe Product
- [ ] `PriceVersionService.getAnnualComparison()` — derives saving + floored discount percent (R5)
- [ ] `MembershipChangeService.isImmediateUpgrade` → amount comparison
- [ ] `EntitlementService` — remove tier/cadence gating, keep `founding_250` campaign check
- [ ] `services/membership/*` — reconcile/processPaymentEvent/normalizeStripeEvent tierKey removal

### Phase 3 — Backend API + contract
- [ ] `catalogue.js` → `GET /plans` with the §3.4 response shape
- [ ] `checkout.js` — `amountMinor` + **allowlist validation (R1)**
- [ ] `changes.js`, `status.js`, `accountCapabilities.js`, `adminMembershipMetrics.js` (amount histogram)
- [ ] `utils/membershipEmails.js`, `utils/templateVariables.js`
- [ ] Rewrite `docs/voices-membership-backend-api-contract.md` §2/§3/§5/§6

### Phase 4 — Sanity CMS
- [ ] Delete `schemas/membershipTier.ts`; add `schemas/membershipScale.ts`
- [ ] `membershipPage.ts` — replace hardcoded "£4" copy fields per the §1.1 standard
- [ ] Remove the `membershipTier` case from `membershipCmsWebhook.js`; add `membershipScale`
- [ ] Delete the four published `membershipTier` documents (R3)

### Phase 5 — Frontend lib layer
- [ ] `schemas.ts` — `membershipPlansApiSchema` (scale + annual + discount)
- [ ] `constants.ts` — `MEMBERSHIP_FALLBACK_SCALE`, `mergeMembershipScale`
- [ ] `membership-client.ts` `getTiers()` → `getPlans()`
- [ ] `start-checkout.ts`, `join/checkout/route.ts`, `membership-mutations.ts`, `analytics.ts`
- [ ] `sanity.queries.ts`, `sanity.client.ts`

### Phase 6 — Frontend UI
- [ ] New `contribution-slider.tsx` (accessibility per §3.6)
- [ ] New `annual-discount-badge.tsx` (R5 guard)
- [ ] New `contribution-summary.tsx`; delete `tier-card.tsx`, `tier-comparison.tsx`
- [ ] Rework `cadence-toggle.tsx` to carry the discount badge
- [ ] `join/page.tsx`, `support/page.tsx`
- [ ] `account/membership/page.tsx`, `plan-switcher.tsx`, `cancel-flow.tsx`, `membership-status-card.tsx`
- [ ] Visual pass on single-benefit `/account/benefits` + `/account/redemptions` (R8)

### Phase 7 — Sitewide copy sweep
- [ ] `supporter-block.tsx`, `supporter-wall.tsx`, `support-signal-meter.tsx`, `site-header.tsx`, `site-footer.tsx`
- [ ] `page.tsx` (home), `explore/page.tsx`, `shows/[id]/page.tsx`, `artists/[id]/page.tsx`
- [ ] `join/create-account/create-account-form.tsx`, `account/page.tsx`, `account/profile/profile-form.tsx`
- [ ] Apply the §1.1 pricing copy standard everywhere ("from £3.99 a month, or £40.99 a year — save 14%")
- [ ] Verify with `git grep -i 'supporter\|insider\|patron\|tier'` → only legitimate prose remains

### Phase 8 — Tests & verification
- [ ] Backend: ~20 test files updated; **adversarial price-tampering suite (R1)**; discount rounding boundary test (R5)
- [ ] FE: ~14 unit test files; new `contribution-slider.test.tsx`, `annual-discount-badge.test.tsx`
- [ ] E2E: `join.spec.ts`, `checkout.spec.ts`, `account.spec.ts`, `tests/staging/*`
- [ ] Manual Stripe test-mode run: checkout at £3.99 → increase to £15.99 (immediate proration) → decrease to £5.99 (scheduled) → switch to annual (scheduled) → cancel → redeem the benefit
- [ ] Coverage ≥80%

---

## 6. Complexity: **HIGH**

| Phase | Estimate |
|---|---|
| 0 — Stripe setup | 0.5h |
| 1 — Data model + migration | 3h |
| 2 — Services | 3h |
| 3 — API + contract doc | 3–4h |
| 4 — Sanity | 2h |
| 5 — FE lib | 2–3h |
| 6 — FE UI | 5–7h |
| 7 — Copy sweep | 2h |
| 8 — Tests & verification | 5–7h |
| **Total** | **25–31h** |

Down from 27–35h: flat benefits remove the threshold model, the ladder remap and the monthly-equivalent normalisation, along with their tests and the sign-off they needed.

---

## 7. Open question

**Which single benefit survives?** Seven are currently seeded. §3.2 proposes `submission_eligibility` (Open Decks / Supporter Radio submission eligibility) because it is the only one the existing site copy already presents as a core membership proposition. If the intended survivor is a different one — or a new generic "supporter recognition" benefit — say which and Phase 1 seeds that instead.

This does not block Phases 0 or 2–8; only the single seed row in Phase 1 depends on it.
