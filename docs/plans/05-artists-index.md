# Artists Index

## Route And Intent

- Route: `/artists`
- Page purpose: list hosts/artists/residents with search, filters, alphabet navigation, and profile links.
- User goal: find a host or resident and open their profile.
- Primary CTA: View profile.
- Secondary CTAs: Search hosts, filter by derived genre/type where reliable, browse A-Z.

## Figma Sources

| Surface              | Node                                   |
| -------------------- | -------------------------------------- |
| Mobile hosts         | `iPhone 16 Hosts` / `509:5073`         |
| Desktop hosts        | `Discover - Artists` / `1159:14825`    |
| Alphabet component   | `Alphabets` / `583:6638`               |
| Host card component  | `Host card` / `411:3486`               |
| Mobile discover home | `iPhone 16 Discover Home` / `509:5121` |

## Required Sections And Components

- Header/search:
  - Page uses Explore-style tab and filter layout.
  - Tabs: `Shows` links to `/explore`; `Artists` is active. Series is out of scope.
  - Search input supports hosts, shows, genres text but this page scopes results to artists/hosts.
- Filters:
  - Location chips `KX`, `EAST`, `LONDON`, and `WORLD` map to explicit artist `station` and `locationTags` metadata when available.
  - Artists, presenters, and hosts are the same website entity and use all active API artist data.
  - A-Z selector using alphabet component.
- Artist grid/list:
  - Cards expose image, name, and `View profile`.
  - Type/location/station labels render from explicit metadata when reliable, with visual-safe fallbacks while backend fields are pending.
  - Cards route to `/artists/[id]`.
- Footer:
  - Shared app footer.

## Data Contract

- Voices API:
  - `GET /api/artists` and `GET /api/artists/optimized` exist. The optimized response may be cached and should be normalized whether it returns an array or an `items` wrapper.
  - Normalize `_id` to `id`; do not require `slug`.
  - Artist fields include `name`, `bio`, `imageUrl`, `bannerUrl`, `genres`, `aliases`, `socialLinks`, `featured`, active status, and platform usernames.
  - Planned explicit fields: `station: "kx" | "east" | "both" | "unknown"` and `locationTags: string[]`.
  - Global A-Z ordering is derived from artist names.
  - Default page size if pagination is added locally or server-side: `limit=24`.
- Airtime/stream:
  - Optional live enrichment for currently airing hosts.
- Sanity:
  - No required launch dependency.
- Static/local:
  - Fallback profile image and alphabet control labels.

## Required States

- Loading: grid and alphabet/filter sections preserve layout.
- Empty: no artists found includes reset/search-empty message.
- Error: API failure offers retry and preserves query/filter UI.
- Missing image: host cards use branded fallback.
- Long content: names and any available type/location labels wrap or clamp without card shift.
- Offline/unavailable: live enrichment failure does not block artist list.

## Responsive Requirements

- `320px`: single-column cards and compact filters.
- `390px`: match mobile Hosts frame.
- `768px`: two-column card grid where stable.
- `1024px`: desktop hosts layout begins with more visible filters.
- `1280px`: match desktop Hosts frame.
- `1440px`: bounded grid with stable card dimensions.

## Accessibility Requirements

- Alphabet navigation is keyboard operable and announces disabled/unavailable letters.
- Artist cards have descriptive link labels.
- Filter selected states are programmatic and visual.
- Search result count or no-results state is announced.
- Profile images use artist names in alt text unless decorative.

## SEO Requirements

- Title pattern: `Artists and Hosts | Voices Radio`.
- Description should mention discovering Voices Radio hosts, residents, and artists.
- Canonical: `/artists`.
- Open Graph image: branded default or artists index artwork.
- Structured data: `CollectionPage`; avoid individual `Person` schema on the index.

## Analytics Events

| Event                       | Trigger                 | Properties                                     |
| --------------------------- | ----------------------- | ---------------------------------------------- |
| `artists_search_submitted`  | Artist search submitted | `query_length`, `result_count`                 |
| `artists_filter_applied`    | Artist filters applied  | `filter_group`, `filter_count`, `result_count` |
| `artists_alphabet_selected` | A-Z letter selected     | `letter`, `result_count`                       |
| `artist_card_clicked`       | Artist card opened      | `artist_id`, `position`, `source`              |

## Definition Of Done

- [ ] `/artists` uses the Hosts Figma design and shared Discover primitives.
- [ ] Artist cards route to `/artists/[id]`.
- [ ] Voices API powers artist list using existing ID-backed endpoints.
- [ ] Artist index uses `limit=24` as the default page/grid size where pagination is present.
- [ ] Location filtering is not enabled until the backend models station/location.
- [ ] Alphabet navigation handles unavailable letters.
- [ ] Empty/error/missing-image/long-content states are covered.
- [ ] Responsive, accessibility, SEO, and analytics requirements are met.
