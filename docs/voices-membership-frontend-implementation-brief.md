# Voices Radio Membership Programme — Frontend Implementation Brief

## Purpose

Build the customer-facing membership experience for Voices Radio: discovery, signup, payment handoff, onboarding, member account management and benefit redemption.

The experience should communicate:

> **Support independent radio. Get closer to the people, place and culture behind it.**

The radio stream remains public. Membership provides impact, identity, access, participation and recognition rather than functioning as a media paywall.

## Information architecture

```text
/support
/join
/account/membership
/account/benefits
/account/redemptions
/account/profile
/benefits/{slug}
```

## Membership proposition

Launch tiers:

| Tier | Monthly | Annual | Role |
|---|---:|---:|---|
| Supporter | £4 | £40 | Frictionless support |
| Member | £8 | £80 | Default / volume tier |
| Insider | £15 | £150 | Deeper participation and station access |
| Patron | £30 | £300 | Higher support and closest member access |

Visually identify **Member (£8/month)** as `Most popular`.

Annual plans equal ten months of monthly pricing.

## `/support`

Recommended hierarchy:

### Keep independent radio loud.

Back Voices from £4 a month and help fund the people, space and ideas that keep London's community radio moving.

Primary CTA: **Join Voices**

Secondary CTA: **See what membership funds**

Then explain:

> **Radio stays open. Membership gets you closer.**

Make it explicit that listening remains open/public and that members receive additional ways to participate.

The page should lead with impact, then benefits, then pricing.

## `/join`

Provide a clear tier comparison and billing cadence control.

Tier copy should be CMS-driven:

- **Supporter — Keep the signal moving.**
- **Member — Get closer to Voices.**
- **Insider — Step inside the station.**
- **Patron — Help build what comes next.**

Do not present capacity-limited benefits as guaranteed admission/tickets.

Open Decks / Supporter Radio must clearly state that membership creates eligibility to submit for editorial consideration, not guaranteed airplay.

## Signup journey

```text
Support Voices
    ↓
Choose tier
    ↓
Monthly or annual
    ↓
Create account / sign in
    ↓
Payment
    ↓
Membership active
    ↓
Choose recognition & email preferences
    ↓
Benefits dashboard
```

Keep the path short. Do not request a postal address unless a physical benefit actually requires one.

After successful activation, route directly to the member dashboard rather than the homepage.

## Member dashboard

The dashboard should make membership status and usable value immediately visible.

Example:

```text
MEMBER · Active
£80/year · Renews 5 September 2027

Your benefits
- 10% off Voices merch
- Event presales
- Partner Perks
- Latest Voices Note
- My offers and redemptions
```

Show relevant states including:

- Active
- Cancelling / active until date
- Payment grace period
- Scheduled downgrade
- Complimentary membership
- Expired/cancelled

Provide one clear action when payment requires attention.

## `/account/membership`

Display:

- Current tier
- Price and billing cadence
- Renewal/paid-through date
- Membership status
- Scheduled membership change
- Upgrade
- Downgrade
- Change cadence where eligible
- Cancel
- Resume pending cancellation
- Payment-management action

### Upgrade

Show new price/financial effect before confirmation.

After success, display the new tier and newly unlocked benefits immediately.

### Downgrade

Clearly state that the change occurs on the next renewal date and that current higher-tier benefits remain available until then.

### Cancellation

Show the paid-through date before confirmation.

Offer the lower-cost Supporter option where appropriate:

> **Switch to Supporter — £4/month**  
> Keep supporting Voices at our lowest level.

Also provide **Cancel membership** with equal clarity. Do not use obstructive cancellation patterns.

After cancellation, show that benefits remain active through the end date and provide a resume action until that point.

## `/account/benefits`

Render only authoritative benefit/entitlement data returned by the backend.

Benefit cards should support states such as:

- Available
- Claimed
- Used
- Expired
- Not yet available
- Capacity full
- Ineligible
- Requires action/application
- Ballot entered

Benefits may include:

- Shop discount
- Partner Perks
- Event presales
- Community offers
- Studio/live-session ballots
- Workshop priority
- Open Decks / Supporter Radio submissions
- Annual supporter pack
- Patron open house/events/recognition

Where appropriate, expose a clear **Show code**, **Claim**, **Enter ballot**, **Submit**, **Book**, or **View offer** action.

## Benefit redemption flow

```text
Member dashboard
    ↓
Choose benefit
    ↓
Check entitlement
    ↓
Claim / book / reveal offer
    ↓
Confirmation
    ↓
Redemption appears in account
```

Never infer entitlement solely from the tier rendered in the browser. The server response is authoritative.

Handle duplicate redemption attempts and race/capacity failures gracefully.

## `/account/redemptions`

