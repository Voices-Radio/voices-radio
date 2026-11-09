# Voices Radio Website Redesign Memory

This folder is the working memory for the Voices Radio redesign. Use it before making build decisions, and update it whenever the design, API contract, content model, or Definition of Done changes.

## Source Documents

- Checklist / Definition of Done: `docs/voices_radio_website_design_to_build_checklist.md`
- Backend/API contract: `docs/VOICES_RADIO_API_DOCUMENTATION.md`
- Figma: `Voices Design`, file `l6q9EXNRODwoRdI8vRXEHp`
  - Mobile prototype page: `Prototype Mobile` / `304:224`
  - Desktop prototype page: `Prototype Desktop` / `1159:14688`
  - Desktop home: `Desktop Home` / `1159:15647`
  - Desktop explore: `Discover - Desktop Explore` / `1159:14689`
  - Desktop artists: `Discover - Artists` / `1159:14825`
  - Design system page: `Design System` / `37:14`
  - Component library page: `Component Library` / `48:1265`
- Current live site reference: `https://www.voicesradio.co.uk/`

## Memory Structure

- `PROJECT_OVERVIEW.md`: product goals, audience, journeys, sitemap, routing assumptions.
- `DESIGN_SYSTEM.md`: Figma-derived tokens, typography, visual principles, implementation notes.
- `COMPONENT_INVENTORY.md`: component map, states, source of truth, build readiness.
- `CMS_SCHEMA.md`: content and API model mapping for frontend build planning.
- `BUILD_PHASES.md`: phased delivery plan and dependencies.
- `QA_TEST_PLAN.md`: checklist-driven verification plan.
- `SEO_REQUIREMENTS.md`: metadata, structured data, sitemap, and content SEO rules.
- `ANALYTICS_EVENTS.md`: tracking taxonomy and launch event list.
- `DEFINITION_OF_DONE.md`: checklist traceability gates.
- `WEBSITE_PRD.md`: product requirements for the public website.
- `DESIGN_SYSTEM_PRD.md`: requirements for token and component foundations.
- `AUDIO_PLAYER_PRD.md`: live player requirements.
- `SCHEDULE_PRD.md`: schedule logic requirements.
- `SEO_SPECIFICATION.md`: SEO implementation specification wrapper.
- `ANALYTICS_SPECIFICATION.md`: analytics implementation specification wrapper.
- `ACCESSIBILITY_CHECKLIST.md`: accessibility verification checklist.

## Update Rules

1. Record decisions as stable facts only after they are visible in Figma, API docs, code, or explicit user direction.
2. Put unresolved items under `Open Questions` instead of guessing.
3. Keep implementation docs aligned with the checklist; if a checklist item is not satisfied, mark it as pending.
4. Prefer links to source files and Figma node IDs over duplicated long descriptions.
5. When build starts, each PR should reference the relevant memory file and DoD gate.
