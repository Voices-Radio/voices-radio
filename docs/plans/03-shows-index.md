# Shows Index

## Route And Intent

- Route: `/shows`
- Page purpose: list all series/shows with search, filters, live labels, and direct paths to show detail pages.
- User goal: find a series/show to listen to, inspect, or follow.
- Primary CTA: View show details.
- Secondary CTAs: Search, filter by derived genre, play latest/archive item where supported.

## Figma Sources

| Surface                | Node                                     |
| ---------------------- | ---------------------------------------- |
| Mobile series          | `Discover - Mobile Series` / `509:5045`  |
| Desktop series         | `Discover - Desktop Series` / `693:9617` |
| Desktop series variant | `Discover - Desktop Series` / `709:4066` |
| Mobile genre results   | `iPhone 16 Genres Result` / `583:6641`   |
| Card component set     | `Card` / `367:3703`                      |

## Required Sections And Components

- Header/search:
  - Uses Discover-style header, `Hosts`/`Series` tabs, search input, and filters.
  - `Series` is active.
- Show list/grid:
  - Cards expose date or latest episode date, show title, genres, and live/archive labels.
  - KX/East labels may be displayed only when supplied by live/provider config or editorial mapping; they are not Voices API location fields.
  - Cards route to `/shows/[id]`.
  - If a latest episode is playable, use shared archive-player behavior.
- Filters:
  - Derived genre filters match Discover behavior.
  - Location filters are hidden/disabled until the backend models station/location.
  - Supports selected-filter summary and reset.
- Footer:
  - Shared app footer.

## Data Contract

- Voices API:
  - `GET /api/shows` supports `featured`, `artist`, `limit`, and `skip`.
  - `GET /api/shows/:id` is the detail endpoint. There is no `GET /api/shows/:slug`.
  - `GET /api/shows/featured` exists for featured shows.
  - `GET /api/artists/featured/shows` exists and includes populated artist data useful for image fallback.
  - Normalize `_id` to `id`; do not require `slug`.
  - Show list fields include `title`, `description`, `imageUrl`, `artistId`, `featured`, `platform`, `mixcloudUrl`, `soundcloudUrl`, `url`, `date`/`show_date`/`upload_date`, `metadata.tags`, and archive metadata.
  - No backend show search, genre filter, or location filter exists; implement client-side search/genre filtering over fetched data for MVP.
  - Join artist data by `artistId` where the endpoint does not populate artist, so show artwork can fall back to artist profile image.
  - Public lists include `matching_status=matched` shows only. Filter in the adapter after fetch unless the backend adds a native filter.
  - Default page size: `limit=24`.
- RadioCult:
  - Audio provider context for KX/East live show playback.
- Restream:
  - Video provider context for KX/East live show playback.
- Airtime:
  - Optional legacy live-state enrichment for currently airing shows until the Voices API provides this.
- Sanity:
  - No required launch dependency unless index intro copy is CMS-managed.
- Static/local:
  - Fallback artwork and icons.

## Required States

- Loading: show grid uses stable skeleton cards.
- Empty: no shows found includes clear reset/search-empty message.
- Error: list failure includes retry and preserves search/filter state.
- Missing image: cards use show image first, associated artist profile image second, and branded fallback artwork last.
- Long content: titles and genre tags clamp without changing card grid dimensions.
- Offline/unavailable: hide or neutralize live labels when live enrichment fails.

## Responsive Requirements

- `320px`: single-column list, filter controls stacked.
- `390px`: match mobile Series frame.
- `768px`: two-column grid where card density remains readable.
- `1024px`: desktop filter/result layout begins.
- `1280px`: match desktop Series frame.
- `1440px`: use max-width grid with stable column count.

## Accessibility Requirements

- Cards are links with descriptive labels.
- Live/archive badges are text-backed.
- Filters are keyboard operable and expose selected state.
- Search results update should be announced.
- Images use show-specific alt text when using show artwork, artist-specific alt text when using artist profile fallback, or empty/decorative alt for branded fallback artwork.

## SEO Requirements

- Title pattern: `Shows | Voices Radio`.
- Description should mention browsing Voices Radio series/shows and genres.
- Canonical: `/shows`.
- Open Graph image: branded default or Discover/Shows artwork.
- Structured data: `CollectionPage`; avoid individual show schema on the index unless reliable.

## Analytics Events

| Event                       | Trigger                       | Properties                                     |
| --------------------------- | ----------------------------- | ---------------------------------------------- |
| `shows_search_submitted`    | Shows search submitted        | `query_length`, `result_count`                 |
| `shows_filter_applied`      | Derived genre filters applied | `filter_group`, `filter_count`, `result_count` |
| `show_card_clicked`         | Show card opened              | `show_id`, `position`, `source`                |
| `show_archive_play_clicked` | Play action from show card    | `show_id`, `episode_id`, `position`            |

## Definition Of Done

- [ ] `/shows` uses the Series Figma design and shared Discover primitives.
- [ ] Show cards route to `/shows/[id]`.
- [ ] Voices API powers show list and archive metadata using existing ID-backed endpoints.
- [ ] Public show lists filter to `matching_status=matched`.
- [ ] Index requests use `limit=24` by default.
- [ ] Search and genre facets are derived client-side or adapter-side because backend support is missing.
- [ ] Location filtering is not enabled until the backend models station/location.
- [ ] Show artwork uses the show-image -> artist-profile-image -> branded-fallback order.
- [ ] Live-state enrichment does not block base list rendering.
- [ ] Empty/error/missing-image/long-content states are covered.
- [ ] Responsive, accessibility, SEO, and analytics requirements are met.