Show current and historical claims with:

- Benefit name
- Redemption status
- Claim/use date
- Expiry date where relevant
- Redemption instructions
- Code/identifier where applicable
- Terms

Do not expose sensitive internal redemption identifiers unnecessarily.

## `/account/profile`

Support:

- Name/account details
- Public supporter-wall preference
- Recognition display name/alias
- Transactional communication details
- Marketing preferences
- Physical fulfilment address only when required

Founding members should see a persistent:

> **FOUNDING MEMBER · VOICES · 2026**

badge/identity.

## Responsive behaviour

The core experience must work from **320 CSS pixels** upward.

Requirements:

- Convert wide tier-comparison layouts into vertically stacked cards on small screens.
- No horizontal page scrolling for core flows.
- Essential functionality must not require hover.
- Maintain clear hierarchy for price, cadence, benefit differences and CTA.
- Ensure payment/account return states work correctly on mobile.
- Keep critical membership actions reachable without excessive scrolling.

## Accessibility

Target **WCAG 2.2 AA**.

Implement/test:

- Full keyboard operation
- Visible focus states
- Logical focus management after dialogs/navigation/actions
- Appropriate touch/target sizes
- Semantic tier comparison
- Properly labelled controls/forms
- Error summaries and field-level errors
- Screen-reader announcements for meaningful asynchronous status changes
- Status information that does not rely on colour alone
- Reduced-motion support
- Text alternatives to QR-code-only interactions
- Zoom/reflow at 200–400%
- Captions/transcripts where audio/video content requires them

## CMS integration

Frontend content should consume CMS-managed data rather than hard-code commercial copy where practical.

CMS-driven content includes:

- Tier names/headlines/descriptions
- Current/future presentation prices
- Benefit copy
- Eligibility explanations
- Founding/campaign badges
- Partner offers
- Event capacity/availability presentation
- Physical-pack details
- Dashboard announcements
- FAQs
- Cancellation copy
- Transactional copy

Handle missing, malformed or future-dated CMS content safely.

## Error and loading states

Design explicit states for:

- Authentication required
- Checkout creation failure
- Payment authentication failure
- Payment processing/pending
- Payment succeeded but membership reconciliation still pending
- Failed renewal / grace period
- API timeout
- CMS unavailable
- Benefit no longer available
- Benefit capacity reached
- Redemption already consumed
- Membership state changed in another tab/session

Do not show success until the backend confirms the relevant state.

## Analytics

Instrument:

- Support page viewed
- Tier selected
- Cadence selected
- Checkout started
- Checkout completed
- Membership dashboard viewed
- Benefit viewed
- Benefit redemption attempted/succeeded/failed
- Upgrade started/completed
- Downgrade scheduled
- Cancellation started/completed
- Cancellation reason
- Resume completed
- Partner offer viewed/redeemed

Avoid placing unnecessary personal information in analytics payloads.

## Test matrix

Test at minimum:

1. Monthly checkout for every tier.
2. Annual checkout for every tier.
3. Payment authentication/challenge.
4. Payment failure and retry.
5. Duplicated payment callbacks.
6. Immediate upgrade.
7. Scheduled downgrade.
8. Cancellation and paid-through access.
9. Resume before cancellation date.
10. Payment grace and recovery.
11. Correct benefit eligibility for each tier.
12. Double-redemption attempt.
13. Capacity-limited benefit race/full state.
14. Expired benefit.
15. Recognition privacy.
16. Marketing consent independence.
17. Keyboard-only completion.
18. Screen-reader operation.
19. 200–400% zoom/reflow.
20. Reduced motion.
21. CMS failure/missing content.
22. Future-dated CMS content.
23. Mobile at 320px.
24. Refresh/back-button behaviour through checkout/account changes.
25. Stale frontend state after server-side membership change.

## Acceptance criteria

The frontend is launch-ready when:

- Visitors understand that public radio remains accessible without membership.
- Users can compare all four tiers and monthly/annual pricing without ambiguity.
- The £8 Member tier is clearly presented as the recommended/default option.
- Signup from `/support` to active membership is short and works across supported screen sizes.
- Successful members land on a useful benefits dashboard.
- Upgrade, downgrade, cancellation and resume are self-service.
- Financial/date consequences are shown before membership changes are confirmed.
- Benefits are rendered from server-authoritative entitlement state.
- Capacity, expiry and duplicate-redemption failures are understandable.
- Founding-member and recognition preferences respect privacy.
- Core journeys meet WCAG 2.2 AA requirements.
- Core flows work from 320 CSS pixels without horizontal scrolling.
- CMS content can change without requiring frontend deployment.
- Analytics capture the defined membership funnel and benefit usage without unnecessary PII.
