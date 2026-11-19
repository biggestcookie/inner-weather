# inner-weather — product vision

> Working title: the atmospheric feelings map.

## The vision

A digital space to explore emotions that feels alive, organic, and deeply intuitive — moving away from the clinical, corporate "menu game" of traditional feelings wheels. This is a fluid, atmospheric environment where users can _feel_ their way through expanding vocabularies of emotion — and keep the ones that matter.

## The vibe

- **Organic & grounding:** no rigid trees, grids, or harsh boundaries.
- **Atmospheric:** an ambient gradient canvas that feels like a mood board.
- **Exploratory:** feelings drift softly. Tapping one gently brings it into focus and naturally surfaces related nuances.
- **Gentle:** nothing is required, nothing is scored. The app notices with you, never at you.

## Core mechanics

- **The drift:** HTML text nodes float gently on screen, avoiding collisions via light physics.
- **The focus:** tapping a word smoothly pans the camera/viewport to center it.
- **The bloom:** related sub-emotions and definitions soft-fade into the surrounding space organically.
- **The dwell:** exploring a focused word opens a soft peek over the map — a plain-language definition and nearby feelings — with a _read more_ that expands to full screen for the longer examples.
- **The keep:** any explored feeling can be kept. Keeping opens a journal page: the emotion, the moment, and an open field for whatever else was in the air.

## The screens

### 1. The map

The home canvas: drift, focus, bloom. Navigation is a quiet pill at the bottom of every screen — it slides between the map and the Logbook, so either is always one tap away. No tab bar, no chrome — the immersion stays.

### 2. The explorer

Opened from a focused word, in two reading depths:

- **Peek** — an overlay card over the map: the definition, _nearby feelings_, and the _keep_ button. The atmosphere stays visible.
- **Read more** — expands to full screen for the _it might show up as_ examples and the full definition. _Keep_ stays available here too.

Tapping a nearby feeling soft-swaps the peek to that word: wander until the word fits just right.

A **share** button hands out a hotlink back to this exact emotion — the map opens with the word already in focus and its definition showing. Feelings travel between people.

### 3. The entry page

One screen, two states — first-write and read/edit later:

- the emotion word, large, in its own color;
- the date/time, tappable and editable (feelings are often named hours late);
- an optional notes field with gentle, rotating placeholders — _"What else was in the air today?"_
- a way back to the feeling on the map.

### 4. The Logbook

Every kept feeling lives here — the private weather journal, one slide of the pill away at any time.

- **Calendar view:** the month grid is always here — an empty month is simply a quiet one, never an empty state. Logged days carry soft dots colored by the feeling's family; a month becomes a small sky of its own. Tapping a day lists that day's kept feelings, and tapping one reopens its page.
- **List view:** a gentle reverse-chronological feed, grouped by day — the emotion in color, the time, one line of the note.

## The vocabulary of keeping

One verb carries the feature: **keep**.

- _"keep this feeling"_ — save it.
- _"kept."_ — the confirmation; a saved entry is a _kept feeling_.
- _"let this one go"_ — delete. Never "delete", never "remove".

Copy stays invitational, never interrogative: _"whenever you're ready"_, _"a quiet day"_, _"anything you'd like to remember about this moment?"_ No streaks, no scores, no reminders, no judgment — and everything stays on the device.

This vocabulary is for the interface only. In code and data, things are named plainly — `emotion`, `recorded emotion`, `logbook` — so the writing can evolve freely.

## Color as weather

Each core feeling family owns one hue drawn from the atmosphere's palette; sub-emotions vary only in lightness. The map, the explorer, and the Logbook's dots all speak the same quiet color language — readable at a glance, never a rainbow.

## Action items for the dev cycle

1. **Data schema:** done (`app/assets/data/emotions.json`) — 103 words in 6 core families with sub-emotions, definitions, examples, parent links, and family hues, drawing the word list from published feelings wheels (credited in the README) with our own writing throughout. See `docs/emotion-vocabulary.md`.
2. **The canvas:** scaffold the Nuxt app and create the basic full-screen atmospheric CSS gradient background.
3. **The physics:** implement d3-force with dummy divs to dial in the repulsion and drift speeds.
4. **The interactions:** wire up anime.js and VueUse to handle the tap-to-pan camera movement.
5. **The Logbook:** kept-feeling storage, the entry page, and the calendar / list views.
6. **The copy:** write the definitions, examples, and placeholder text — this is design work, not filler.
