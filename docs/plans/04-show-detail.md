# Show Detail

## Route And Intent

- Route: `/shows/[id]`
- Page purpose: present a single show/series with its identity, genres, location, description, tracklist/archive content, and playable episodes.
- User goal: understand the show and listen back to episodes.
- Primary CTA: Play latest/archive episode.
- Secondary CTAs: View host/artist profile, browse related shows, return to Discover/Shows.

## Figma Sources

| Surface                    | Node                                    |
| -------------------------- | --------------------------------------- |
| Mobile show detail         | `Show LP` / `304:528`                   |
| Desktop show detail        | `Discover - Desktop Show` / `777:6506`  |
| Mobile audio player        | `Audio Player Bar` / `305:546`          |
| Mobile audio player paused | `Audio Player Bar - Paused` / `309:501` |
| Card component set         | `Card` / `367:3703`                     |

## Required Sections And Components

- Header:
  - Show title and genre tags.
  - Station/location labels such as `KX` and `LONDON` render only when supplied by live/provider config or editorial mapping; the Voices API does not currently model show location.
  - Artwork uses the show image first, associated artist profile image second, and branded fallback artwork last.
- Description:
  - Long-form show copy with expanded/clamped behavior if needed.
- Archive/tracklist:
  - Tracklist rows using numeric positions.
  - Episode/archive embeds or playable archive cards.
  - Shared mini-player appears after play.
- Related navigation:
  - Host/artist link if show has associated artist profile.
  - Related shows or back-to-series link if data exists.
- Footer:
  - Shared app footer.

## Data Contract

- Voices API:
  - `GET /api/shows/:id` for show detail. There is no slug detail endpoint.
  - Normalize `_id` to `id`.
  - Show detail fields include `title`, `description`, `imageUrl`, `artistId`, `platform`, `mixcloudUrl`, `soundcloudUrl`, `url`, `date`/`show_date`/`upload_date`, `featured`, `metadata.tags`, and archive metadata.
  - Fetch artist separately by `artistId` when needed for artist link and artist profile image fallback.
  - Public detail pages render only when the show is `matching_status=matched`; otherwise return not-found unless explicitly curated later.
  - Link artist profiles only when a confirmed `artistId` exists.
  - Tracklist if available. If not available, tracklist section must be omitted rather than faked.
  - Related shows can use `GET /api/shows?artist=:id&limit=...` when `artistId` exists; otherwise omit related shows.
- RadioCult:
  - Audio provider context if this show maps to live KX/East playback.
- Restream:
  - Video provider context if this show maps to live KX/East playback.
- Airtime:
  - Legacy live enrichment only if this show is currently airing and no Voices API live metadata exists yet.
- Sanity:
  - No required launch dependency.
- Static/local:
  - Fallback artwork and platform icons.

## Required States

- Loading: detail hero and archive section skeletonize independently.
- Empty: no archive episodes shows a clear no-episodes message.
- Error: invalid or missing ID returns Next not-found; transient API failure shows retry/error route state.
- Missing image: show hero uses associated artist profile image first and branded fallback artwork last.
- Long content: show title, description, and tracklist rows wrap without overlap.
- Offline/unavailable: unavailable archive embeds show fallback links when possible.

## Responsive Requirements

- `320px`: single-column detail; tracklist rows remain readable.
- `390px`: match mobile Show LP frame.
- `768px`: allow wider hero/content spacing while preserving readable line length.
- `1024px`: desktop show layout begins.
- `1280px`: match desktop Show frame.
- `1440px`: content is bounded; archive cards do not stretch excessively.

## Accessibility Requirements

- Show title is the page H1.
- Play controls have labels containing the show or episode title.
- Tracklist uses semantic list/table-like structure where appropriate.
- Platform embeds have titles and fallback links.
- Missing or decorative images are handled with correct alt text.
- Focus moves predictably when mini-player opens.

## SEO Requirements

- Title pattern: `{Show Title} | Voices Radio`.
- Description should use show description or a generated fallback with genres/host.
- Canonical: `/shows/[id]`.
- Open Graph image: show artwork, then associated artist profile image, then branded fallback.
- Structured data: `MusicRadioStation` is global only; use `WebPage` plus optional `AudioObject` only when archive metadata is reliable.

## Analytics Events

| Event                        | Trigger                                   | Properties                               |
| ---------------------------- | ----------------------------------------- | ---------------------------------------- |
| `show_detail_viewed`         | Detail page loads with data               | `show_id`                                |
| `show_episode_play_clicked`  | Archive episode starts                    | `show_id`, `episode_id`, `platform`      |
| `show_artist_clicked`        | Host/artist link clicked                  | `show_id`, `artist_id`                   |
| `show_platform_link_clicked` | External Mixcloud/SoundCloud link clicked | `show_id`, `platform`                    |
| `show_related_clicked`       | Related show opened                       | `show_id`, `related_show_id`, `position` |

## Definition Of Done

- [ ] `/shows/[id]` renders from a normalized Voices API show adapter.
- [ ] Invalid IDs and API failures are handled differently.
- [ ] Artist data is joined when needed for artist links and fallback imagery.
- [ ] Detail pages only render public matched shows.
- [ ] Artist profile links render only when confirmed `artistId` exists.
- [ ] Tracklist/archive sections render only when data exists.
- [ ] Shared archive player opens from playable episodes.
- [ ] Show artwork uses the show-image -> artist-profile-image -> branded-fallback order.
- [ ] Empty/error/missing-image/long-content/embed-unavailable states are covered.
- [ ] Responsive, accessibility, SEO, and analytics requirements are met.
