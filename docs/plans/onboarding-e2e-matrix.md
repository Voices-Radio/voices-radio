# Onboarding E2E — permutation matrix, as built

Status: **implemented, in review.** voices-radio [#10](https://github.com/Voices-Radio/voices-radio/pull/10) (`feat/onboarding-matrix` → `staging/redesign-preview`) and voices_backend #1 (`feat/onboarding-claim-flow` → `main`). Neither is merged yet; both need the other, so land the backend first.

Never merge to main (website). The backend change *does* go to `main` — that is where the staging site reads from.

Written as a plan on 2026-09-14, rewritten as a record on 2026-09-18. Sections 1–4 are the original analysis and still hold; sections 5–8 describe what actually shipped and what did not.

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

- **I1**: No page ever renders `AccountNotice`, and no redirect ever contains `missing=` or `artist=missing|unavailable`. Asserted globally in a Playwright fixture after every navigation.
- **I2**: Post-login landing is a pure function of (capabilities, safe `next`). The entry door plays no part.
- **I3**: A valid pending claim link offers exactly one path that can succeed for this email's real account state, and success lands on `/account/artist`.
- **I4**: A non-pending link (claimed, expired, cancelled, invalid) shows a specific message plus a CTA: sign in, request a fresh link, or contact us.
- **I5**: A claim sends no email and triggers no notification (see memory: no artist comms from data ops).
- **I6**: Every `input[type=password]` has an accessible toggle (`aria-label="Show password"`, `aria-pressed`).

Two invariants were added during implementation, both in the backend:

- **S1**: Attaching an artist to an *existing* account requires proof of control — the correct password, or a session for that exact user. A token alone is not enough. This is the privilege-escalation pin: a valid token plus a session for a *different* user must be refused.
- **D5**: `programmingEmail` is written from `invitation.email` on every claim, overwriting any existing value.

## 4. Permutation matrix

### 4a. Sign-in (capabilities × entry door): 16 cases

Capabilities: `none` · `member` · `artist` · `both`. Entry: `/sign-in` · `?as=artist` · `?as=member` · `?next=/account/artist`.

Expected landing: `member` or `both` → `/account/profile` (or a safe `next` the account can use). `artist` → `/account/artist`. `none` → `/account` (a coherent empty state that offers "Join"). A `next` the account can't use falls back **silently** to that default. **Every case asserts I1.**

Covered exhaustively as a table in `lib/voices/membership/capabilities.test.ts` (L1) and end to end in `tests/e2e/onboarding-matrix.spec.ts` (L3).

### 4b. Claim link: 18 cases, and where each is now tested

L1 = vitest unit · L2 = backend jest (voices_backend #1) · L3 = Playwright + stub backend · L4 = Playwright + real local backend.

| ID | Invitation | Email's account state | Session | Expected | Covered |
|----|-----------|----------------------|---------|----------|---------|
| C1 | existing artist | no account | signed out | create form (name + password) → `/account/artist` | L2 L3 L4 |
| C2 | net-new artist | no account | signed out | create form + profile fields → `/account/artist` | L2 L3 |
| C3 | existing artist | local account, member | signed out | password form → linked, still a member → `/account/artist` with the DJ toggle | L2 L3 L4 |
| C4 | existing artist | local account, member | signed in, same email | one-click "Claim" → `/account/artist` | L2 L3 L4 |
| C5 | existing artist | local account | signed in, **different** email | "You're signed in as X; this invite is for Y" + "Switch account". Never link to X | L2 L3 |
| C6 | existing artist | local account | signed out, wrong password | inline error + "Forgot password" that returns to this claim link | L2 L3 |
| C7 | existing artist | **Apple-only** account | signed out | "Set a password for the web": sets it and links the artist. Apple login still works | L2 L3 L4 |
| C8 | existing artist | email differs only in case or whitespace | signed out | treated as the same account | **none — gap** |
| C9 | existing artist | account holds a privileged role | signed out | linked, role **not** downgraded | L2 |
| C10 | pending, token already used by this user | — | signed in | "Already yours" → `/account/artist` | L3 |
| C11 | accepted by someone | — | signed out | "Already claimed" + Sign in CTA | L3 L4 |
| C12 | expired | — | any | "Link expired" + D3 CTA | L3 |
| C12b | expired, then "Email me a new link" | — | any | new token to the invited address only; old token dead; rate-limited | L2 L3 |
| C13 | cancelled or deleted | — | any | "No longer valid, contact Voices" | **none — gap** |
| C14 | malformed or unknown token | — | any | clear message, no crash | L3 |
| C15 | existing artist already linked to another user | — | any | claim refused | **none — gap** |
| C16 | net-new, name collides (incl. case/whitespace variants) | no account | signed out | name error, other fields kept; a variant succeeds | L2 L3 |
| C17 | double submit, or two tabs | — | — | exactly one Artist and one User created | L2 |
| C18 | any | any | — | I5 holds: zero emails and zero notifications | L2 |

## 5. What shipped

**Phase 1 — password toggle (I6, F5).** `app/(station)/components/forms/password-input.tsx` with `password-input.test.tsx`, used by `sign-in-form`, `create-account-form`, `reset-password-form` and `claim-artist-form` — all 6 inputs.

**Phase 2 — the strip is gone (I1, I2, F1, D1).** `resolvePostLoginPath` no longer emits `missing=`; `AccountNotice` is deleted from `app/(station)/account/page.tsx` (only explanatory comments remain). The Artist/Member picker is removed: `?as=` from older links is read and deliberately ignored, so old links still work.

**Phase 3 — the claim flow (I3, I4, F3, F4, F6).**
- `lib/voices/membership/claim-mode.ts` picks exactly one of `session` · `existing` · `set_password` · `create` from the account signal the backend now returns on `validate`. `canChooseClaimMode` only opens the choice when the backend could not say — otherwise offering the other paths only offers ways to fail.
- `renew-invitation-form.tsx` + `renewArtistInvitation` implement D3. The backend answers identically whether or not a link was sent, so it leaks nothing.
- Apple-only accounts set a web password through the claim (D2), and stay Apple accounts.

**Phase 4 — test layers.** L3 `tests/e2e/onboarding-matrix.spec.ts` (548 lines) against an extended stub backend. L4 `playwright.real-backend.config.ts` + `tests/e2e-real/{onboarding.spec.ts,seed.ts}`, run with `npm run test:e2e:real`, covering C1, C3, C4, C7, C11 against a real local backend. L2 lives in voices_backend #1.

**Phase 5 — staging deploy and L5 smoke: not done.** This is the remaining step.

## 6. Decisions (taken 2026-09-14, all implemented)

- **D1: Remove the Artist/Member picker.** One `/sign-in` door; `?as=` ignored. Landing = capabilities + safe `next`.
- **D2: Apple-only DJs set a web password during the claim.** Claim token = inbox proof. A local password sits *alongside* `appleId`; `authProvider` is not flipped, so mobile Apple login is untouched (pinned by a backend test). Guarded by S1: a token plus a new password can never overwrite a password that already exists.
- **D3: Expired links get a self-serve "Email me a new link".** Invited address only, rate-limited, token rotated atomically, old token dead. Triggered by the DJ, so not a data-ops send.
- **D4: On a name collision the DJ picks a variant.** The form keeps what they entered; the server re-checks case- and whitespace-insensitively on every submit, and a collision landing between check and save is reported as `name_taken` too.

⚠️ Naming drift to fix in the backend PR: `D4` labels two unrelated things — the name-collision rules *and* "RadioCult creation is best-effort, ordered last, never blocking". The latter deserves its own ID.

## 7. Gaps

- **C8, C13, C15 have no test at any layer.** C8 (email differing by case or whitespace) is the one with real-world bite: invitations are sent from admin-entered addresses.
- **Phase 5 not started**: nothing deployed to staging, L5 smoke not run.
- **L5 is sign-in only.** Claims can never run against staging — it points at the production backend (F7), so a real claim there would create an Artist and sync to RadioCult.

## 8. Risks

Retired by implementation:

- ~~C9 role downgrade~~ — pinned: an admin claiming an artist stays admin; `user` → `presenter` only.
- ~~Apple login breaking~~ — pinned: the account stays an Apple account after setting a web password.
- ~~D3 as a new unauthenticated email endpoint~~ — rate-limited, invited-address-only, and answers identically whether or not a link exists.
- ~~L4 pointing at the production database~~ — `playwright.real-backend.config.ts` refuses to start unless `E2E_MONGODB_URI` is a `mongodb://` URI on a local host naming a database ending `_e2e`. There is no default to fall back to.

Still live:

- **MEDIUM**: the stub backend drifting from the real one. Mitigated by shared case IDs and L4, but only 5 of 18 cases run against a real backend.
- **MEDIUM**: `account` on `validate` is account enumeration, limited to someone holding a valid token.
- **MEDIUM**: a variant name can still be a near-duplicate that isn't an exact match (`DJ Foo` vs `Foo`). Accepted; the admin artist list surfaces it.
- **LOW**: the two PRs must land together, backend first. The website's claim page reads `account` from `validate`; without the backend, `claimModeFor` falls back to the old `kind` guess (F3).
