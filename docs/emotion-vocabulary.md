# The vocabulary

`app/assets/data/emotions.json` is the map's word list — 103 words in three rings:
6 core feelings, 30 clusters, 67 precise words. This file records where the words
and groupings come from, so the list stays auditable and the copy stays ours.

## Structure

```
joy ─┬─ content ─┬─ satisfied
     │           └─ fulfilled
     ├─ delight ─┬─ amused
     ...
```

- **Ring 1 — core (6).** The words the map opens on. No `parentId`.
- **Ring 2 — clusters.** The broad shades under a core feeling. Selecting a
  core word reveals these.
- **Ring 3 — precise words.** The fine-tuning ring. Selecting a cluster reveals
  these.

`parentId` holds the chain, so the map's path is core → cluster → precise word.
Every word carries its own definition and three examples; siblings are written
to be *distinguishable*, so moving outward actually sharpens the definition
rather than repeating it in a smaller font.

Depth is capped at three rings — `getVisibleEmotions()` only knows how to show
one ring ahead of a selection. Adding a fourth ring needs both a new helper and
a new map behaviour, not just data.

## Sources

Groupings and word *lists* are drawn from published feelings wheels. Every
definition, example, hue, and parent link in `emotions.json` is written fresh
for this project.

| Source | What we took | What we didn't |
| --- | --- | --- |
| **Willcox, G. (1982).** *The Feeling Wheel.* Transactional Analysis Journal, 12(4), 274–276. | The 3-ring shape and six cores: mad, sad, scared, joyful, powerful, peaceful. | The wheel's own 72 words verbatim, its colours, and its blank outer spaces. |
| **Plutchik, R. (1980).** *Emotion: A Psychoevolutionary Synthesis.* | The intensity-grammar idea (mild → strong → extreme) that drives the third ring, and the opposite-pairs logic. | The 8-primary model itself; eight families is too many for the logbook's colour budget. |
| **Williams, B. (2019).** *Emotion Sensation Feeling Wheel* (feelingswheel.com). | The practical 3-ring vocabulary — e.g. fear → insecure → inadequate, anger → resentful → bitter. | The body-sensation ring; it would need a third axis in the schema. |
| **Rosenberg, M. B.** *Nonviolent Communication* — feelings inventory. | A sanity check for granular everyday words (relieved, exasperated, grateful, vulnerable). | The needs-met / needs-unmet split; this map is not a needs tool. |

Credit in `README.md` covers these. Wheel *images* are copyrighted (the widely
shared MentalHealth.AE recreation is CC BY-NC-ND, no derivatives), so no wheel
image, colour scheme, or layout is reproduced — only words, which are not
individually copyrightable, plus groupings expressed in our own data.

## Deliberate deviations

- **Six families.** Willcox's *powerful* is its own family (proud, capable, brave,
  respected, free). It was briefly folded into `joy` to keep the Logbook at five
  hues; six was chosen deliberately instead. The cost is real: the Logbook
  calendar now has six dot colours, so any seventh family reopens that decision
  (`docs/technical-notes.md` — colour rule).
- **No `surprise`, `disgust`, or `trust` families.** They are weak fits for the
  calm, non-clinical voice, and Plutchik's eight-family model fights the colour
  budget. Words like `uncertain` and `suspicious` sit under `fear` instead.
- **`calm` replaces Willcox's `peaceful`** as the core word — plainer, and it
  matches the app's tone. `peaceful` remains as a cluster under it.
- **Three rings, no fourth.** Ring 3 is where words stop being feelings and start
  being situations, so a fourth ring would mostly add examples, not vocabulary —
  and each extra ring is one more tap before *keep*. When a precise word feels
  blunt, add a sibling beside it (ears, not depth). The map can already walk an
  arbitrary-depth tree (`getVisibleEmotions` follows parents, not levels), so
  going deeper later is a data change plus a layout test, not a rewrite.
- **Word ids are stable.** Every id in the original 29-word sample is
  preserved, because `RecordedEmotion.emotionId` in IndexedDB points at them.
  Adding or re-parenting is safe; renaming an id orphans kept feelings.

## Adding a word

1. Pick the ring it belongs in — a cluster if it is a broad shade, ring 3 if it
   is a precise one.
2. Write the definition so it differs from its siblings by *what it's about*,
   not just intensity. If it can't be distinguished, it belongs as an example.
3. Give it three concrete, lowercase situations that a person would recognise.
4. Take a hue from its family's lightness range — never a new hue.
5. Keep `family` equal to the core word at the top of its chain; the id must be
   new (never reuse a retired id).
