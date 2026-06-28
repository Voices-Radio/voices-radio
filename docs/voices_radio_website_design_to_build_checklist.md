# Voices Radio — Website Design-to-Build Checklist

## Objective

This document is intended to ensure the next version of the Voices Radio website is fully planned before development begins, reducing ambiguity, rework, bugs, and inconsistencies.

The goal is to:

- Create a scalable and maintainable website
- Improve developer handoff quality
- Reduce UI inconsistencies and edge-case bugs
- Prepare the project for AI-assisted development workflows
- Ensure design, CMS, frontend, and integrations align properly

---

# 1. Product & Business Clarity

## Define the Primary Goals of the Website

Clarify the core objectives:

- Increase live radio listeners
- Improve discovery of shows and artists
- Promote events
- Drive studio bookings
- Grow memberships/subscriptions
- Build community engagement
- Improve mobile usability

## Define Core User Journeys

Map out the critical flows:

- Listen live
- Browse schedule
- Discover shows
- Explore artists/DJs
- Book a studio
- Buy event tickets
- Join membership/support scheme
- Submit music/contact the station
- Search for content

## Prioritise CTAs

Define CTA hierarchy:

1. Listen Live
2. View Schedule
3. Explore Shows
4. Book Studio
5. Buy Tickets
6. Join Membership

## Define MVP vs Future Features

Split features into:

### Must-Have for Launch

- Live player
- Schedule
- Show pages
- Artist pages
- Event pages
- Responsive layouts
- CMS integration

### Future Features

- User accounts
- Saved favourites
- Mobile app sync
- Personalised recommendations
- Chat/community features
- Advanced memberships

---

# 2. Sitemap & Information Architecture

## Finalise Full Sitemap

### Suggested Structure

- Home
- Listen Live
- Schedule
- Shows
- Artists / Residents
- Events
- Studio Booking
- Membership / Support
- News / Articles
- About
- Contact
- Search
- Privacy Policy
- Terms & Conditions
- Cookies

## Define URL Structures

Examples:

```txt
/shows/[slug]
/artists/[slug]
/events/[slug]
/schedule
/listen-live
/studio-booking
```

## Define Navigation Rules

Clarify:

- Desktop nav structure
- Mobile nav structure
- Sticky header behaviour
- Search visibility
- CTA placement
- Footer hierarchy

---

# 3. Design System

## Establish Design Tokens

### Colours

Define:

- Primary background
- Secondary background
- Accent colour
- Text colours
- Border colours
- Status colours

### Typography

Define:

- Font families
- Heading scale
- Body scale
- Line heights
- Letter spacing
- Mobile typography rules

### Spacing System

Example:

```txt
space-2 = 8px
space-4 = 16px
space-6 = 24px
space-8 = 32px
```

### Other Tokens

- Border radius
- Shadows/elevation
- Z-index layers
- Container widths
- Breakpoints
- Animation timings

## Define Visual Principles

Clarify:

- Minimal vs expressive design balance
- Motion/animation style
- Hover behaviour
- Image treatment
- Brand consistency rules

---

# 4. Component Library

## Create Reusable Components

### Navigation

- Header
- Mobile navigation
- Footer
- Search bar

### Content Components

- Hero sections
- Show cards
- Artist cards
- Event cards
- Article cards
- Schedule rows
- CTA banners
- Newsletter forms

### Utility Components

- Buttons
- Inputs
- Tabs
- Dropdowns
- Accordions
- Modals
- Toasts
- Pagination
- Filters

### Media Components

- Audio player
- Embedded Mixcloud player
- Video embeds
- Image galleries

## Every Component Must Include

- Desktop version
- Mobile version
- Hover state
- Active state
- Disabled state
- Loading state
- Empty state
- Error state

---

# 5. Responsive Design Planning

## Define Breakpoints

Recommended:

- 1440px Desktop
- 1280px Laptop
- 1024px Tablet Landscape
- 768px Tablet
- 390px Mobile
- 320px Small Mobile

## Test Key Responsive Areas

Critical areas:

- Navigation collapse
- Audio player layout
- Schedule responsiveness
- Card wrapping
- Grid stacking
- Image cropping
- Long titles/names
- Filters/search UI

---

# 6. CMS & Content Modelling

## Define Content Models

### Show Model

Fields:

- Title
- Slug
- Description
- Cover image
- Hosts
- Genres
- Schedule slot
- Archive embeds
- Featured flag

### Artist Model

Fields:

- Name
- Slug
- Bio
- Profile image
- Genres
- Social links
- Shows
- Featured flag

### Event Model

Fields:

- Title
- Date/time
- Venue
- Description
- Artwork
- Ticket link
- Status
- Lineup

### Schedule Model

Fields:

- Day
- Start time
- End time
- Show
- Host
- Repeating flag
- Live/pre-recorded flag

## Define Validation Rules

Examples:

- Required images
- Slug uniqueness
- Character limits
- Date validation
- URL validation

---

# 7. Content Edge Cases

## Design for Imperfect Content

Examples:

- Missing images
- Long names
- Empty descriptions
- No upcoming events
- No archived episodes
- Missing social links
- Cancelled events
- Empty search results

This prevents broken layouts.

---

# 8. Live Audio Player Planning

## Define Player Requirements

Clarify:

- Stream source/provider
- Persistent player behaviour
- Mobile player UX
- Now playing metadata
- Artwork handling
- Mini-player behaviour
- Background playback support
- Error/fallback behaviour

