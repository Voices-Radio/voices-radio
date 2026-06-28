# Foundations, Shell, Player, Navigation

## Route And Intent

- Route: shared across all redesign routes.
- Page purpose: establish the reusable product shell, design tokens, player, navigation, menu, footer, and state patterns used by every Figma-backed page.
- User goal: users should always be able to listen live, move between Home/Discover/Schedule/static routes, and recover from loading or playback failures.
- Primary CTA: Listen Live / Play.
- Secondary CTAs: Discover, Schedule, Become a Supporter, Listen on the Voices app.

## Figma Sources

| Surface               | Node                                          |
| --------------------- | --------------------------------------------- |
| Design system         | `Design System` / `37:14`                     |
| Design guide          | `Design Guide` / `41:14`                      |
| Typography            | `Typography` / `35:836`                       |
| Component library     | `Component Library` / `48:1265`               |
| Brand assets          | `Brand Assets` / `151:3813`                   |
| Card component set    | `Card` / `367:3703`                           |
| Host card             | `Host card` / `411:3486`                      |
| Mobile menu           | `iPhone 16 Menu` / `509:4458`                 |
| Mobile player playing | `Audio Player Bar` / `305:546`                |
| Mobile player paused  | `Audio Player Bar - Paused` / `309:501`       |
| Fullscreen video      | `Fullscreen Video (Landscape)` / `305:527`    |
| Desktop header        | `Header` within `Desktop Home` / `1159:15647` |
| Desktop player        | `Desktop Audio Player Bar` / `838:239`        |

## Required Sections And Components

- Design tokens:
  - Colors: background `#161616`, surface `#443F3F`, cream text `#F8EFE0`, orange CTA `#D34E24`, live red `#DB1A1A`, secondary text `#999999`.
  - Typography: Gabarito for UI/headings/body, Outfit for display and caps, Asap Condensed for tags and metadata.
  - Spacing: `2`, `4`, `8`, `10`, `12`, `16`, `20`, `24`, `40`.
  - Radius: `0`, `4`, `8`, `20`, `40`, full pill.
- App shell:
  - Fixed or persistent global player placement that does not hide page CTAs.
  - Header with brand mark, menu trigger, and route affordances.
  - Footer with app CTA, static links, and supporter CTA.
- Navigation:
  - Mobile menu items: Home, Schedule, Discover, Shop, About, Work with us, Contact, Become a Supporter.
  - Active state must be visible for current route.
  - Menu close control must be keyboard and screen-reader accessible.
- Player:
  - Play/pause control, current item title, source metadata, progress bar, elapsed/remaining time, close control for archive player.
  - Live player and archive player must be visually distinct in metadata.
  - Fullscreen video mode needs return, pause, and exit-fullscreen controls.
  - KX and East audio streams use RadioCult.
  - KX and East video streams use Restream.

## Data Contract

- RadioCult:
  - Audio stream provider for both KX and East.
  - Stream URLs, station IDs, or embed/config IDs must come from environment variables, not hardcoded page components.
- Restream:
  - Video stream provider for both KX and East.
  - Video embed/channel IDs must come from environment variables or a provider config object.
- Airtime:
  - Legacy metadata/schedule source only where the current implementation still depends on it.
  - Do not use Airtime as the redesigned audio stream provider.
- Voices API:
  - Provides normalized show/artist metadata for archive player titles, artist links, platform metadata, and card content.
  - Provides show image and `artistId`; the frontend adapter joins artist data when an associated artist profile image is needed for the shared show-card fallback strategy.
- Sanity:
  - Provides static footer/editorial links where the redesigned static content remains CMS-managed.
- Static/local:
  - Icon set, brand assets, fallback artwork, and token constants.

## Required States

- Loading: player shows non-blocking loading state and preserves layout height.
- Empty: missing now-playing metadata falls back to `Live DJ` or a station-level label.
- Error: playback error exposes retry and does not crash navigation.
- Missing image: show/player artwork uses show image first, associated artist profile image second, and branded fallback artwork last.
- Long content: player title and card labels truncate or marquee without resizing controls.
- Offline/unavailable: station offline state is explicit and not color-only.

## Live Testing Without Impacting Current Site

- Use branch-based preview deployments and the dedicated staging domain; do not point the production domain at redesign work until launch approval.
- Staging target: `test.voicesradio.co.uk`.
- Unfinished redesign routes must not be visible on production, including behind a production feature flag.
- Keep preview and staging deployments `noindex` and analytics disabled unless a test provider is explicitly added.
- Use read-only production-like data from Voices API, RadioCult, Restream, and Sanity.
- Keep RadioCult and Restream provider config in environment variables so preview can target test/staging provider IDs when available and production IDs only after sign-off.
- Verify real playback in preview with manual smoke tests for KX audio, East audio, KX video, and East video.
- Rollback is a Vercel deployment promotion/revert: production keeps the current site until the redesigned branch is explicitly promoted.

## Responsive Requirements

- `320px`: menu labels and player controls fit without horizontal scroll.
- `390px`: match iPhone 16 Figma frame sizing; player height remains `88px` where used.
- `768px`: shell can use tablet spacing but should keep mobile-safe tap targets.
- `1024px`: desktop navigation can begin wider layout.
- `1280px`: match desktop prototype width.
- `1440px`: centered max-width layout with no overstretched cards or player text.

## Accessibility Requirements

- All icon-only controls have accessible labels.
- Player state is conveyed through text and ARIA state, not only color.
- Menu open/close traps and restores focus.
- Focus styles use visible tokenized outlines.
- Tap targets are at least `44px`.
- Motion respects `prefers-reduced-motion`.

## SEO Requirements

- Shared shell must not introduce duplicate H1s.
- Header/footer navigation links must be crawlable.
- Player UI should not pollute page metadata.
- App shell must allow route-level canonical, title, description, and Open Graph data.

## Analytics Events

| Event                     | Trigger                              | Properties                                    |
| ------------------------- | ------------------------------------ | --------------------------------------------- |
| `player_play_clicked`     | User starts live or archive playback | `page_path`, `component`, `source`, `item_id` |
| `player_pause_clicked`    | User pauses playback                 | `page_path`, `component`, `source`, `item_id` |
| `player_close_clicked`    | User closes archive mini-player      | `page_path`, `component`, `item_id`           |
| `player_error_seen`       | Player enters error state            | `page_path`, `source`, `error_code`           |
| `navigation_menu_opened`  | Mobile menu opens                    | `page_path`                                   |
| `navigation_link_clicked` | Header/menu/footer link clicked      | `page_path`, `target_path`, `component`       |
| `app_cta_clicked`         | Listen-on-app CTA clicked            | `page_path`, `component`                      |
| `supporter_cta_clicked`   | Become-a-supporter CTA clicked       | `page_path`, `component`                      |

## Definition Of Done

- [ ] Figma token values map to CSS/Tailwind tokens without deleting legacy tokens prematurely.
- [ ] Header, menu, footer, and player are built as shared shell components.
- [ ] Live and archive playback states are distinct.
- [ ] KX/East audio uses RadioCult and KX/East video uses Restream through environment-based config.
- [ ] Loading, empty, error, missing-image, long-title, and offline states are implemented.
- [ ] Preview/staging testing is isolated from the current production website.
- [ ] Breakpoints from the checklist are visually checked.
- [ ] Keyboard, focus, labels, contrast, reduced motion, and screen-reader behavior are checked.
- [ ] Analytics events are emitted through a provider-agnostic helper.
