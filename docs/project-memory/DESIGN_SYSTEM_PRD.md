# Design System PRD

## Summary

Create a tokenized design system that translates the Figma redesign into reusable frontend primitives and page patterns.

## Requirements

- Implement color, typography, spacing, radius, breakpoint, motion, and z-index tokens.
- Keep token names semantic enough for product use and close enough to Figma for handoff.
- Provide primitives for buttons, icon buttons, inputs, chips, cards, tabs, modals, and loading skeletons.
- Support all checklist states: hover, active, disabled, loading, empty, and error.
- Preserve old Tailwind tokens until legacy pages are migrated.

## Acceptance Criteria

- Figma token values in `DESIGN_SYSTEM.md` map to Tailwind/CSS variables.
- Primitive components render correctly at `320px`, `390px`, `768px`, `1024px`, `1280px`, and `1440px`.
- Accessibility rules are built into primitives, especially focus states and icon labels.
- Typography implementation confirms Gabarito, Outfit, and Asap Condensed source/licensing.
