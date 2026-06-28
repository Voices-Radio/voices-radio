# Home Page

## Route And Intent

- Route: `/`
- Page purpose: introduce the live Voices experience, surface current/featured station content, and route users into discovery.
- User goal: quickly understand what is live, start listening, and browse recent KX/Voices content.
- Primary CTA: Listen Live / Play.
- Secondary CTAs: View details for latest shows, Discover, Listen on the Voices app, Become a Supporter.

## Figma Sources

| Surface               | Node                                          |
| --------------------- | --------------------------------------------- |
| Mobile home start     | `iPhone 16 v.3 - start` / `984:2214`          |
| Mobile buffering      | `iPhone 16 v.3 - buffering` / `1004:6115`     |
| Mobile audio playing  | `iPhone 16 v.3 - audio playing` / `1004:6396` |
| Mobile video playing  | `iPhone 16 v.3 - video playing` / `1004:6697` |
| Desktop home          | `Desktop Home` / `1159:15647`                 |
| Desktop feature frame | `Feature Frame Whole` / `1100:2474`           |
| Mobile menu           | `iPhone 16 Menu` / `509:4458`                 |

## Required Sections And Components

- App shell:
  - Header group and live header appear above the home content.
  - Player state changes are reflected without shifting the page.
- Hero/live area:
  - Start, buffering, audio-playing, and video-playing states are covered.
  - Audio stream states use RadioCult for both KX and East.
  - Video stream state uses Restream for both KX and East and the `video stream home` layout when available.
- Latest content:
  - Section title: `Latest on KX`.
  - Supporting copy: recent/listen-back explanation.
  - Horizontal or stacked show cards with date, title, genre tags, and `View details`.
  - KX/East labels render only when supplied by live/provider config or editorial mapping; they are not Voices API location fields.
  - Live KX/East show cards at the top of the page usually use the associated artist profile image when the show has no dedicated image.
- Footer:
  - App CTA: `Listen on the Voices app`.
  - Footer links and supporter CTA.

## Desktop Build Source

- Desktop implementation follows `Desktop Home` / `1159:15647` as the source of truth for large screens.
- The desktop home composition is:
  - `Header` across the top.
  - Two stacked live panels at the upper left for KX/East live listening and video entry.
  - `Latest on KX` carousel/list section.
  - `Latest on EAST` carousel/list section.
  - `Become a Supporter Block`.
  - `Footer`.
- Mobile implementation continues to follow the `Prototype Mobile` home frames, especially `iPhone 16 v.3 - start` / `984:2214`.
- The first build phase should prioritize matching the desktop hierarchy and proportions at `1280px`, while preserving the mobile flow at `390px`.

## Data Contract

- Voices API:
  - Featured/latest shows list; use a placeholder selected/picked-shows adapter until editorial/backend ownership is finalized.
  - Show ID, title, show image, associated artist profile image via artist join, date, genre tags, artist/host names.
  - Featured state if the home carousel is curated.
  - Default latest limit: `10`.
  - Public latest cards include `matching_status=matched` shows only after adapter filtering.
- RadioCult:
  - KX and East live audio stream config.
- Restream:
  - KX and East live video stream config.
- Airtime:
  - Legacy current-show metadata only if still needed before the Voices API provides the live metadata adapter.
  - Fallback to `Live DJ` or station-level copy when no show is scheduled.
- Sanity:
  - Static footer/editorial links and app/supporter CTA copy if not hardcoded.
- Static/local:
  - Fallback artwork and icons.

## Required States

- Loading: hero/player can show buffering while latest cards skeletonize.
- Empty: latest section shows a compact empty state and a Discover CTA.
- Error: latest content failure does not break player; show retry or fallback copy.
- Missing image: show cards use show image first, associated artist profile image second, and branded fallback artwork last.
- Long content: show titles, genre tags, and host names wrap/truncate without changing card dimensions.
- Offline/unavailable: player shows station offline or metadata unavailable state.

## Responsive Requirements

- `320px`: one-column content, no card text overflow, player controls remain reachable.
- `390px`: match mobile home Figma flow and spacing.
- `768px`: latest cards can move to a denser grid if enough width exists.
- `1024px`: hero/player and latest content begin desktop composition.
- `1280px`: match desktop home frame width.
- `1440px`: content remains centered and does not stretch past intended max width.

## Accessibility Requirements

- Main page has exactly one H1.
- Show cards use meaningful link labels, not only `View details`.
- Player controls are keyboard operable.
- Buffering state is announced politely.
- Images have artist/show-specific alt text or branded fallback alt.
- Genre tags are readable text, not decorative-only labels.

## SEO Requirements

- Title pattern: `Voices Radio | Live Radio, Shows and Community`.
- Description should mention live radio, shows, artists, and Voices location/community identity.
- Canonical: `/`.
- Open Graph image: use a branded default or current home hero artwork.
- Structured data: `Organization` and `WebSite`; avoid per-show structured data on the home page.

## Analytics Events

| Event                      | Trigger                           | Properties                         |
| -------------------------- | --------------------------------- | ---------------------------------- |
| `home_latest_show_clicked` | User opens a latest show card     | `show_id`, `position`, `source`    |
| `home_discover_clicked`    | User routes from home to Discover | `page_path`, `component`           |
| `player_play_clicked`      | User starts live playback         | `page_path`, `component`, `source` |
| `app_cta_clicked`          | User clicks app CTA               | `page_path`, `component`           |
| `supporter_cta_clicked`    | User clicks supporter CTA         | `page_path`, `component`           |

## Definition Of Done

- [ ] Home uses the shared shell/player/navigation foundation.
- [ ] Desktop layout follows `Desktop Home` / `1159:15647`.
- [ ] Mobile layout follows the `Prototype Mobile` home frames.
- [ ] Start, buffering, audio-playing, and video-playing states are represented.
- [ ] KX/East audio uses RadioCult and KX/East video uses Restream through shared provider config.
- [ ] Latest content is powered by the normalized Voices API show adapter.
- [ ] Latest/picked show source is isolated behind an adapter placeholder so editorial ownership can change later.
- [ ] Home latest list filters public shows to `matching_status=matched`.
- [ ] Home show artwork uses the show-image -> artist-profile-image -> branded-fallback order.
- [ ] Empty/error/missing-image/long-title states are designed and implemented.
- [ ] Responsive behavior is checked at all checklist breakpoints.
- [ ] SEO metadata and analytics events are implemented.
