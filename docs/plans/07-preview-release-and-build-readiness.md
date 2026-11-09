# Preview, Release, And Build Readiness

## Purpose

This is the final planning gate before implementation. It defines how the redesign can be built and tested live without impacting the current production website, and it records the remaining decisions needed before page build starts.

## Recommended Default

Use a dedicated staging domain as the primary stakeholder testing surface, with branch-based preview deployments for day-to-day review. Preferred staging domain: `test.voicesradio.co.uk`. Keep the production website unchanged until launch. Do not expose unfinished redesign routes on `www.voicesradio.co.uk`, even behind a feature flag.

## Environment Strategy

| Environment | Purpose                                    | Domain                   | Indexing           | Analytics                  | Providers                      |
| ----------- | ------------------------------------------ | ------------------------ | ------------------ | -------------------------- | ------------------------------ |
| Local       | Development and component QA               | `localhost`              | No public indexing | Disabled or debug only     | Test or preview env vars       |
| Preview     | Branch/PR review and implementation QA     | Vercel preview URL       | `noindex,nofollow` | Disabled or test analytics | Production-like read-only data |
| Staging     | Stakeholder QA and final release rehearsal | `test.voicesradio.co.uk` | `noindex,nofollow` | Disabled or test analytics | Production-like read-only data |
| Production  | Current live site until launch             | `www.voicesradio.co.uk`  | Indexable          | Production analytics key   | Production provider config     |

## Route Exposure Strategy

- Default: build redesign work on normal future routes in branch previews and staging only.
- Staging domain target: `test.voicesradio.co.uk`.
- Unfinished redesign routes must not be visible on production, including behind a production feature flag.
- If unfinished redesign work needs isolated URLs before launch, use staging or Vercel preview URLs only.
- Do not replace existing production routes until the launch checklist is complete.
- Keep redirects for legacy routes as a launch task, not a preview task.

## Provider Configuration

All provider values must be environment variables or server-side config, never hardcoded in page components.

| Provider   | Purpose                                                           | Required Config                                                                                                      |
| ---------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Voices API | Artists, shows, featured/latest shows, show detail, artist detail | `VOICES_API_BASE_URL`, optional public read token if required                                                        |
| RadioCult  | KX and East audio streams                                         | Placeholder until confirmed: `RADIOCULT_KX_STREAM_URL`, `RADIOCULT_EAST_STREAM_URL`, plus optional station/embed IDs |
| Restream   | KX and East video streams                                         | Placeholder until confirmed: `RESTREAM_KX_EMBED_URL`, `RESTREAM_EAST_EMBED_URL`, plus optional channel/embed IDs     |
| Sanity     | Blogs and static/editorial CMS content                            | existing Sanity project/dataset vars; preview may use same read-only dataset                                         |
| Analytics  | Product tracking                                                  | deferred for now; disable in preview/staging unless a test provider is explicitly added                              |

## API Readiness Checklist

Before page build starts, confirm these Voices API capabilities:

- Public unauthenticated read access and CORS for `GET /api/shows`, `GET /api/shows/:id`, `GET /api/shows/featured`, `GET /api/artists`, `GET /api/artists/optimized`, and `GET /api/artists/:id`.
- Show list supports `featured`, `artist`, `limit`, and `skip`; it does not support backend `q`, `genre`, or `location`.
- Artist/show detail routes are ID-backed. There are no slug detail endpoints.
- ID-backed public URLs are accepted for launch.
- There is no `/api/genres`; derive genre options from embedded artist/show genre strings and show `metadata.tags`.
- There is no station/location field for radio content; do not enable KX/East location filtering until the backend models it.
- Show endpoints often return raw `artistId`; join artist data separately except where a populated variant exists, such as `GET /api/artists/featured/shows`.
- Associated artist profile image is available after the join when a show has no show image.
- Public show surfaces include `matching_status=matched` shows only. Filter in the adapter unless the backend adds a native filter.
- Show artist links render only when a confirmed `artistId` exists.
- Featured and picked show lists are placeholders for now; isolate source selection behind an adapter.
- Default page sizes: `limit=24` for index grids and `limit=10` for homepage/latest/recent sections.
- Live/current metadata strategy for KX and East, meaning current show, now-playing labels, and schedule state. This may remain on Airtime during launch unless the Voices API provides a replacement.

Initial smoke test on May 27, 2026 confirmed unauthenticated `GET /api/shows?limit=1` and `GET /api/artists/optimized` return `200` with `access-control-allow-origin: *`. Continue to smoke-test exact endpoints during implementation.

Build routes against MongoDB ObjectId strings for launch. Backend slugs can be requested later as a product/SEO improvement, but frontend implementation must not depend on slugs existing.

