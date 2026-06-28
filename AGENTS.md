# AGENTS.md

## Project Overview

Voices Radio is a private Next.js app for the Voices Radio website, with station, podcast, blog, schedule, studio, and Sanity CMS surfaces. Keep work focused on the requested feature or fix; do not broaden changes into unrelated redesigns, content edits, or dependency churn.

## Tech Stack

- Next.js 14 App Router, React 18, TypeScript with `strict` enabled.
- Tailwind CSS, custom theme tokens in `tailwind.config.js`, global styles in `app/globals.css`.
- Sanity CMS via `sanity`, `next-sanity`, schemas in `schemas/`, queries/config in root Sanity files.
- ESLint uses `next/core-web-vitals`; Prettier is configured through the package scripts.

## Key Directories

- `app/`: App Router routes, layouts, API routes, station/podcast/studio pages, and shared app components.
- `app/components/`: Reusable UI components used by routes.
- `hooks/`: Client-side React hooks for live info, timers, scripts, and week data.
- `lib/`: Shared utilities, fetch helpers, site URL helpers, and Voices-specific logic.
- `schemas/`: Sanity schema definitions.
- `icons/`: Local React/icon assets referenced by the UI.
- `public/`: Public static assets; inspect only assets relevant to the task.
- `docs/`: Planning/project-memory notes; read only when the task references them.
- `bolt/`: Separate Vite project; avoid unless the task is explicitly about it.

## Setup, Dev, and Verification Commands

- Install: infer the package manager from the task/current lockfile context; ask before changing package-manager strategy.
- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- No dedicated test script is currently defined in `package.json`.

## Coding Style

- Follow existing App Router, component, hook, and utility patterns before adding abstractions.
- Prefer TypeScript types at boundaries and keep `strict` compatibility.
- Use the `@/*` path alias when it matches nearby imports.
- Prefer small, pure helpers and immutable React state updates.
- Keep components accessible: semantic elements, labels, keyboard behavior, and sensible alt text.
- Use existing Tailwind tokens/classes and local design conventions before introducing new visual systems.
- Ask before adding new dependencies or changing lockfiles.
- Do not rewrite formatting across unrelated files.

## Context and File Reading Rules

- Do not scan the whole repository by default.
- Before reading many files, state which files or directories you plan to inspect and why.
- Prefer `rg`, `rg --files`, `find`, and shallow directory listings over broad recursive reads.
- Inspect only files directly relevant to the active task, plus nearby call sites when needed.
- Avoid opening large files, generated files, binary assets, lockfiles, logs, or archived material unless directly required.
- Use README/config/package files for orientation, then move to the smallest relevant source set.

## Avoid in Normal Context

- `node_modules/`, `.next/`, `dist/`, `build/`, `coverage/`, `.git/`
- `logs/`, `*.log`, `.codex-screenshots/`
- `*.lock`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` unless dependency work requires them
- `*.pdf`, `*.png`, `*.jpg`, `*.jpeg`, `*.csv` unless an asset/data task requires them
- `generated/`, `archive/`, `secrets/`, `uploads/`
- `.env*` and any file likely to contain credentials
- `public/optimized/` unless image optimization/output behavior is the task

## Testing Expectations

- Run the smallest relevant verification after changes, usually `npm run lint` for code edits.
- Run `npm run build` when changes affect routing, server components, Sanity data flow, metadata, or config.
- If no automated test covers the change, explain the manual/limited verification performed.
- If a command cannot run, report the reason and the remaining risk.

## Security and Secrets

- Never print secrets, tokens, credentials, cookies, or full environment variables.
- Do not read `.env*` files unless the user explicitly asks and the task requires it.
- Validate external inputs at API/CMS boundaries and avoid leaking sensitive errors to users.
- Before commit/deploy-related work, check touched code for hardcoded secrets, unsafe auth, XSS, injection, CSRF, and sensitive logging.
