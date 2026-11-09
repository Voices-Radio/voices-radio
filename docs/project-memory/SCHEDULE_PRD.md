# Schedule PRD

## Objective

Provide a reliable schedule experience that correctly handles live, past, upcoming, empty, and timezone-sensitive states.

## Current Inputs

- Current code normalizes Airtime `week-info` through `app/api/week-info/route.ts`.
- User timezone is passed from the browser.

## Required Rules

- Timezone-aware formatting.
- Daylight saving handling.
- Weekly repeating shows.
- One-off overrides.
- Guest shows.
- Cancelled shows.
- Live and upcoming show logic.
- Empty day state.
- API error state.

## Build Decisions Needed

- Whether schedule remains Airtime-backed or moves behind the Voices API.
- Whether cancelled/guest/override data exists in the backend.
- Cache/revalidation interval.
- Date range for schedule browsing.