## Image Fallback Readiness

Implementation must use this order everywhere a show image is needed:

1. Show-specific image.
2. Associated artist profile image.
3. Branded fallback artwork: `public/VOICESLOGO_LIGHTBOX.png`.

Alt-text rules:

- Show image: describe the show.
- Artist fallback image: describe the artist/host and note the show context in nearby text, not necessarily in the alt.
- Branded fallback: use decorative empty alt unless it conveys unique content.

Open Graph image rules:

- Show detail pages use the same fallback order.
- Index pages use branded route-level Open Graph images unless a featured image is explicitly provided.

## Media Testing Plan

Test provider behavior in preview before production promotion:

- KX RadioCult audio loads, plays, pauses/stops, and recovers from failure.
- East RadioCult audio loads, plays, pauses/stops, and recovers from failure.
- KX Restream video loads, enters/exits fullscreen, pauses, and shows fallback when unavailable.
- East Restream video loads, enters/exits fullscreen, pauses, and shows fallback when unavailable.
- Mobile Safari and Chrome handle autoplay restrictions gracefully.
- Playback failure does not crash navigation or route transitions.
- Provider requests do not expose private tokens in the client bundle.

Note: preview playback may count as a listener/view in RadioCult or Restream. This is acceptable for QA as long as it does not change the current production website UI or analytics.

## SEO And Indexing Guardrails

- Preview and staging deployments must emit `noindex,nofollow`.
- Preview and staging sitemap routes should be disabled or non-indexable.
- Production remains indexable only for current live routes until launch.
- Launch requires route-level metadata for Home, Discover, Shows, Show Detail, Artists, and Artist Detail.
- Open Graph fallbacks must exist before launch.

## Analytics Guardrails

- Analytics must be behind a provider-agnostic helper.
- Preview and staging use disabled analytics by default.
- Production analytics key must never be used on public preview URLs.
- Do not send PII, raw free-text messages, auth tokens, or full search query text unless explicitly approved.
- Monitoring, analytics provider choice, and consent behavior are deferred until explicitly picked later.

## Build Readiness Gate

Do not start page implementation until these are true:

- `docs/plans/00-foundations-shell-player-navigation.md` is accepted as the foundation build order.
- Voices API public read contract is confirmed for artists and shows.
- ID-backed route strategy is confirmed for shows and artists.
- Matched-only public show filtering is implemented or tracked.
- Client/adapter-side genre derivation is implemented or tracked.
- Artist joins for show fallback images are implemented or tracked.
- Featured/picked show source is isolated behind an adapter placeholder.
- RadioCult KX/East audio config values are available for local/preview.
- Restream KX/East video config values are available for local/preview.
- Branded fallback artwork is available at `public/VOICESLOGO_LIGHTBOX.png`.
- Preview environment variables are separated from production variables.
- Preview deployments are confirmed as `noindex`.
- Staging is configured at `test.voicesradio.co.uk` or the final staging domain.
- Analytics is disabled for preview/staging unless a test provider is explicitly configured.

## Launch Gate

Do not promote the redesign branch to production until these are true:

- `npm run lint` passes.
- `npm run build` passes.
- Visual QA passes at `320px`, `390px`, `768px`, `1024px`, `1280px`, and `1440px`.
- Manual provider smoke tests pass for KX/East audio and KX/East video.
- API empty/error states are checked.
- Accessibility checks pass for keyboard, focus, labels, contrast, reduced motion, and screen-reader basics.
- SEO metadata and Open Graph images are verified.
- Analytics events are skipped until monitoring is added, or verified with preview/test analytics only if analytics has been configured by launch.
- Rollback path is documented as redeploying/promoting the previous production deployment.

## Open Decisions To Confirm

- Exact RadioCult config shape for KX and East; placeholders are acceptable until implementation wiring.
- Exact Restream config shape for KX and East; placeholders are acceptable until implementation wiring.
- Whether Voices API will eventually provide current show / now-playing / schedule metadata or whether Airtime remains during launch.
- Whether backend should add slug, station/location, show search, and genre filters after launch.
- Whether backend should add a native `matching_status=matched` filter and populated artist option on show list/detail endpoints.
- Whether backend should add first-class featured/picked show collections or ordering.
- Final analytics provider, monitoring, and consent behavior; deferred for now.

## Definition Of Done

- [ ] Preview strategy is documented and accepted.
- [ ] Provider environment variables are named and separated by environment.
- [ ] API readiness checklist is confirmed or tracked as blockers.
- [ ] Image fallback and alt-text behavior are implementation-ready.
- [ ] Live media smoke-test plan covers KX/East audio and video.
- [ ] SEO/indexing and analytics guardrails are documented.
- [ ] Launch and rollback gates are explicit.
