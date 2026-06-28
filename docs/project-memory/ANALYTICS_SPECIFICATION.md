# Analytics Specification

The event taxonomy is documented in `ANALYTICS_EVENTS.md`.

## Build Acceptance Criteria

- Events use lowercase snake_case names.
- Event properties avoid PII and free-text content unless explicitly approved.
- Player, schedule, show, artist, search, ticket, studio booking, membership, newsletter, and social-link interactions are tracked where present.
- Analytics calls are isolated behind a helper so provider changes do not touch components.
- Consent requirements are implemented before non-essential tracking is enabled.
