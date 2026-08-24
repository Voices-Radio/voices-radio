# Voices Radio Website Interface System

## Sources

- Staging target: `https://staging.voicesradio.co.uk`, documented in `playwright.staging.config.ts`.
- Staging access is behind basic auth, so this system is based on committed staging screenshots in `artifacts/`, the redesign docs in `docs/project-memory/`, and the current implementation.
- Primary code sources: `tailwind.config.js`, `app/globals.css`, `app/layout.tsx`, `app/(station)/components/redesign/`, and `app/(station)/account/components/`.

## Intent

Voices Radio is a community radio website for listeners, DJs, members, and collaborators. The interface should feel like a live broadcast desk translated to the web: immediate, warm, music-led, legible in motion, and a little handmade without becoming decorative.

The first job of every screen is orientation: what is live, where can I listen, where can I discover shows, and what can I do next. Design decisions should protect that broadcast context even on account, membership, and editorial pages.

## Domain Exploration

Domain concepts:

- Live radio signal
- Two-station broadcast stack: KX live and EAST tuning/coming soon
- DJ/show discovery
- Archive listening
- Community membership
- Studio/collaboration
- Broadcast controls and meters
- London community station energy

Color world:

- Charcoal booth walls and night-room canvas
- Warm cream paper labels on hardware
- Burnt orange console buttons and logo ink
- Deep red live/on-air lamps
- Muted grey equipment metal and secondary labels
- Near-black footer and playback cavities
- Warm low-contrast divider lines

Signature:

- The persistent broadcast strip: a cream station/status bar directly under the dark nav, with compact rows for station, status, and play/live controls. This is the site's strongest product-specific pattern and should remain visible in future shells.

Defaults to avoid:

- Generic marketing hero first: use the live station/player context as the first-frame anchor.
- Generic card grid styling: use dark broadcast surfaces, reserved image/content placeholders, and low-contrast borders.
- Colorful entertainment palette: keep color disciplined; orange means action/current state, red means live.
- Generic app typography: use the current Gabarito/Outfit/Asap Condensed stack for chunky, compact, broadcast-flavored hierarchy.

## Direction

Build a warm dark interface with a fixed broadcast identity: dark charcoal navigation and canvas, cream live-player hardware strip, orange controls and active states, and quiet dark surfaces for content. The system should feel robust enough for forms and membership flows while still clearly belonging to a radio station.

## Tokens

### Color

Use the `voicesNext` namespace for current redesign work.

| Purpose | Token / Value | Use |
| --- | --- | --- |
| Canvas | `voicesNext.background` / `#242424` | Page background and top-level shell |
| Surface | `voicesNext.surface` / `#313131` | Cards, account panels, hover surfaces |
| Cream | `voicesNext.cream` / `#F8EFE0` | Primary text and broadcast strip background |
| Accent | `voicesNext.orange` / `#D34E24` | Primary action, active route, focus rings, broadcast controls |
| Button accent | `voicesNext.orangeButton` / `#C24821` | White-on-orange CTA buttons |
| Text accent | `voicesNext.orangeText` / `#DF7E5F` | Orange text on dark backgrounds where AA contrast is required |
| Live | `voicesNext.live` / `#DB1A1A` | Live state only |
| Secondary | `voicesNext.secondary` / `#999999` | Metadata, helper text, inactive labels |
| Border | `voicesNext.border` / `#6F6A63` | Low-contrast warm borders |
| White | `voicesNext.white` / `#FFFFFF` | Sparse emphasis, not default text |

Rules:

- Do not use plain orange for small static text on dark surfaces; use `orangeText`.
- Red is reserved for live/on-air state and should not be used as a generic error or accent color.
- Cream is both a text color and the broadcast strip color. When used as a surface, switch text to near-black/dark.
- Keep old `voices.*` tokens available for legacy pages until those pages are migrated.

### Typography

Fonts are already wired in `app/layout.tsx` through Next font variables.

| Role | Family | Style |
| --- | --- | --- |
| Navigation, headings, forms | Gabarito | Bold, compact, friendly, highly legible |
| Display and page titles | Outfit | Black/bold uppercase for membership headings and display labels |
| Metadata, tags, helper text | Asap Condensed | Regular/bold, compact station-label feel |
| Legacy brand pages | Kinfolk / Inter | Keep only where existing legacy design requires it |

Rules:

- Page titles on redesigned pages use Outfit Black, uppercase, cream.
- Primary nav uses Gabarito around `20px` to `21px`, bold, cream.
- Metadata and helper labels use Asap Condensed or Gabarito uppercase with measured tracking.
- Preserve existing intentional tracking for live labels, nav/account labels, and tiny broadcast metadata.

### Spacing

Use the existing `voices-*` spacing scale:

- `2px`, `4px`, `8px`, `10px`, `12px`, `16px`, `20px`, `24px`, `40px`.

