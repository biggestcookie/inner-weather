# agents.md — inner-weather

# Purpose

Concise developer-facing summary for contributors and automation. This file intentionally contains essential project facts — stack, tooling, architecture, and maintenance notes — and defers user-facing details to README.md.

# Project at-a-glance

- App: inner-weather — atmospheric feelings map, client-side PWA.
- Architecture: Client-only (Nuxt SSR off, SPA); no server-side services or cloud persistence.
- Source layout: Nuxt 4 — application code lives under `app/`.

## Stack & tooling

- Framework: Nuxt 4 (SPA mode)
- UI: `@nuxt/ui` + Tailwind CSS (typography, simple UI, absolute positioning). Custom scoped CSS for atmospheric gradients and animations.
- PWA: `@vite-pwa/nuxt` (service worker for app shell, web manifest for install metadata)
- Utilities: `@vueuse/nuxt` (useMouse, useTouch, useWindowSize, etc.)
- Package manager: bun
- Node: Recommended >=22
- Dev scripts (package.json): `dev` (`bun run dev`), `build` (`bun run build`), `preview` (`bun run preview`), `lint`, `typecheck`
- Linters/formatters: ESLint, Prettier

### Planned but not yet installed

- `d3-force` — physics/layout for node drift (repulsion so DOM nodes never overlap)
- `anime.js` v4 — animation/easing for tap-to-pan camera movement and soft fade-ins

These are required by the architecture in `docs/technical-notes.md` and should be added when implementing drift / focus / bloom mechanics.

## Storage & PWA

- Primary storage: IndexedDB (preferred) with localStorage for ephemeral flags.
- PWA: service worker for app shell caching; web manifest for install metadata.

## Architectural guidelines

- **Hybrid rendering:** the background must be a fluid, atmospheric visual (CSS radial mesh / blur filters). Text nodes must remain absolute-positioned standard HTML DOM elements so fonts stay crisp, touch targets are reliable, and the UI stays accessible.
- **DOM discipline:** do not introduce heavy component libraries (Vuetify, HeadlessUI, etc). Keep the DOM light to maintain mobile performance and the artsy, organic aesthetic.
- **State shape:** track a single "active/centered" node. Dynamically render only the parent, the active node, and its immediate sub-nodes to keep the DOM uncluttered and the physics simulation performant.
- **Privacy:** preserve the client-only guarantee — no analytics, telemetry, or server-side storage unless the architecture and docs are updated.

# Developer guidance / constraints

- Prefer small, surgical pull requests focused on one change.
- Plan for data migrations when changing storage schemas.
- All Vue components and pages must use `<script setup lang="ts">`.
- Block order in every `.vue` file must be `<script setup>`, then `<template>`, then `<style>`. No other order is accepted.
- Do not use the Nuxt hook `useSeoMeta` when creating new pages.

# Authoritative references

- Nuxt UI: https://ui.nuxt.com/docs/components
- Nuxt docs: https://nuxt.com/docs
- Project docs: `docs/product-vision.md`, `docs/technical-notes.md`

## Key files and locations

- Web manifest & PWA icons: `public/`
- Storage helpers: `app/utils/recordedEmotions.ts` (IndexedDB `logbook` database via `idb`). Service worker registration: `@vite-pwa/nuxt`
- Atmosphere + node physics: search under `app/` for the canvas/background component and the d3-force / anime.js integration once added

# Maintenance

Update this file when changing major tooling, altering the client-only architecture, or changing storage schemas. For feature requests and bugs, file focused issues with migration notes if applicable.