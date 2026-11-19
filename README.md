# inner-weather

A digital space to explore emotions that feels alive, organic, and deeply intuitive — an atmospheric, client-side PWA for navigating an ever-expanding vocabulary of feelings without the clinical "menu game" of traditional feelings wheels.

See [`docs/product-vision.md`](./docs/product-vision.md) for the full vision, [`docs/technical-notes.md`](./docs/technical-notes.md) for stack and architecture details, and [`docs/roadmap.md`](./docs/roadmap.md) for the task list.

For contributor and agent guidance, see [`AGENTS.md`](./AGENTS.md).

## Credits

The feeling vocabulary takes its word lists and groupings from published
feelings wheels: Gloria Willcox, *The Feeling Wheel* (1982); Robert Plutchik,
*Emotion: A Psychoevolutionary Synthesis* (1980); Brent Williams, *Emotion
Sensation Feeling Wheel* (2019); and Marshall Rosenberg's Nonviolent
Communication feelings inventory. No wheel image or layout is reproduced — all
definitions, examples, hues, and parent links are written for this project. See
[`docs/emotion-vocabulary.md`](./docs/emotion-vocabulary.md) for the mapping.

## Quick start

```bash
bun install
bun run dev
```

Dev server runs at `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Nuxt dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
| `bun run lint` | ESLint fix + Prettier format |
| `bun run typecheck` | `vue-tsc` type check |