Rules:

- `8px` is the base micro rhythm.
- `10px` is intentional in this system; do not normalize it away.
- Use `16px` to `24px` for card/form internal padding.
- Use `40px` for larger section separation and account nav spacing.
- Minimum tap target height is `44px`.

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `voices-xs` | `4px` | Chips, tiny status elements |
| `voices-sm` | `8px` | Inputs and compact controls |
| `voices-md` | `20px` | Cards/account surfaces |
| `voices-lg` | `40px` | Large rounded panels |
| full pill | `100px` / `rounded-full` | Buttons, account nav pills, avatars |

Cards may use `20px` radius. Buttons should be fully pill-shaped unless the existing local pattern is square/icon-only.

### Depth

Depth strategy is surface shifts plus quiet borders, with restrained shadows only on interactive account surfaces.

- Canvas: `voicesNext.background`.
- Raised surface: `voicesNext.surface`.
- Inset control: `voicesNext.background` inside a `surface` panel.
- Borders: `voicesNext.border`, often softened with opacity.
- Shadows: account cards may use subtle black shadows and a small hover lift; do not add large decorative shadows to page sections.

## Core Patterns

### Shell

- Top nav is sticky, dark, and compact.
- Desktop nav uses the orange Voices wordmark at left, centered/right nav links, search, account, and wavy menu icon.
- Mobile header uses compact artwork and a wavy menu icon, with a tiny on-air ticker below.
- Focus rings use orange with a dark offset.

### Broadcast Strip

- The live player/status strip sits immediately under the nav.
- Cream background, dark text, sharp hardware-like divisions.
- KX and EAST rows communicate live/tuning/coming soon states.
- Orange controls sit as small high-emphasis blocks inside the strip.
- The strip should feel like station hardware, not a marketing banner.

### Navigation

- Primary links are bold Gabarito cream text.
- Active and hover states use the hand-drawn underline from `/nav-underline.svg` on desktop.
- Mobile menu is full-screen dark, with large simple links and orange active state.
- Use icons for search, close, menu, and account where the action is icon-native.

### Cards And Surfaces

- Default dark content cards use `voicesNext.surface` on `voicesNext.background`.
- Account surfaces use `rounded-voices-md`, `border-voicesNext-border`, `bg-voicesNext-surface`, and `p-6`.
- Interactive account surfaces may add a thin orange top accent on hover/focus and a tiny upward transform.
- Empty/skeleton states should use dark rectangular placeholders rather than bright shimmer.

### Buttons

- Primary: pill, `orangeButton` background, white text, bold Gabarito.
- Primary hover may invert to cream background with dark text where already established.
- Secondary: pill, warm border, cream text, transparent/dark background.
- Disabled: preserve shape and layout, reduce opacity, disable pointer interactions.
- Focus: orange ring with dark offset.

### Forms

- Inputs are inset: `voicesNext.background` inside a surface panel.
- Use `rounded-voices-sm`, warm border, cream text, and muted cream placeholders.
- Focus border and ring use orange.
- Error, empty, loading, and disabled states must be explicit; do not rely on color alone.

### Account And Membership

- Account pages use a centered max-width content column rather than full-width dashboard density.
- Account nav is an uppercase pill/tab row with a low-contrast bottom border and orange active state.
- Membership cards use restrained panels and clear plan hierarchy, with tier actions aligned to the right on desktop.
- Important dates and money values should be bold inside prose, not separated into generic metric cards.

### Footer

- Footer is near-black with cream text and secondary grey legal/support copy.
- App store badges are grouped under "Listen on the Voices app".
- Keep footer information quiet; it should not compete with the live strip.

## Motion

- Use `180ms` to `300ms` transitions for nav, search, buttons, and surface accents.
- Use marquee/orbit/tuning animations only for live/broadcast context.
- Respect `prefers-reduced-motion`; disable decorative broadcast animations there.
- Avoid bounce/spring motion.

## Accessibility

- Orange and red cannot be the only indicator of state; pair with text, underline, icon, or layout.
- Live/player controls need accessible labels and keyboard focus.
- Icon-only controls need `aria-label`.
- Image cards need stable alt text and fallback surfaces.
- Maintain AA contrast; prefer `orangeText` for small orange text on dark surfaces.
- Verify responsive layouts at `320px`, `390px`, `768px`, `1024px`, `1280px`, and `1440px`.

## Implementation Notes

- Prefer existing Tailwind token classes before adding new hex values.
- Add new primitives only when a pattern appears more than once.
- Do not introduce decorative gradients/orbs. The only current gradient-like shell treatment is the mobile header's subtle dark vertical treatment.
- Keep design changes scoped to the redesigned station site unless the task explicitly covers podcast/studio legacy pages.
- Staging screenshots may show authenticated paths; do not read `.env*` files to access staging credentials.
