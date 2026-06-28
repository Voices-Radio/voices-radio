# Artist Detail

## Route And Intent

- Route: `/artists/[id]`
- Page purpose: present a single host/artist profile with bio, genres, social links, and recent episodes/shows.
- User goal: learn about the artist and listen to their recent episodes.
- Primary CTA: Play recent episode or view show detail.
- Secondary CTAs: Read more, external social links, browse related shows.

## Figma Sources

| Surface              | Node                                                     |
| -------------------- | -------------------------------------------------------- |
| Mobile host profile  | `Host LP` / `304:451`                                    |
| Desktop host profile | `Discover - Desktop Host Profile - Scalable` / `780:224` |
| Host card component  | `Host card` / `411:3486`                                 |
| Card component set   | `Card` / `367:3703`                                      |
| Mobile audio player  | `Audio Player Bar` / `305:546`                           |

## Required Sections And Components

- Profile header:
  - Artist display name, hero/profile image, optional banner, and any type/location labels only where reliable data exists.
- Bio:
  - Intro copy with `(Read more)` expansion for long bios.
  - Social links if present.
- Genres:
  - `Most played genres` with tag chips.
- Recent episodes:
  - Cards with date, episode/show title, genres, and play/detail action.
  - Station/location labels render only where supplied by live/provider config or editorial mapping.
  - Episode play opens shared archive player.
- Footer:
  - Shared app footer.

## Data Contract

- Voices API:
  - `GET /api/artists/:id` for artist detail. There is no slug detail endpoint.
  - Normalize `_id` to `id`.
  - Artist fields include `name`, `bio`, `imageUrl`, `bannerUrl`, `genres`, `aliases`, `socialLinks`, `featured`, active status, and platform usernames.
  - `GET /api/artists/:artistId/shows` or `GET /api/shows?artist=:id&limit=...` for recent episodes/shows, including platform/archive metadata and artwork.
  - Recent episodes should filter to `matching_status=matched` before rendering publicly.
  - Default recent episode limit: `10`.
  - Most-played genres can come from artist genres or aggregated show metadata.
- Airtime/stream:
  - Optional live/currently-on-air state for this artist.
- Sanity:
  - No required launch dependency.
- Static/local:
  - Fallback profile image, social icons, and platform icons.

## Required States

- Loading: profile header and recent episodes skeletonize independently.
- Empty: no recent episodes shows a quiet empty state and link back to `/shows`.
- Error: invalid or missing ID returns Next not-found; transient API failure shows retry/error route state.
- Missing image: profile and episode cards use branded fallbacks.
- Long content: artist names, bios, and episode titles clamp or expand intentionally.
- Offline/unavailable: social/platform links render only when present and valid.

## Responsive Requirements

- `320px`: profile content is single-column; bio expansion is reachable.
- `390px`: match mobile Host LP frame.
- `768px`: recent episodes can move to two-column grid if stable.
- `1024px`: desktop host profile layout begins.
- `1280px`: match desktop Host Profile frame.
- `1440px`: profile and episodes remain bounded with readable line lengths.

## Accessibility Requirements

- Artist name is the page H1.
- `(Read more)` is a real button with expanded state.
- Social links include platform and artist name in accessible labels.
- Episode play controls include episode/show title.
- Genre chips are readable text and not color-only.
- Focus moves predictably when mini-player opens.

## SEO Requirements

- Title pattern: `{Artist Name} | Voices Radio`.
- Description should use artist bio or generated fallback with genres/shows.
- Canonical: `/artists/[id]`.
- Open Graph image: artist image/banner with branded fallback.
- Structured data: optional `Person` or `MusicGroup` only when data quality is reliable; otherwise use `ProfilePage`/`WebPage`.

## Analytics Events

| Event                         | Trigger                     | Properties                            |
| ----------------------------- | --------------------------- | ------------------------------------- |
| `artist_detail_viewed`        | Artist page loads with data | `artist_id`                           |
| `artist_bio_expanded`         | Read-more button clicked    | `artist_id`                           |
| `artist_episode_play_clicked` | Recent episode starts       | `artist_id`, `episode_id`, `platform` |
| `artist_show_clicked`         | Linked show opened          | `artist_id`, `show_id`, `position`    |
| `artist_social_clicked`       | Social link clicked         | `artist_id`, `platform`               |

## Definition Of Done

- [ ] `/artists/[id]` renders from a normalized Voices API artist adapter.
- [ ] Invalid IDs and API failures are handled differently.
- [ ] Bio, genres, socials, and recent episodes degrade gracefully when missing.
- [ ] Recent episodes filter to `matching_status=matched` and default to `limit=10`.
- [ ] Shared archive player opens from playable recent episodes.
- [ ] Empty/error/missing-image/long-content states are covered.
- [ ] Responsive, accessibility, SEO, and analytics requirements are met.
