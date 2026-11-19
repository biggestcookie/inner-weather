# inner-weather — technical notes

> Stack and architecture notes for contributors. See `docs/product-vision.md` for the product framing.

**Project:** atmospheric feelings map (PWA)
**Package manager:** bun

## Status

`d3-force` and `anime.js` are described below as required for drift / focus / bloom mechanics but are **not yet installed**. They are listed as planned dependencies in `AGENTS.md` and should be added (via `bun add`) when those features are implemented.

The Logbook storage helpers are implemented — the `logbook` database via `idb`, in `app/utils/recordedEmotions.ts`. The keep flow and the entry page are implemented: _keep this feeling_ in the emotion card saves the moment and opens `/logbook/[id]`, where the moment and an optional note (autosaved on blur/debounce) can be edited and the feeling can be _let go_. The Logbook shows the month's kept feelings as family-colored dots, and the selected day's rows (emotion, time, one line of the note) reopen their entry page. The emotion types and sample vocabulary (`app/types/`, `app/assets/data/emotions.json`) are in place.

The responsive shell (mobile-first two-pane layouts) is scaffolded: the emotion card and the Logbook day panel render their quiet empty states until the drift mechanics and the Logbook rows give them content.

## Frontend stack

- **Framework:** Nuxt 4 (SPA mode — `ssr: false`)
- **UI:** `@nuxt/ui` + Tailwind CSS for typography, simple UI, and absolute positioning. Custom scoped CSS for complex gradients / animations.
- **PWA:** `@vite-pwa/nuxt`
- **Utilities:** `@vueuse/nuxt` — crucial for `useMouse`, `useTouch`, `useWindowSize`

## Responsive layout (mobile-first)

Every screen is designed at phone width first and widens into side-by-side panes on desktop.

