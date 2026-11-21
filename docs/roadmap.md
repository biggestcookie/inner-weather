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
- [x] Responsive shells: map + emotion card (overlay — bottom on mobile, right
      on desktop), Logbook month calendar + selected-day panel, entry page
      placeholder

## Step 2 — the keep flow + the entry page ✅

- [x] A record factory (`createRecordedEmotion`) for a fresh keep
- [x] _keep this feeling_ in the explorer peek — opens the draft editor
- [x] Entry page: edit and read-only modes; _log this feeling_ and _save changes_
- [x] Entry page: the emotion word, large, in its own color
- [x] Entry page: the moment — date/time, tappable and editable (feelings are
      often named hours late)
- [x] Entry page: an optional note with gentle, rotating placeholders, saved
      with the entry
- [x] Entry page: _go back_ — contextual map/logbook navigation
- [x] Entry page: _let this one go_ — delete or discard, with a dirty-changes
      prompt
- [x] Entry page: a quiet state when the kept feeling is gone

## Step 3 — the Logbook contents ✅

- [x] Day list rows: the emotion in color, the time, one line of the note —
      tapping one reopens its entry page
- [x] Calendar dots colored by the feeling's family, so a month becomes a small
      sky of its own
- [x] The day panel's quiet copy for empty days

## Step 4 — the drift & the focus ✅

- [x] Add `d3-force` and `anime.js` (see `AGENTS.md` — planned dependencies)
- [x] The drift: DOM text nodes float and avoid collisions via light physics
- [x] The focus: tapping a word pans the camera to center it and opens its card

## Step 5 — the web & the explorer 🔄

- [x] The map starts with the wheel's core words; selecting one pulls it just
      outside the cloud and reveals its related words (the next ring) in an
      outward arc around it, while the cloud only shuffles a little
- [x] The web is the faint lines from the selected word to its parent and its
      next ring — edge words keep their connection
- [x] Previous webs stay visible, fading a step per selection back; the trail
      clears on deselect
- [x] Selecting a related word keeps the web in place — only the center
      (camera) and the revealed ring change
- [x] Tap the anchor, empty space, or the card's close button → deselect, back
      to drift
- [x] Tap any other word → it becomes the next anchor immediately
- [ ] _read more_ — the peek expands to full screen (examples, full definition),
      with _keep_ still available
- [ ] The share button — a hotlink to `/?emotion=<id>`, `navigator.share` with a
      clipboard fallback

## Step 6 — the vocabulary & the copy

- [x] Choose the feelings wheel shortlist (word lists and grouping only —
      credited in the README; all writing stays ours): Willcox 1982, Plutchik
      1980, Williams' Emotion Sensation wheel, Rosenberg's NVC inventory — see
      `docs/emotion-vocabulary.md`
- [x] Expand `emotions.json` to a full wheel (103 words: 6 core, 30 clusters,
      67 precise words; every id from the 29-word sample preserved)
- [ ] The copy pass: read definitions and examples outward — core → cluster →
      precise word — and rewrite any that repeat a sibling instead of
      sharpening it. New copy is provisional until this pass.
- [ ] The copy pass: definitions, examples, and placeholder text — this is
      design work, not filler
