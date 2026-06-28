# SEO Requirements

## Global Rules

- Every public route must define title, description, canonical URL, Open Graph image, and Twitter card data.
- Use stable slugs for shows, artists, events, and articles.
- Avoid duplicate canonical pages for `/listen-live` and persistent player states.
- Ensure sitemap includes all indexable static and dynamic routes.
- Keep `robots.txt` aligned with launch route strategy.

## Route Metadata

| Route             | Metadata Need                                              |
| ----------------- | ---------------------------------------------------------- |
| `/`               | Brand, live radio, discovery, studio/community positioning |
| `/listen-live`    | Live stream and now-playing context                        |
| `/schedule`       | Weekly radio schedule                                      |
| `/shows`          | Show archive/discovery                                     |
| `/shows/[slug]`   | Show title, host, genres, artwork                          |
| `/artists`        | Residents/hosts discovery                                  |
| `/artists/[slug]` | Artist name, bio, image, social links                      |
| `/events`         | Upcoming Voices events                                     |
| `/events/[slug]`  | Event title, date, venue, artwork, ticket link             |
| `/studio-booking` | Studio booking offer                                       |
| `/membership`     | Membership/support offer                                   |
| `/news/[slug]`    | Article metadata                                           |

## Structured Data Candidates

- `Organization` for Voices Radio.
- `WebSite` with search action when search is live.
- `MusicEvent` or `Event` for public events.
- `Person` or `MusicGroup` only where artist data is reliable.
- `Article` for news posts.
- `RadioStation` if final schema support is appropriate.

## Content SEO Rules

- One clear H1 per route.
- Descriptive alt text for content images.
- Internal links between artists, shows, episodes, events, and schedule.
- Metadata should degrade gracefully when optional content is missing.

## Open Questions

- Confirm canonical production domain.
- Confirm default Open Graph image for missing artwork.
- Confirm redirect map from old pages to new routes.
