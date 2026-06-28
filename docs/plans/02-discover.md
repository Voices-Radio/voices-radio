# Explore Hub

## Route And Intent

- Route: `/explore`; `/discover` redirects to `/explore`.
- Page purpose: provide the central exploration hub for shows, featured content, curated rails, filters, and genre browsing.
- User goal: browse curated and filtered show rails, then open show details or artist pages.
- Primary CTA: Search/browse discovery content.
- Secondary CTAs: Hosts tab, Series tab, genre filter apply, show/artist card links.

## Figma Sources

| Surface                   | Node                                                      |
| ------------------------- | --------------------------------------------------------- |
| Mobile discover home      | `iPhone 16 Discover Home` / `509:5121`                    |
| Mobile genres expanded    | `iPhone 16 Discover Home - Genres Expanded` / `1055:2955` |
| Mobile genres active      | `iPhone 16 Discover Home - Genres Active` / `1059:3236`   |
| Mobile genre results      | `iPhone 16 Genres Result` / `583:6641`                    |
| Desktop discover explore  | `Discover - Desktop Explore` / `1159:14689`               |
| Genre component examples  | `Genre Row / Ambient / New Age` / `489:280`               |
| Genre component examples  | `Genre Row / House / Techno` / `489:989`                  |
| Sub-genre toggle examples | `Sub-Genre Toggle / Fourth World` / `597:230`             |

## Required Sections And Components

- Header/search:
  - Active route label: `Explore`.
  - Tabs: `Shows`, `Artists`; Series is out of scope for this phase.
  - Search input placeholder: `Search hosts, shows, genres...`.
- Filters:
  - Filter label: `FILTERS:`.
  - Primary groups: `GENRES`, `LOCATION`.
  - Location chips `KX`, `EAST`, `LONDON`, and `WORLD` map to explicit show `station` and `locationTags` metadata when available.
  - Genre expansion with multi-select and `APPLY`.
  - Genre rows can expand/collapse visually; actual genre options come from embedded artist/show genre strings because there is no `/api/genres` endpoint.
- Featured content:
  - Copy describes editorially picked notable shows.
  - Picked/featured show ownership comes from CMS/API-curated website rails, with adapter fallback while the backend endpoint is pending.
  - Cards expose location, date, city, title, genres, and detail link.
- Results:
  - Genre result view supports `ON AIR` and `LIVE NOW` labels.
  - Multiple selected genres narrow results.
- Footer:
  - Use shared app footer.

## Data Contract

- Voices API:
  - `GET /api/artists` or `GET /api/artists/optimized` for artist discovery.
  - `GET /api/shows?featured=true&limit=...&skip=...` and `GET /api/shows/featured` for featured/latest shows.
  - `GET /api/artists/featured/shows` where populated artist data is needed for show-card fallbacks.
  - Public show results include `matching_status=matched` shows only after adapter filtering.
  - Default show result page size: `24`.
  - No backend search endpoint for shows; implement client-side search/filtering over fetched/normalized datasets for the first build.
  - No `/api/genres`; derive genre options from embedded `genres`/`metadata.tags` values.
  - Planned station/location fields: `station: "kx" | "east" | "both" | "unknown"` and `locationTags: string[]`.
  - Planned website rails endpoint: `GET /api/website/rails`.
- RadioCult:
  - Audio provider context for KX/East live labels where a result can launch live playback.
- Restream:
  - Video provider context for KX/East live labels where a result can launch live video.
- Airtime:
  - Legacy live state for `ON AIR` / `LIVE NOW` labels only if still needed before the Voices API provides live metadata.
- Sanity:
  - Optional editorial copy for featured Discover intro if this should be CMS-editable.
- Static/local:
  - Search/filter icons and fallback no-results illustration or copy.

## Required States

- Loading: search results and featured rows use skeleton cards.
- Empty: no search/filter results shows clear reset-filters action.
- Error: failed search/filter request keeps selected filters visible and offers retry.
- Missing image: show result cards use show image first, associated artist profile image second, and branded fallback artwork last; artist result cards use artist profile image first and branded fallback second.
- Long content: genre names, show titles, and host names wrap within card constraints.
- Offline/unavailable: live labels disappear or show neutral unavailable state when live metadata is unavailable.

## Responsive Requirements

- `320px`: filters stack vertically; search input remains full width.
- `390px`: match mobile Discover frame, including tabs and filter order.
- `768px`: allow two-column card/result layout if card text remains stable.
- `1024px`: filters and results can sit in desktop layout.
- `1280px`: match desktop Discover Explore frame width.
- `1440px`: maintain readable line lengths and bounded grid columns.

## Accessibility Requirements

- Search input has a visible label or accessible label.
- Tabs use semantic tab or navigation behavior consistently.
- Filter chips expose selected state with `aria-pressed` or equivalent.
- `APPLY` is disabled only when no valid filter change exists.
- Result counts or no-results messages are announced after filter/search changes.
- Red/live states include text labels.

## SEO Requirements

- Title pattern: `Discover Shows and Artists | Voices Radio`.
- Description should mention discovering Voices Radio shows, hosts, artists, and genres.
- Canonical: `/explore`.
- Open Graph image: branded Discover/default artwork.
- Structured data: `WebPage`; search action can be added globally once search is production-ready.

## Analytics Events

| Event                            | Trigger                          | Properties                                     |
| -------------------------------- | -------------------------------- | ---------------------------------------------- |
| `discover_search_submitted`      | Search submitted                 | `query_length`, `result_count`                 |
| `discover_tab_clicked`           | Hosts/Series tab selected        | `selected_tab`                                 |
| `discover_filter_opened`         | Genre filter opened              | `filter_group`                                 |
| `discover_filter_applied`        | Filters applied                  | `filter_group`, `filter_count`, `result_count` |
| `discover_result_clicked`        | User opens show or artist result | `result_type`, `item_id`, `position`           |
| `discover_featured_card_clicked` | User opens featured card         | `show_id`, `position`                          |

## Definition Of Done

- [ ] `/explore` is implemented as the hub route and `/discover` redirects.
- [ ] Shows and Artists tabs route consistently with `/explore` and `/artists`; Series remains out of scope.
- [ ] Search, derived genre filters, featured cards, and result states are implemented.
- [ ] Voices API powers fetched content; search/facets are normalized or derived in the adapter where backend support is missing.
- [ ] Public show results filter to `matching_status=matched`.
- [ ] Picked/featured show ownership is isolated behind the website rails adapter.
- [ ] KX/East/London/World filters use explicit metadata when backend fields exist and gracefully fall back otherwise.
- [ ] Show result artwork uses the show-image -> artist-profile-image -> branded-fallback order.
- [ ] Empty/error/missing-image/long-content states are covered.
- [ ] Responsive, accessibility, SEO, and analytics requirements are met.
