# Build Assumptions And Placeholders

Track build-time assumptions here so they can be replaced deliberately rather than becoming invisible product decisions.

## Active Placeholders

- `NEXT_PUBLIC_RADIOCULT_KX_STREAM_URL`: placeholder until the exact RadioCult KX config is supplied.
- `NEXT_PUBLIC_RADIOCULT_EAST_STREAM_URL`: placeholder until the exact RadioCult East config is supplied.
- `NEXT_PUBLIC_RESTREAM_KX_EMBED_URL`: placeholder until the exact Restream KX config is supplied.
- `NEXT_PUBLIC_RESTREAM_EAST_EMBED_URL`: placeholder until the exact Restream East config is supplied.
- Featured/picked shows are isolated behind an adapter placeholder until editorial/backend ownership is finalized.
- Home KX/East rails currently split the shared matched latest-shows feed until station-specific metadata or editorial rail IDs exist.
- The supporter CTA has no destination yet and must render disabled or inert until a membership/support route or provider is confirmed.
- The apply-for-a-show CTA links to `https://docs.google.com/forms/d/e/1FAIpQLSdlV09iFlcP2_n6ldRsSUoeZclzJpb0AMY4F2rrXUpC7jueZQ/viewform`.
- Monitoring, analytics provider, and consent behavior are deferred.

## Current Build Assumptions

- Desktop home uses `Desktop Home` / `1159:15647` as the large-screen source of truth.
- The requested `Hi-Fi Wireframes → Desktop Home Versions` far-right option is not currently visible in the Figma MCP page list; switch to that node once its ID is supplied or MCP access exposes it.
- Mobile home continues to use `Prototype Mobile` frames, especially `iPhone 16 v.3 - start` / `984:2214`.
- Voices API base URL defaults to `https://api.voicesradio.co.uk` through `VOICES_API_BASE_URL`.
- Public routes use MongoDB ObjectId params: `/shows/[id]` and `/artists/[id]`.
- Public show surfaces render only `matching_status=matched` shows.
- Show list requests over-fetch up to `limit * 3` before applying the matched-only filter, capped at `100`, because the current API does not expose a `matching_status` query filter.
- Genres are derived from embedded artist/show genre strings and show `metadata.tags`.
- KX/East are stream/provider concepts, not Voices API location fields.
- Show artwork fallback order is show image, associated artist profile image, then `public/VOICESLOGO_LIGHTBOX.png`.
- Airtime remains the live/current metadata source for now-playing and schedule until Voices API provides a replacement.
- Default page sizes are `limit=24` for index grids and `limit=10` for homepage/latest/recent sections.
