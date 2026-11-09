# Design System

## Sources

- Figma `Design System` page: `37:14`
- Figma `Component Library` page: `48:1265`
- Figma `Prototype Mobile` page: `304:224`
- Current code tokens: `tailwind.config.js`, `app/globals.css`

## Design Direction

The redesign moves away from the current Kinfolk/Inter, beige/purple/red live-site palette and toward a darker, warmer mobile-first interface:

- Base background: near-black charcoal, not pure black.
- Surfaces: warm brown panels and cards.
- Primary action: orange only for CTAs, active states, and primary actions.
- Live state: red only for live indicators.
- Type: Gabarito for UI/body/headings, Outfit for brand/display/caps, Asap Condensed for tags and metadata.

## Color Tokens

| Token                  | Value     | Usage                                 |
| ---------------------- | --------- | ------------------------------------- |
| `color.background`     | `#161616` | App background                        |
| `color.surface`        | `#443F3F` | Cards, nav, player surfaces           |
| `color.text.primary`   | `#F8EFE0` | Primary text and warm cream surfaces  |
| `color.text.inverse`   | `#161616` | Text on light surfaces                |
| `color.text.secondary` | `#999999` | Secondary text                        |
| `color.accent.primary` | `#D34E24` | CTAs, active states, primary controls |
| `color.status.live`    | `#DB1A1A` | Live indicators only                  |
| `color.white`          | `#FFFFFF` | Highlights and emphasis only          |
| `color.border.subtle`  | `#6A655E` | Divider/border candidate              |

Implementation note: current Tailwind tokens are `voices.beige`, `voices.gray`, `voices.red`, and `voices.purple`. Build should introduce the new token namespace without deleting old tokens until pages are migrated.

## Typography Tokens

| Token                   | Figma Spec                            | Usage                            |
| ----------------------- | ------------------------------------- | -------------------------------- |
| `type.display.brand-lg` | Outfit Black 32                       | Large artist/show display labels |
| `type.display.brand-md` | Outfit Black 24, letter +1px          | Secondary display                |
| `type.display.brand-sm` | Outfit Black 20/14/11                 | Compact brand/caps               |
| `type.heading.h1`       | Gabarito Bold 24                      | Mobile H1/page titles            |
| `type.heading.h2`       | Gabarito Bold 20                      | Section headings                 |
| `type.heading.h3`       | Gabarito Bold 18                      | Card/row headings                |
| `type.heading.h4`       | Gabarito Bold 16/14/13                | Compact headings                 |
| `type.body.lg`          | Gabarito Medium 20/18                 | Emphasized body                  |
| `type.body.md`          | Gabarito Medium 16                    | UI body                          |
| `type.body.regular`     | Gabarito Regular 16                   | Paragraph body                   |
| `type.meta.lg`          | Asap Condensed Bold 20/16             | Prominent tags                   |
| `type.meta.md`          | Asap Condensed Bold 14/12             | Card metadata                    |
| `type.meta.regular`     | Asap Condensed Regular 16/14/13/12/10 | Secondary metadata               |
| `type.label.live`       | Outfit Bold 10, letter +2px           | Live/on-air labels               |

Letter spacing in Figma is expressed in pixels. Convert carefully for CSS if using `em`; for example, `+2px` on `10px` text is `0.2em`.

Implementation note: the repo currently ships a local Kinfolk font and uses Next font variables for Inter/Kinfolk. Add or license-host Gabarito, Outfit, and Asap Condensed before replacing production text styles.

## Spacing Tokens

| Token      | Value  |
| ---------- | ------ |
| `space.2`  | `2px`  |
| `space.4`  | `4px`  |
| `space.8`  | `8px`  |
| `space.10` | `10px` |
| `space.12` | `12px` |
| `space.16` | `16px` |
| `space.20` | `20px` |
| `space.24` | `24px` |
| `space.40` | `40px` |

Usage rules from Figma:

- Card text padding: `16px`.
- Minimum element spacing: `8px`.
- Minimum vertical spacing: `20px`.
- Minimum button height: `44px`.
- `10px` is intentional and should be preserved.

## Radius Tokens

| Token         | Value   | Usage                       |
| ------------- | ------- | --------------------------- |
| `radius.none` | `0px`   | Flush media or dividers     |
| `radius.xs`   | `4px`   | Small chips/indicators      |
| `radius.sm`   | `8px`   | Buttons and inputs          |
| `radius.md`   | `20px`  | Default cards/surfaces      |
| `radius.lg`   | `40px`  | Large panels                |
| `radius.full` | `100px` | Pills and circular controls |

## Breakpoints

Use the checklist breakpoints as QA targets:

- `320px`: small mobile
- `390px`: mobile, matching Figma iPhone 16 frames
- `768px`: tablet
- `1024px`: tablet landscape
- `1280px`: laptop
- `1440px`: desktop

## Motion

- Motion should support radio/live context without blocking content.
- Respect `prefers-reduced-motion`.
- Use subtle transitions for player state, navigation, filters, and cards.
- Avoid decorative motion that competes with audio playback or discovery tasks.

## Accessibility Rules

- Orange and red must not be the only state indicator.
- All player controls need visible labels and keyboard focus.
- Live/playing states need semantic text, not just color.
- Image-heavy cards need stable fallback alt text and placeholder surfaces.
- Keep tap targets at least `44px` high.

## Build Implementation Plan

1. Add CSS variables for the new token set.
2. Extend Tailwind with `voicesNext` or similarly scoped tokens.
3. Add font loading once font source/licensing is confirmed.
4. Build primitive components against tokens before page templates.
5. Keep old tokens available until current pages are migrated.

## Open Questions

- Confirm final desktop typography scale from the Figma desktop prototype.
- Confirm whether Figma color `#000000` appears only in annotation text or is intentional anywhere.
- Confirm final icon set and whether existing custom icons should be replaced by lucide or brand-specific SVGs.