## Define Technical Behaviour

Questions:

- Global player state?
- Route persistence?
- Hydration strategy?
- Autoplay restrictions?
- Metadata polling frequency?

---

# 9. Schedule Logic

## Define Scheduling Rules

Clarify:

- Timezone handling
- Weekly repeats
- One-off schedule overrides
- Guest shows
- Cancelled shows
- Daylight savings handling
- Now-playing logic
- Upcoming show logic

This is one of the highest-risk bug areas.

---

# 10. Third-Party Integrations

## List Every External Service

Examples:

- Mixcloud
- SoundCloud
- Ticketing provider
- Newsletter provider
- Stripe
- Google Calendar
- CMS
- Analytics
- Cookie consent tools
- Social embeds

## Define Integration Contracts

For each integration define:

- Purpose
- Input/output data
- Authentication method
- Failure handling
- Rate limits
- Required at launch?

---

# 11. SEO Planning

## Define SEO Requirements

### Metadata

- Page titles
- Meta descriptions
- Open Graph images
- Twitter cards

### Technical SEO

- Sitemap.xml
- Robots.txt
- Canonical URLs
- Structured data/schema
- Redirect strategy
- Image optimisation

### Content SEO

- Heading hierarchy
- Alt text rules
- Slug rules
- Internal linking strategy

---

# 12. Accessibility

## Accessibility Requirements

Ensure:

- Colour contrast compliance
- Keyboard navigation
- Focus states
- Accessible labels
- Semantic HTML
- Alt text
- Reduced motion support
- Screen reader compatibility

---

# 13. Performance Planning

## Define Performance Targets

Examples:

- Lighthouse 90+
- Fast LCP
- Optimised images
- Lazy-loaded embeds
- Minimal JS bundle size

## Identify Performance Risks

Examples:

- Mixcloud embeds
- Large hero videos
- Too many animations
- Third-party scripts
- Poor image optimisation

---

# 14. Analytics & Tracking

## Define Tracking Events

Track:

- Live player usage
- Ticket clicks
- Studio booking clicks
- Newsletter signups
- Membership signups
- Search usage
- Artist/show engagement

## Define Naming Standards

Ensure:

- Consistent event naming
- Consistent property naming
- Funnel tracking
- UTM strategy

---

# 15. Development Phases

## Phase 1 — Foundations

- Design system
- Routing
- CMS setup
- Global layouts
- Navigation

## Phase 2 — Core Content

- Homepage
- Shows
- Artists
- Events
- Schedule

## Phase 3 — Live Experience

- Audio player
- Now playing
- Schedule logic
- Archive embeds

## Phase 4 — Commercial Features

- Studio booking
- Membership
- Ticketing
- Newsletter flows

## Phase 5 — Polish & Optimisation

- SEO
- Accessibility
- Analytics
- QA
- Performance optimisation

---

# 16. Documentation & PRDs

## Create Dedicated Documents

Required:

- Website PRD
- Design System PRD
- CMS Schema PRD
- Audio Player PRD
- Schedule PRD
- Analytics Specification
- SEO Specification
- QA Test Plan
- Accessibility Checklist

---

# 17. Figma Handoff Checklist

## Ensure Figma Includes

- Named pages
- Named components
- Auto-layout usage
- Component variants
- Mobile layouts
- Realistic content
- Interaction notes
- Export-ready assets
- Design tokens
- Empty/loading/error states

---

# 18. AI-Assisted Build Preparation

## Prepare AI-Friendly Documentation

Create:

```txt
PROJECT_OVERVIEW.md
DESIGN_SYSTEM.md
CMS_SCHEMA.md
COMPONENT_INVENTORY.md
BUILD_PHASES.md
QA_TEST_PLAN.md
SEO_REQUIREMENTS.md
ANALYTICS_EVENTS.md
```

## Define AI Coding Standards

Clarify:

- Naming conventions
- Folder structure
- Component architecture
- State management
- Accessibility rules
- Testing standards
- Styling system

---

# 19. QA & Testing

## Functional Testing

Test:

- Navigation
- Forms
- Search
- Filters
- Player behaviour
- CMS rendering
- Schedule logic

## Responsive Testing

Test:

- Mobile layouts
- Tablet layouts
- Edge-case screen sizes

## Browser Testing

Test:

- Chrome
- Safari
- Firefox
- Edge
- Mobile Safari
- Chrome Android

## Content Testing

Test:

- Long titles
- Missing content
- Broken images
- Empty states

---

# 20. Highest Risk Areas

## Most Common Failure Points

- Mobile navigation
- Audio persistence
- Schedule/timezone logic
- CMS inconsistency
- Third-party embeds
- Image handling
- SEO migration
- Performance regressions
- Accessibility oversights

These areas should receive additional planning and testing.

---

# 21. Recommended Immediate Next Steps

## Suggested Sequence

### Step 1

Finalise sitemap and user journeys.

### Step 2

Complete design system and component inventory.

### Step 3

Define CMS schema and content relationships.

### Step 4

Write PRDs for:

- Player
- Schedule
- Shows
- Artists
- Events
- Booking

### Step 5

Prepare AI-assisted build documentation.

### Step 6

Define acceptance criteria and QA strategy before coding begins.

---

# Final Goal

The target is to produce a:

- Consistent
- Performant
- Accessible
- Maintainable
- Scalable
- AI-assisted
- CMS-friendly
- Mobile-first

website that can evolve over time without accumulating technical or design debt.

