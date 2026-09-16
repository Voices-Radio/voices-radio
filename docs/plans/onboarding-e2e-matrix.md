# Onboarding E2E — permutation matrix and fix plan

Status: **DRAFT, waiting for confirmation.** Nothing implemented yet.
Branches: voices-radio `staging/redesign-preview` (local copy is behind origin, so pull first), voices_backend `staging/2026-09-13`. Never merge to main.

## 1. Requirements restated

1. Every password field has a show/hide (eye) toggle.
2. The "You signed in successfully, but this account is not linked to an artist profile" strip, and every other `?missing=` or `?artist=` notice, can never render.
3. A claim link sent to a DJ always works. It ends in the artist area, or in one clear action the DJ can take themselves. It never ends in a generic error or a form that can't succeed.
4. Every onboarding permutation is enumerated and covered by automated tests.

## 2. Findings (evidence gathered 2026-09-14)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | The strip comes from the sign-in "Artist/Member" picker. `?as=artist` on an account without the artist capability redirects to `…?missing=artist`, and `AccountNotice` renders it. One login serves both; the picker is only a landing hint. That's why "artist login works" for any account. | `lib/voices/membership/capabilities.ts` `resolvePostLoginPath`; `app/(station)/account/page.tsx` `AccountNotice` |
| F2 | `onslow.jack@yahoo.com` is **member-only**: role `user`, active `insider` membership, no Artist with this `userId`, no invitations. The strip was technically accurate but should never have been reachable. | read-only DB query |
| F3 | **The claim form defaults to the wrong mode for nearly every real DJ.** The default follows whether the *Artist* exists (`claim_existing` → "Use existing account password"), not whether a *User* account exists. 136 of 139 artists have no linked user, so most invited DJs are asked for the password of an account they don't have. The backend then answers 400 "First name, last name, and password are required". | `claim-artist-form.tsx:76-82`; `GET /artist-invitations/validate/:token` returns no account signal |
| F4 | **Apple-only accounts can't claim.** `comparePassword` returns false when `authProvider !== 'local'`, so both web sign-in and the claim "existing password" path fail. 7 of 28 users are Apple. | `models/User.js:153`; `authenticateExistingUser` |
| F5 | No eye toggle on any of the 6 password inputs: sign-in, create-account, reset-password ×2, claim ×2. | `git grep type="password"` |
| F6 | Claim dead ends: expired and invalid tokens share one message ("Invalid or expired invitation"), re-clicking a used link returns 409 with no sign-in CTA, and a net-new name collision returns 409 "Please contact us". | `routes/artistInvitations.js` 526/577/616/701 |
| F7 | **Staging E2E hits the production backend.** A real claim there creates an Artist, elevates the user's role, and syncs to RadioCult. Claim permutations can't run against staging. | memory: staging uses the prod backend; `syncArtistToRadioCult` in the claim route |

## 3. The contract (invariants every test asserts)

- **I1**: No page ever renders `AccountNotice`, and no redirect ever contains `missing=` or `artist=missing|unavailable`. This is asserted globally in a Playwright fixture after every navigation.
- **I2**: Post-login landing is a pure function of (capabilities, safe `next`). The entry door plays no part.
- **I3**: A valid pending claim link offers exactly one path that can succeed for this email's real account state, and success lands on `/account/artist`.
- **I4**: A non-pending link (claimed, expired, cancelled, invalid) shows a specific message plus a CTA: sign in, request a fresh link, or contact us.
- **I5**: A claim sends no email and triggers no notification (see memory: no artist comms from data ops). Tests mock the mailer and RadioCult and assert the call counts.
- **I6**: Every `input[type=password]` has an accessible toggle (`aria-label="Show password"`, `aria-pressed`).

## 4. Permutation matrix

### 4a. Sign-in (capabilities × entry door): 16 cases

Capabilities: `none` · `member` · `artist` · `both`. Entry: `/sign-in` · `?as=artist` · `?as=member` · `?next=/account/artist`.

Expected landing: `member` or `both` → `/account/profile` (or a safe `next` the account can use). `artist` → `/account/artist`. `none` → `/account` (a coherent empty state that offers "Join"). A `next` the account can't use falls back **silently** to that default. **Every case asserts I1.**

### 4b. Claim link: 18 cases

| ID | Invitation | Email's account state | Browser session | Expected |
|----|-----------|----------------------|-----------------|----------|
| C1 | existing artist | no account | signed out | create form (name + password) → `/account/artist` |
| C2 | net-new artist | no account | signed out | create form + profile fields → `/account/artist` |
| C3 | existing artist | local account, member | signed out | password form → linked, still a member → `/account/artist` with the DJ toggle |
| C4 | existing artist | local account, member | signed in as same email | one-click "Claim" → `/account/artist` |
| C5 | existing artist | local account | signed in as **different** email | "You're signed in as X; this invite is for Y" + "Switch account". Never link to X |
| C6 | existing artist | local account | signed out, wrong password | inline error + "Forgot password" that returns to this claim link |
| C7 | existing artist | **Apple-only** account | signed out | "Set a password for the web": sets the password and links the artist → `/account/artist`. Apple login still works afterwards |
| C12b | expired, then "Email me a new link" | — | any | new token emailed to the invitation address only; old token still refused; rate-limited |
| C8 | existing artist | email differs only in case or whitespace | signed out | treated as the same account |
| C9 | existing artist | account holds a privileged role (admin, producer) | signed out | linked, role **not** downgraded |
| C10 | pending, token already used by this user | — | signed in | "Already yours" → `/account/artist` |
| C11 | accepted by someone | — | signed out | "Already claimed" + Sign in CTA |
| C12 | expired | — | any | "Link expired" + decision D3 CTA |
| C13 | cancelled or deleted | — | any | "No longer valid, contact Voices" |
| C14 | malformed or unknown token | — | any | clear message, no crash |
| C15 | existing artist already linked to another user | — | any | blocked at invite time (backend 400). Test that the claim is refused too |
| C16 | net-new, name collides (incl. case/whitespace variants) | no account | signed out | name field error "that name is taken, try a variant", other fields kept; a variant name succeeds → `/account/artist` |
| C17 | double submit, or two tabs | — | — | exactly one Artist and one User created (the existing lock), second gets C10 or C11 |
| C18 | any | any | — | I5 holds: zero emails and zero notifications fired |

