# Redesign Definition of Done

The source checklist remains `docs/voices_radio_website_design_to_build_checklist.md`. This file translates it into gates that can be used during design handoff and build.

## Gate 1: Product And IA

- Primary goals are documented and ordered.
- Core user journeys are mapped from entry point to CTA.
- CTA hierarchy is defined for desktop and mobile.
- MVP and future features are separated.
- Sitemap and URL structure are agreed before route implementation.
- Navigation rules cover desktop, mobile, sticky behavior, search, CTAs, and footer hierarchy.

## Gate 2: Design System

- Color, typography, spacing, radius, elevation, z-index, container, breakpoint, and motion tokens exist.
- Tokens are mapped to Tailwind/CSS variables before component implementation.
- Visual principles describe image treatment, motion, hover behavior, accessibility, and brand consistency.
- Figma token names and code token names are cross-referenced.

## Gate 3: Components

- Each reusable component has desktop and mobile behavior.
- Each interactive component defines hover, active, disabled, loading, empty, and error states where applicable.
- Component inventory lists data requirements and source endpoints or CMS fields.
- Media components cover live audio, Mixcloud/SoundCloud embeds, video, and galleries.

## Gate 4: Responsive Design

- Breakpoints include 1440, 1280, 1024, 768, 390, and 320 widths.
- Navigation, player, schedule, cards, grids, image crops, long titles, filters, and search are tested.
- Mobile layouts use Figma `Prototype Mobile` as the first source of truth.

## Gate 5: CMS And API

- Show, artist, event, and schedule models are mapped to either Sanity, Voices API, Airtime, or a planned adapter.
- Required fields, validation rules, empty states, and image fallbacks are documented.
- API errors, loading states, and missing content paths are designed before build.

## Gate 6: Live Audio And Schedule

- Player behavior covers stream URL, global state, persistence, metadata, artwork, mobile mini-player, and error fallback.
- Schedule rules cover timezone, weekly repeats, overrides, guest shows, cancellations, daylight saving, now-playing, and upcoming logic.
- Polling and caching behavior is specified.

## Gate 7: Integrations

- Each external service has purpose, data contract, auth needs, failure handling, rate limits, and launch status.
- Launch-critical integrations are identified separately from future enhancements.

## Gate 8: SEO, Accessibility, Performance, Analytics

- Each route has title, description, canonical, Open Graph, and structured-data requirements.
- Accessibility covers contrast, keyboard navigation, focus states, labels, semantics, alt text, reduced motion, and screen readers.
- Performance risks have mitigation plans, especially embeds, video, images, animation, and third-party scripts.
- Analytics events use consistent names and properties.

## Gate 9: Documentation And Handoff

- Required docs exist: Website PRD, Design System PRD, CMS Schema PRD, Audio Player PRD, Schedule PRD, Analytics Specification, SEO Specification, QA Test Plan, Accessibility Checklist.
- AI-friendly docs exist in `docs/project-memory/`.
- Figma handoff includes named pages/components, auto-layout, variants, mobile layouts, realistic content, interaction notes, export-ready assets, design tokens, and empty/loading/error states.

## Current Status

- Started: memory structure, design system extraction, initial component inventory, route/API mapping.
- Pending: full PRD documents, desktop Figma extraction, final content ownership decisions, API adapter design, detailed interaction notes.
