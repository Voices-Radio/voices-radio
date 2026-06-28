# Component Inventory

## Figma Sources

Prototype Mobile top-level frames include:

- `iPhone 16 v.3 - start`
- `iPhone 16 v.3 - buffering`
- `iPhone 16 v.3 - audio playing`
- `iPhone 16 v.3 - video playing`
- `iPhone 16 Menu`
- `iPhone 16 Discover Home`
- `iPhone 16 Discover Home - Genres Expanded`
- `iPhone 16 Discover Home - Genres Active`
- `Discover - Mobile Series`
- `iPhone 16 Hosts`
- `iPhone 16 Genres Result`
- `Host LP`
- `Show LP`
- `Audio Player Bar`
- `Audio Player Bar - Paused`
- `Fullscreen Video (Landscape)`

Component Library top-level items include:

- `Brand Assets`
- `Card` component set
- `Host card`
- Small component sets currently named `Component 8` and `Component 1`; rename in Figma before handoff.

## Foundation Components

| Component               | Launch Need | States Required                           | Data Source      |
| ----------------------- | ----------- | ----------------------------------------- | ---------------- |
| App shell               | MVP         | loading, error fallback                   | Next layout      |
| Header/navigation       | MVP         | open, closed, active route, sticky        | settings/content |
| Mobile navigation       | MVP         | open, closed, current route, disabled CTA | settings/content |
| Footer                  | MVP         | normal, missing link fallback             | settings/content |
| Button                  | MVP         | hover, active, disabled, loading          | local            |
| Icon button             | MVP         | hover, active, disabled, aria label       | local            |
| Text input/search input | MVP         | focus, filled, disabled, error, loading   | local            |
| Tabs/segmented control  | MVP         | active, inactive, disabled                | local            |
| Filter chips            | MVP         | selected, unselected, disabled            | local/API facets |
| Card surface            | MVP         | default, hover, selected, skeleton, empty | local            |

## Radio Components

| Component                   | Launch Need    | States Required                                   | Data Source          |
| --------------------------- | -------------- | ------------------------------------------------- | -------------------- |
| Global audio player         | MVP            | stopped, loading, playing, paused, error, offline | Airtime/stream/API   |
| Mini-player/mobile bar      | MVP            | collapsed, expanded, playing, paused              | global player state  |
| Now-playing metadata        | MVP            | current show, live DJ, station offline, loading   | Airtime live info    |
| Schedule row                | MVP            | past, live, upcoming, cancelled, empty            | Airtime/API schedule |
| Schedule day/week view      | MVP            | loading, no shows, error, timezone mismatch       | Airtime/API schedule |
| Archive embed               | MVP            | Mixcloud, SoundCloud, loading, unavailable        | shows API            |
| Fullscreen video/audio mode | Future/MVP TBD | portrait, landscape, controls visible/hidden      | media provider       |

## Discovery Components

| Component             | Launch Need | States Required                                      | Data Source        |
| --------------------- | ----------- | ---------------------------------------------------- | ------------------ |
| Show card             | MVP         | default, hover, featured, missing image, no episodes | shows API          |
| Show detail hero      | MVP         | missing image, long title, multiple hosts            | shows/artists API  |
| Episode/archive card  | MVP         | default, embedded, unavailable                       | shows API/platform |
| Artist/host card      | MVP         | default, hover, missing image, featured              | artists API        |
| Artist profile header | MVP         | missing bio, missing socials, aliases                | artists API        |
| Genre row             | MVP         | expanded, collapsed, active, empty                   | genre taxonomy/API |
| Alphabet index        | MVP         | active, disabled letters, sticky                     | artists API        |
| Search results        | MVP         | loading, no results, grouped results, error          | search adapter     |

## Commercial And Community Components

| Component               | Launch Need    | States Required                                    | Data Source           |
| ----------------------- | -------------- | -------------------------------------------------- | --------------------- |
| Event card              | MVP            | upcoming, sold out, cancelled, past, missing image | gigs/events/ticketing |
| Event detail            | MVP            | no lineup, no ticket link, venue missing           | gigs/events/ticketing |
| Studio booking CTA      | MVP            | default, submitted/success, unavailable            | Sanity/API/form       |
| Membership CTA          | Future/MVP TBD | default, loading, external failure                 | membership provider   |
| Newsletter form         | Future/MVP TBD | empty, valid, invalid, submitting, success, error  | newsletter provider   |
| Contact/submission form | MVP TBD        | validation, submitting, success, error             | form provider/API     |

## Handoff Requirements

Each component should have:

- Named Figma component or frame.
- Desktop and mobile variants.
- Responsive behavior notes.
- Required data fields.
- Empty, loading, and error states.
- Accessibility notes.
- Tracking event names where relevant.

## Current Risks

- Some Figma component sets still have generic names.
- Current code has live player and schedule components, but the new design requires a more persistent global player model.
- The API docs include entities beyond the public website; frontend launch scope must avoid exposing admin/user workflows unintentionally.
