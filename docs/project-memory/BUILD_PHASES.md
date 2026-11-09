# Build Phases

## Phase 0: Pre-Build Readiness

- Finalize project memory docs.
- Confirm API ownership for shows, artists, events, and schedule.
- Confirm font source/licensing for Gabarito, Outfit, and Asap Condensed.
- Rename generic Figma component sets.
- Add desktop Figma extraction to memory once desktop design is ready.

## Phase 1: Foundations

- Introduce new design tokens in CSS/Tailwind while preserving current tokens.
- Add font loading and typography utilities.
- Create primitives: buttons, icon buttons, inputs, chips, cards, tabs, loading skeletons.
- Create route shell, app layout, navigation, footer, and responsive containers.
- Establish typed API adapter layer.

## Phase 2: Core Content

- Homepage.
- Shows index and show detail pages.
- Artists/hosts index and detail pages.
- Events listing and detail pages.
- Schedule page.
- Search page.

## Phase 3: Live Experience

- Global persistent audio player.
- Now-playing metadata.
- Mobile mini-player and expanded player.
- Schedule live/up-next integration.
- Archive embeds and platform fallbacks.

## Phase 4: Commercial Features

- Studio booking page and CTA flow.
- Membership/support page.
- Ticketing provider integration.
- Newsletter/signup integration.

## Phase 5: Polish And Optimization

- SEO metadata and structured data.
- Accessibility pass.
- Analytics instrumentation.
- Performance pass for images, embeds, video, and animation.
- QA across checklist breakpoints.

## Suggested First Build Slice

1. Token implementation.
2. Button/input/card primitives.
3. Global player shell with mocked normalized data.
4. Mobile home/discover frame translated from Figma.
5. API adapter replacement of mock data.
