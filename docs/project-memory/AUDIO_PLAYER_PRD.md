# Audio Player PRD

## Objective

Create a persistent, mobile-first live audio experience that keeps `Listen Live` globally available and resilient across route changes.

## Required States

- Stopped
- Loading
- Playing
- Paused
- Offline
- Error
- Metadata unavailable

## Current Inputs

- Stream URL in current code: `https://voicesradio.out.airtime.pro/voicesradio_a`
- Live metadata: Airtime `live-info-v2`

## Build Decisions Needed

- Global state container choice.
- Route persistence strategy.
- Metadata polling interval.
- Artwork fallback rules.
- Media Session API metadata fields.
- Error retry and fallback copy.
