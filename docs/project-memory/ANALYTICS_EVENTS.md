# Analytics Events

## Naming Convention

Use lowercase snake_case event names:

- `player_play_clicked`
- `ticket_cta_clicked`
- `studio_booking_cta_clicked`

Use consistent properties:

- `page_path`
- `component`
- `position`
- `item_id`
- `item_slug`
- `item_title`
- `source`
- `status`

## Launch Events

| Event                         | Trigger                            | Key Properties                         |
| ----------------------------- | ---------------------------------- | -------------------------------------- |
| `player_play_clicked`         | User starts live player            | `page_path`, `component`, `source`     |
| `player_stop_clicked`         | User stops player                  | `page_path`, `component`               |
| `player_error_seen`           | Player enters error state          | `page_path`, `error_code`, `source`    |
| `schedule_day_changed`        | User changes schedule day          | `page_path`, `selected_day`            |
| `show_card_clicked`           | User opens show detail             | `show_slug`, `position`, `source`      |
| `artist_card_clicked`         | User opens artist detail           | `artist_slug`, `position`, `source`    |
| `genre_filter_selected`       | User selects genre/filter          | `filter_value`, `source`               |
| `search_submitted`            | User submits search                | `query_length`, `result_count`         |
| `search_result_clicked`       | User clicks a result               | `result_type`, `item_slug`, `position` |
| `ticket_cta_clicked`          | User clicks ticket link            | `event_slug`, `provider`               |
| `studio_booking_cta_clicked`  | User clicks booking CTA            | `page_path`, `component`               |
| `membership_cta_clicked`      | User clicks membership/support CTA | `page_path`, `component`               |
| `newsletter_signup_submitted` | User submits newsletter            | `page_path`, `component`, `status`     |
| `external_social_clicked`     | User clicks social link            | `platform`, `item_type`, `item_slug`   |

## Privacy Rules

- Do not send email addresses, names, free-text messages, auth tokens, or precise location.
- Avoid tracking full search query text unless explicitly approved; prefer `query_length` and result metadata.
- Respect cookie consent requirements once analytics provider is confirmed.

## Open Questions

- Confirm analytics provider for redesign.
- Confirm consent management tool.
- Confirm whether Fathom remains in use.