## 5. Test layers (cheapest first; each case ID appears in at least one layer)

| Layer | Where | Covers | Runs |
|-------|-------|--------|------|
| L1 unit (vitest) | `lib/voices/membership/capabilities.test.ts`, new `claim-mode.test.ts` | 4a exhaustively, as a table; claim default-mode function across (kind × accountExists × session) | CI |
| L2 backend (jest) | `voices_backend/tests/routes/artistInvitationClaim.matrix.test.js` | C1–C18 against the real route and models; mailer and RadioCult mocked; asserts I5 | CI |
| L3 UI (Playwright + stub backend) | new `tests/e2e/onboarding-matrix.spec.ts`, data-driven from `tests/e2e/fixtures/onboarding-cases.ts` | 4a (16 cases) and C1–C16 through the real Next app; the global I1 assertion; the I6 toggle on every page | CI |
| L4 real-backend E2E | local backend + **isolated DB `voices_e2e`**, RadioCult and email disabled | C1, C3, C4, C7, C11 end to end, to catch drift between the stub and the real backend | manual, before each staging deploy |
| L5 staging smoke | `tests/staging/` | 4a only, read-only, with your member account. **No claims (F7)** | manual |

To stop the stub drifting from the backend, L2 and L3 import the same case IDs and the stub gains `accountExists`, `authProvider` and non-pending statuses. That way an L2 contract change breaks L3 visibly.

## 6. Implementation phases (TDD: failing test first in each)

- **Phase 0, verify (read-only).** Check whether forgot-password works for Apple accounts. Check who, if anyone, sets `artist=missing|unavailable`. Check which backend env kill switches exist for RadioCult sync and email, needed by L4.
- **Phase 1, password toggle.** Add a shared `components/forms/password-input.tsx` and swap it into the 6 call sites. L3 checks I6.
- **Phase 2, remove the strip.** Delete the `missing=` generation in `resolvePostLoginPath` and the `AccountNotice` branches. D1 decides whether the picker goes too. L1 for 4a, then L3 I1.
- **Phase 3, claim flow.**
  - The backend `validate` returns `accountExists` and `accountProvider`. This is only visible to the token holder, who by construction controls the inbox.
  - The form defaults from those fields and hides the path that can't succeed (fixes F3).
  - Handle C5 (session mismatch), C10 and C11 (sign-in CTA), C12 (D3), C7 (D2) and C16 (D4).
- **Phase 4, L2 backend matrix, then L4 harness** (seed script plus `voices_e2e` DB plus kill switches).
- **Phase 5, deploy to staging branches only**, run L4 and L5, and write up the results in this file.

## 7. Decisions (answered 2026-09-14)

- **D1: Remove the Artist/Member picker.** One `/sign-in` door. `?as=` is ignored from now on, so old links still work. Landing = capabilities + safe `next`.
- **D2: Apple-only DJs set a web password during the claim.** Claim token = inbox proof, the same proof a password reset uses. Add a local password **alongside** `appleId`. Don't flip `authProvider` in a way that breaks Apple login on mobile. `comparePassword` has to accept a local password on an Apple account, so pin mobile Apple login with a backend test first.
- **D3: Expired links (C12) get a self-serve "Email me a new link" button.** It sends only to the invitation's own address, is rate-limited, and rotates the token (the old one stays dead). This email is triggered by the DJ, so it isn't a data-ops send.
- **D4: On a name collision (C16), the DJ picks a variant.** The form keeps everything they've entered, highlights the name field and says the name is taken. The server re-checks uniqueness on every submit, case- and whitespace-insensitively (`osBrain` = `osbrain ` = `OSBRAIN`), so a near-duplicate can't slip through. L2 covers the normalisation, and L3 covers the retry keeping the form's data.

## 8. Risks

- **HIGH**: L4 must never point at the prod `MONGODB_URI`. Add a guard: refuse to run unless the DB name ends in `_e2e`.
- **HIGH**: C9. Changing the role logic could downgrade producers or admins, so pin it with an L2 test before touching the code.
- **MEDIUM**: The stub backend drifting from the real backend (mitigated by the shared case IDs and L4).
- **MEDIUM**: `accountExists` on `validate` is account enumeration, but only to someone holding a valid token.
- **HIGH (D2)**: Letting an Apple account also hold a local password changes `comparePassword` and the login route, and could break Apple sign-in in the mobile app. Mitigation: backend regression tests for Apple login first, before any change.
- **MEDIUM (D3)**: The self-serve resend is a new unauthenticated email-sending endpoint. Mitigation: rate limit per token and per IP, send only to the stored invitation address, and give the same response whether or not the token exists.
- **MEDIUM (D4)**: A variant name can still be a near-duplicate that isn't an exact match (e.g. `DJ Foo` vs `Foo`). Accepted for now; the admin artist list shows it.
- **LOW**: Changing the toggle's markup could break the existing `auth.spec.ts` selectors.

## 9. Estimated complexity: MEDIUM-HIGH

About 1 day for Phases 1–2 with L1 and L3. About 1.5–2 days for Phase 3 with L2. About 0.5 day for the L4 harness.
