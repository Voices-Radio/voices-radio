# Project Overview

## Objective

Redesign and rebuild the Voices Radio website as a scalable, mobile-first radio, discovery, and community platform. The current codebase matches the live site, which is primarily a content and station presence site with live player, schedule, chat, studio/podcast pages, partners, and Sanity-managed editorial content.

The new design should support richer discovery of shows, hosts/artists, genres, events, studio bookings, and memberships while keeping `Listen Live` as the strongest recurring action.

## Primary Goals

1. Increase live radio listening.
2. Improve discovery of shows, artists, hosts, genres, and archive episodes.
3. Promote events and ticket conversion.
4. Drive studio booking enquiries.
5. Grow memberships or support flows.
6. Build community engagement through chat, contact, and submission flows.
7. Improve mobile usability and performance.

## CTA Hierarchy

1. Listen Live
2. View Schedule
3. Explore Shows
4. Book Studio
5. Buy Tickets
6. Join Membership

`Listen Live` should remain globally available. Lower-priority CTAs should be contextual so mobile screens do not become a wall of buttons.

## Core User Journeys

- Listen live: entry point -> global player -> now-playing context -> schedule/up-next.
- Browse schedule: entry point -> day/week view -> show detail -> listen/archive reminder path.
- Discover shows: entry point -> search/filter by genre/host -> show page -> archive embeds.
- Explore artists/residents: entry point -> artist grid/filter -> artist profile -> shows/socials.
- Events: entry point -> event listing -> event detail -> ticket CTA.
- Studio booking: entry point -> booking landing page -> packages/context -> enquiry CTA.
- Membership/support: entry point -> value proposition -> signup/support CTA.
- Submit music/contact: entry point -> contact/submission page -> external or form integration.
- Search: entry point -> query -> grouped results -> show/artist/event/article detail.

## MVP Scope

- Global live player and now-playing state.
- Schedule with resilient timezone handling.
- Show index and show detail pages.
- Artist/host index and detail pages.
- Event listing and detail pages.
- Responsive homepage and navigation.
- CMS/API integration layer.
- SEO, accessibility, analytics, and performance baseline.

## Future Scope

- User accounts.
- Saved favourites.
- Mobile app sync.
- Personalized recommendations.
- Chat/community platform upgrades.
- Advanced memberships.
- Notifications and artist alerts.

## Initial Sitemap

- `/`
- `/listen-live`
- `/schedule`
- `/shows`
- `/shows/[slug]`
- `/artists`
- `/artists/[slug]`
- `/events`
- `/events/[slug]`
- `/studio-booking`
- `/membership`
- `/news`
- `/news/[slug]`
- `/about`
- `/contact`
- `/search`
- `/privacy-policy`
- `/terms`
- `/cookies`

## Current Implementation Notes

- Framework: Next.js app router, React 18, Tailwind CSS.
- Current CMS: Sanity, with schemas for home, about, services, podcast, blog, partner, and settings.
- Current live data: Airtime endpoints are used directly for live info and week info.
- New backend docs describe a richer API at `https://api.voicesradio.co.uk`, including users, artists, shows, gigs/events, venues, producer slots, comments, and messaging.

## Open Questions

- Which content remains in Sanity versus moving to the Voices API?
- Should `artists` include all DJs/hosts or only presenter-linked profiles?
- Are events powered by `gigs`, a separate public event source, a ticketing provider, or Sanity?
- What membership provider and newsletter provider are launch-critical?
- Should `/listen-live` exist as a dedicated page if the global player is persistent?