- **Breakpoints come from the styling tools, never from ad-hoc widths.** Tailwind CSS v4 (via `@nuxt/ui`) defines the scale — `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem (`--breakpoint-*` in the Tailwind theme). The desktop two-pane switch is **`lg` (64rem)**. Responsive placement and layout live in Tailwind utility classes in the templates; scoped CSS stays for atmosphere (gradients, glass, blur) and bespoke visuals (the pill, calendar dots), per the stack split above. If scoped CSS must react to a breakpoint, mirror `--breakpoint-lg: 64rem` and say so in a comment.
- **Shell (`app/app.vue`):** one viewport-tall frame (`100dvh`, so mobile browser toolbars don't jump the layout), with the pill nav floating at the bottom at **every** size and safe-area aware (`viewport-fit=cover` + `env(safe-area-inset-bottom)`). Scrolling panes keep bottom padding so nothing hides behind the pill.
- **Map (`/`):** mobile — full-bleed atmosphere, and the emotion card overlays the map just above the pill when a feeling is focused. Desktop — two panes: the map fills the left, and the emotion card sits in a fixed-width right pane (`w-80`, `w-96` from `xl`) that is always visible; with nothing focused it shows a quiet empty state. Panes scroll on their own; the map keeps its full height.
- **Logbook (`/logbook`):** mobile — the calendar stacks above the selected day's list and the page scrolls. Desktop — calendar in the left pane, the day's kept feelings in a fixed-width right pane (`w-80`, `w-96` from `xl`) with its own scroll. Tapping a day selects it and drives the list.
- **Entry page (`/logbook/[id]`):** stays single-column at every size — a focused reading/writing screen needs no side pane.
- **Light DOM rule holds across sizes:** the two-pane layouts add at most one extra card or panel per screen; nothing grows into a component library.

## Interaction & animation layer

- **Physics / layout (planned):** `d3-force`. Used strictly for calculating node repulsion and drifting coordinates so DOM elements never overlap.
- **Animation / easing (planned):** `anime.js` v4. Handles smooth camera/viewport panning, spring physics, and soft fade-ins for text reveals.

## Data model

Naming: code and data names stay agnostic and descriptive — `Emotion`, `RecordedEmotion` — while the poetic in-app vocabulary ("keep", "kept feeling", "The Logbook") lives in copy only.

### Emotions

The vocabulary lives in `app/assets/data/emotions.json`, a hand-editable JSON file (sample content only for now), exposed typed via `app/utils/emotions.ts` (`emotions`, `getEmotionById()`).

Each emotion carries metadata beyond its word:

```ts
interface Emotion {
  id: string
  word: string
  family: string       // core feeling (3–5 families total)
  hue: string          // CSS color for the family; sub-emotions vary only in lightness
  definition: string   // short, plain language
  examples: string[]   // "it might show up as" — everyday situations
  relatedIds: string[] // ids of nearby/similar emotions
}
```

**Color rule:** `hue` is assigned per family and inherited by sub-emotions as lightness variations only. This keeps the Logbook calendar readable — at most 4–5 hues ever appear as dots — and keeps map, explorer, and Logbook speaking one color language.

### Recorded emotions (IndexedDB)

```ts
interface RecordedEmotion {
  id: string
  emotionId: string
  occurredAt: string   // ISO timestamp, user-editable (backfilling a feeling from earlier)
  note?: string        // optional; autosaved on blur/debounce
  createdAt: string
}
```

- Recordings live in IndexedDB — the `logbook` database with one `recordedEmotions` object store (keyPath `id`), opened via `idb` in `app/utils/recordedEmotions.ts` (`createRecordedEmotion`, `saveRecordedEmotion`, `getRecordedEmotion`, `getRecordedEmotions`, `deleteRecordedEmotion`). localStorage stays for ephemeral flags only.
- The schema is versioned from the first release (`dbVersion` in `app/utils/recordedEmotions.ts`, currently v1); bump it and migrate in `upgrade` there, and document any migration here when the shape changes (see `AGENTS.md`).
- No server sync — the client-only privacy guarantee applies to recordings above all.

### Content reference (vocabulary expansion)

The full word list will be derived from an existing feelings wheel — see the shortlist in the dev log / next step — using it for **word lists and grouping only**. Wheel *images* are copyrighted (and the common MentalHealth.AE recreation is CC BY-NC-ND — no derivatives), so all definitions, examples, and `relatedIds` links are written fresh in `emotions.json`, with the wheel credited in the README.

## Routing & screens

The app is served from the domain root (`baseURL: "/"`).

- `/` — the map (drift / focus / bloom). The query param `/?emotion=<id>` deep-links to a single emotion: the map focuses it and opens the emotion card. This is the explorer share button's target and carries only a public emotion id — never personal data.
- `/logbook` — the calendar plus the selected day's list on one route, as local view state: stacked on mobile, side by side from `lg` (see the responsive layout section above). The calendar renders unconditionally (plain date math + a Tailwind grid — no date library, per the light-DOM rule below): an empty month is a quiet month, not an empty state. A standalone reverse-chronological List view remains in `docs/product-vision.md` but is not part of the current shell.
- `/logbook/[id]` — the entry page; first-write and read/edit share the same screen. The keep flow opens it with `?fresh=1` for the one-time _kept._ confirmation.
- The explorer is **not** a route: it is the emotion card (`app/components/EmotionCard.vue`) — a peek overlay over the map on mobile, the map's fixed right pane on desktop, _read more_ expanding to full screen — so the atmosphere stays visible while reading. Its share button emits the `/?emotion=<id>` hotlink via `navigator.share`, with a clipboard copy fallback.
- A persistent bottom pill nav (in `app.vue`, two segments with a sliding indicator) switches between map and logbook at every screen size — the Logbook is reachable from any screen.

## Architectural guidelines

- **Hybrid rendering approach:** the background should be a fluid, atmospheric visual (CSS radial mesh / blur filters), while the text nodes _must_ remain absolute-positioned standard HTML DOM elements. This ensures crisp fonts, reliable touch targets, and accessibility.
- **UI constraint:** do not introduce heavy component libraries (Vuetify, HeadlessUI, etc). Keep the DOM light to maintain performance on mobile and preserve the artsy, organic aesthetic.
- **State management:** track the single "active/centered" node. Dynamically render only the parent, the active node, and its immediate sub-nodes to keep the DOM uncluttered and the physics simulation performant. The Logbook and entry page live outside the physics canvas entirely.
- **Copy is design:** definitions, examples, and placeholder text follow the vocabulary rules in `docs/product-vision.md` ("keep", "let this one go", invitational phrasing). No streaks, scores, reminders, or other gamification in the UI.