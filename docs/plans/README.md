# Voices Radio Redesign Page Plans

This folder contains build-ready plans for the Figma-backed redesign surfaces only. Use these plans alongside:

- Checklist / Definition of Done: `docs/voices_radio_website_design_to_build_checklist.md`
- Backend/API contract: `docs/VOICES_RADIO_API_DOCUMENTATION.md`
- Project memory: `docs/project-memory/`
- Figma file: `Voices Design`, file key `l6q9EXNRODwoRdI8vRXEHp`

## Planning Rules

- Figma is the design source of truth.
- Voices API owns radio data such as artists, shows, genres, featured states, archive/platform metadata, and related discovery data.
- RadioCult owns audio streaming for both KX and East.
- Restream owns video streaming for both KX and East.
- Airtime remains a possible legacy metadata/schedule source only where the current implementation still depends on it; do not assume Airtime owns the redesigned audio stream.
- Sanity owns blogs and static/editorial CMS content.
- Show artwork fallback order is: show image, then associated artist profile image, then branded fallback artwork.
- Public detail routes use MongoDB ObjectId strings: `/shows/[id]` and `/artists/[id]`. The backend does not currently expose slugs.
- Public show lists should include matched shows only. Pending/manual-unmatched shows should not appear publicly unless explicitly curated later.
- Genres are embedded string arrays on artists/shows and must be derived in the frontend adapter.
- KX/East are explicit station metadata for redesigned show and artist filtering. Until the backend ships `station` and `locationTags`, filters render with graceful frontend fallbacks.
- These plans do not include Events, Studio Booking, Membership, News/Blog, Contact, Privacy, Terms, or Cookies because those are not clearly represented in the inspected Figma prototype frames.
- `/explore` is the hub route. `/discover` redirects to `/explore`. `/shows`, `/shows/[id]`, `/artists`, and `/artists/[id]` are linked content routes.

## Plan Index

1. [Foundations, Shell, Player, Navigation](./00-foundations-shell-player-navigation.md)
2. [Home](./01-home.md)
3. [Discover Hub](./02-discover.md)
4. [Shows Index](./03-shows-index.md)
5. [Show Detail](./04-show-detail.md)
6. [Artists Index](./05-artists-index.md)
7. [Artist Detail](./06-artist-detail.md)
8. [Preview, Release, And Build Readiness](./07-preview-release-and-build-readiness.md)
9. [Build Assumptions And Placeholders](./08-build-assumptions-and-placeholders.md)
10. [Future Page Plan Template](./_page-plan-template.md)

## Shared Figma Sources

| Area                   | Node                                        |
| ---------------------- | ------------------------------------------- |
| Prototype Mobile page  | `Prototype Mobile` / `304:224`              |
| Prototype Desktop page | `Prototype Desktop` / `1159:14688`          |
| Desktop home           | `Desktop Home` / `1159:15647`               |
| Desktop explore        | `Discover - Desktop Explore` / `1159:14689` |
| Desktop artists        | `Discover - Artists` / `1159:14825`         |
| Design system page     | `Design System` / `37:14`                   |
| Component library page | `Component Library` / `48:1265`             |
| Design guide frame     | `Design Guide` / `41:14`                    |
| Typography frame       | `Typography` / `35:836`                     |
| Brand assets frame     | `Brand Assets` / `151:3813`                 |
| Card component set     | `Card` / `367:3703`                         |
| Host card component    | `Host card` / `411:3486`                    |

## Implementation Order

1. Build shared foundations first.
2. Build Home second because it validates player, header, latest-shows carousel, footer, and app CTA patterns.
3. Build Discover third because it validates search, filters, tabs, genre rows, and card grids.
4. Build Shows and Artists indexes from the Discover primitives.
5. Build Show Detail and Artist Detail once normalized API adapters exist.
6. Use the preview/release readiness plan as the final gate before merging redesign work into production.

## Backend Defaults For Build

- Detail links use `_id` route params.
- Default index page size: `limit=24`.
- Default homepage/latest page size: `limit=10`.
- Public show queries filter to `matching_status=matched` in the adapter after fetch unless the backend adds a native filter.
- Show cards link artist profiles only when a confirmed `artistId` exists.
- Featured and picked show lists are CMS/API-curated website rails. The frontend adapter falls back to latest matched shows until `GET /api/website/rails` is available.
- Apply-for-a-show links to the confirmed Google Form. Become-a-Supporter remains disabled until a destination is provided.

## Safe Live Testing Strategy

- Develop and QA the redesign on branch-based preview deployments, not the production domain.
- Use a dedicated staging domain, preferred: `test.voicesradio.co.uk`.
- Keep production routes unchanged until launch; unfinished redesign routes should not be visible on production behind feature flags.
- Configure preview and staging deployments with `noindex` headers/meta and disabled or test analytics.
- Use read-only production-like data from Voices API, RadioCult, Restream, and Sanity; do not run content mutations from the public website preview.
- Store provider URLs and IDs in environment variables so preview, staging, and production can be switched independently.
- Test RadioCult audio and Restream video in preview first; playback may count as a listener/view but should not alter the current website UI.
- Only promote to production after visual QA, provider smoke tests, analytics guardrail checks, accessibility checks, and rollback notes are complete.

## Verification For This Folder

- Every page plan references at least one concrete Figma node.
- Every page plan includes data, state, responsive, accessibility, SEO, analytics, and DoD sections.
- No non-Figma-backed page plan exists in this folder.
- Preview, provider, API, analytics, SEO, launch, and rollback decisions are captured before build starts.
- `npx prettier --check docs/plans/*.md` passes.
