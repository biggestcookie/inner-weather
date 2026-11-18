# inner-weather — roadmap

> The task list for the dev cycle. Framing lives in `docs/product-vision.md`,
> stack and architecture in `docs/technical-notes.md`. Steps are ordered so the
> Logbook works end to end before the map mechanics arrive.

## Step 1 — foundation & shells ✅

- [x] Nuxt 4 SPA scaffold (PWA, `@nuxt/ui`, Tailwind v4) with bun scripts,
      ESLint, and Prettier
- [x] Viewport-tall shell (`100dvh`) with the floating pill nav
      (map / logbook), safe-area aware at every size
- [x] Atmospheric gradient backgrounds on every screen
- [x] Data model: `Emotion` / `RecordedEmotion` types, sample vocabulary
      (`app/assets/data/emotions.json`) with family hues, `emotions.ts`
      helpers
- [x] Kept-feeling storage: the `logbook` IndexedDB database (v1) via `idb` in
      `app/utils/recordedEmotions.ts`
- [x] Responsive shells: map + emotion card (peek overlay on mobile, side pane
      from `lg`), Logbook month calendar + selected-day panel, entry page
      placeholder

## Step 2 — the keep flow + the entry page ✅

- [x] A record factory (`createRecordedEmotion`) for a fresh keep
- [x] _keep this feeling_ in the explorer peek — saves the moment and opens the
      entry page
- [x] _kept._ — the confirmation on arrival
- [x] Entry page: the emotion word, large, in its own color
- [x] Entry page: the moment — date/time, tappable and editable (feelings are
      often named hours late)
- [x] Entry page: an optional note with gentle, rotating placeholders,
      autosaved on blur/debounce
- [x] Entry page: a way back to the feeling on the map
- [x] Entry page: _let this one go_ — delete, confirmed in two taps
- [x] Entry page: a quiet state when the kept feeling is gone

## Step 3 — the Logbook contents

- [ ] Day list rows: the emotion in color, the time, one line of the note —
      tapping one reopens its entry page
- [ ] Calendar dots colored by the feeling's family, so a month becomes a small
      sky of its own
- [ ] The day panel's quiet copy for empty days

## Step 4 — the drift & the focus

- [ ] Add `d3-force` and `anime.js` (see `AGENTS.md` — planned dependencies)
- [ ] The drift: DOM text nodes float and avoid collisions via light physics
- [ ] The focus: tapping a word pans the camera to center it, the bloom opens

## Step 5 — the bloom & the explorer

- [ ] The bloom: related sub-emotions and definitions soft-fade into the space
      around a focused word
- [ ] Nearby feelings soft-swap the peek from word to word
- [ ] _read more_ — the peek expands to full screen (examples, full definition),
      with _keep_ still available
- [ ] The share button — a hotlink to `/?emotion=<id>`, `navigator.share` with a
      clipboard fallback

## Step 6 — the vocabulary & the copy

- [ ] Choose the feelings wheel shortlist (word lists and grouping only —
      credited in the README; all writing stays ours)
- [ ] Expand `emotions.json` to the full vocabulary: 3–5 families with
      sub-emotions, definitions, examples, related ids, family hues
- [ ] The copy pass: definitions, examples, and placeholder text — this is
      design work, not filler
