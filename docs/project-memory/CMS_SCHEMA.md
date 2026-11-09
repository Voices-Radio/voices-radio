# CMS And API Schema Plan

## Current Content Sources

- Sanity currently powers settings, home, about, services, podcast, blog, partners, and SEO-ish editorial fields.
- Airtime currently powers live info and week schedule:
  - `https://voicesradio.airtime.pro/api/live-info-v2`
  - `https://voicesradio.airtime.pro/api/week-info`
- Voices API documentation defines `https://api.voicesradio.co.uk` for richer app/backend data.

## Launch Content Models

### Show

Required frontend fields:

- `id`
- `slug`
- `title`
- `description`
- `coverImage`
- `hosts`
- `genres`
- `scheduleSlot`
- `archiveEmbeds`
- `featured`

Likely backend mapping:

- API `shows.title`
- API `shows.description`
- API `shows.imageUrl` or `shows.metadata.artwork_url`
- API `shows.artistId`
- API `shows.platform`, `mixcloudUrl`, `soundcloudUrl`, `url`
- API `shows.featured`
- API `shows.date`, `show_date`, `upload_date`

Open issue: API docs do not show a slug field for `shows`; frontend may need deterministic slug generation or backend slug support.

### Artist / Host

Required frontend fields:

- `id`
- `slug`
- `name`
- `bio`
- `profileImage`
- `bannerImage`
- `genres`
- `socialLinks`
- `shows`
- `featured`

Likely backend mapping:

- API `artists.name`
- API `artists.bio`
- API `artists.imageUrl`
- API `artists.bannerUrl`
- API `artists.genres`
- API `artists.socialLinks`
- API `artists.featured`
- API `artists.platforms`, `mixcloudUsername`, `soundcloudUsername`

Open issue: API docs do not show a slug field for `artists`; frontend may need backend slugs to avoid broken URLs if names change.

### Event

Required frontend fields:

- `id`
- `slug`
- `title`
- `dateTime`
- `venue`
- `description`
- `artwork`
- `ticketLink`
- `status`
- `lineup`

Possible backend mapping:

- API `gigs.title`
- API `gigs.eventDate`
- API `gigs.startTime`, `endTime`
- API `gigs.status`
- API `gigs.venue`
- API `gigs.description`
- API `gigs.genre`
- API `venues.name`, location fields

Open issue: `gigs` are operational bookings and may not equal public events. Confirm event source before build.

### Schedule

Required frontend fields:

- `day`
- `startTime`
- `endTime`
- `show`
- `host`
- `repeating`
- `liveOrPrerecorded`
- `status`

Current source:

- Airtime week-info and live-info endpoints.

Open issue: API docs do not define a dedicated schedule collection. Decide whether schedule remains Airtime-backed or is normalized through the Voices API.

## Validation Rules

- Slugs must be stable and unique.
- Images should have fallback handling and alt text.
- URLs must be valid and safe for external linking.
- Dates must be timezone-aware.
- Public event statuses must not expose internal booking states without translation.
- Artist/show descriptions should support empty and long-form content.

## Adapter Strategy

Build a typed data-access layer rather than binding UI directly to API shapes:

- `getLiveInfo()`
- `getScheduleRange()`
- `getShows()`
- `getShow(slug)`
- `getArtists()`
- `getArtist(slug)`
- `getEvents()`
- `getEvent(slug)`
- `searchSite(query)`

Each adapter should normalize loading, empty, and error cases for components.

## Open Questions

- Which endpoints are public and unauthenticated?
- Are image URLs absolute, signed, or relative?
- Will the website need authenticated user/member flows at launch?
- Should Sanity remain the editorial CMS for static pages/news while API owns radio data?
