# QA Test Plan

## Responsive Viewports

Test every launch-critical page at:

- `320px`
- `390px`
- `768px`
- `1024px`
- `1280px`
- `1440px`

## Functional Areas

- Navigation opens, closes, preserves focus, and highlights current route.
- Live player can start, stop/pause, recover from stream errors, and show loading/offline states.
- Now-playing metadata handles current show, live DJ, no data, and station offline.
- Schedule handles empty days, long show names, live state, past state, timezone changes, and API failure.
- Show and artist cards handle missing images, long names, missing genre, and missing archive content.
- Search handles empty query, no results, loading, grouped results, and API errors.
- Event cards handle cancelled, sold out, past, no ticket link, and missing venue.
- Forms validate required fields and expose success/error states.

## Accessibility Checks

- Keyboard-only navigation.
- Visible focus states.
- Semantic landmarks and headings.
- ARIA labels for icon-only controls.
- Player controls are announced correctly.
- Contrast meets WCAG AA.
- Reduced motion disables non-essential animation.
- Images have useful alt text or are explicitly decorative.

## Performance Checks

- Lighthouse target: 90+ for performance, accessibility, best practices, SEO.
- LCP image or video is optimized.
- Mixcloud/SoundCloud embeds are lazy-loaded.
- Third-party scripts are deferred where possible.
- Animation does not cause layout shift.

## Regression Checks

- Existing live site routes remain available or have redirects.
- Sanity-powered pages do not break while migrating.
- Sitemap and robots output remain valid.
- No secrets or private API tokens are exposed in client bundles.

## Tooling

- `npm run lint`
- `npm run build`
- Browser verification for local pages after frontend changes.
- Screenshot checks for key mobile and desktop breakpoints.
