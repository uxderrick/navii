# Navii

Deterministic mascot avatars from a seed. No uploads, no blank gray circles.

```
seed in  →  same avatar out, every time.
```

Pass a user id, email, or name — get back a clean, character-style SVG that's stable across sessions, devices, and platforms.

## Status

Pre-release scaffold. v0.0.x — API may move.

## Packages

| Package        | What it is                                                  |
| -------------- | ----------------------------------------------------------- |
| `@navii/core`  | Framework-agnostic engine. Seed → SVG string. Pure TS.      |
| `@navii/react` | Thin React component. `<Navii seed="alice" />`.             |
| `@navii/api`   | Hono app exposing `GET /avatar/:seed`. Deploy anywhere.     |

## Quick start

### Node / browser (vanilla)

```ts
import { createAvatar } from '@navii/core';

const svg = createAvatar('alice@example.com', { size: 96 });
document.body.insertAdjacentHTML('beforeend', svg);
```

### React

```tsx
import { Navii } from '@navii/react';

<Navii seed={user.id} size={64} title={user.name} />
```

### `<img src>` via hosted endpoint

```html
<img src="https://navii.example.com/avatar/alice@example.com?size=96" />
```

## API — `@navii/core`

```ts
createAvatar(seed: string, options?: AvatarOptions): string
selectAvatar(seed: string, options?: AvatarOptions): AvatarSpec
renderAvatar(spec: AvatarSpec, options?: AvatarOptions): string
```

### `AvatarOptions`

| Option       | Type                                          | Default      |
| ------------ | --------------------------------------------- | ------------ |
| `size`       | `number` (px)                                 | `96`         |
| `paletteId`  | known palette id (e.g. `'mint'`)              | seed-derived |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`  | seed-derived |
| `title`      | accessible label                              | none         |
| `animated`   | `boolean` — idle float, blink, antenna sway, spark pulse, twinkle. Honors `prefers-reduced-motion`. | `false`      |

## Parts taxonomy

| Part         | Variants                                            |
| ------------ | --------------------------------------------------- |
| `palette`    | 22 (indigo, mint, amber, sky, violet, cyan, rose, lime, peach, teal, sand, plum, coral, forest, slate, fuchsia, terracotta, navy, lavender, charcoal, butter, aqua) |
| `body`       | orb, tall, squat, pear, pebble                      |
| `eyes`       | round, wide, squint, wink, sleepy, star             |
| `mouth`      | smile, grin, open, flat, smirk, awe                 |
| `antenna`    | none, classic, curl, double, spike                  |
| `accessory`  | none, blush, freckles, sparkle, glasses, eyepatch, mole |
| `background` | none, solid, ring                                   |
| `topper`     | none, ears, roundEars, horn, horns, tuft, cap, leaf |

Discrete combinatorial space: 22 × 5 × 6 × 6 × 5 × 7 × 3 × 8 = **3,326,400** distinct avatars.

On top, each seed also drives **continuous params** — hue rotation (±30°), body scale (0.92–1.08), eye gap shift (±2), mouth curvature (0.85×–1.15×), and antenna tilt (±8°) — so the effective output space is unbounded while staying fully deterministic.

## Determinism guarantee

`createAvatar(seed)` is a pure function. Same seed → same byte-identical SVG.
The PRNG is `sfc32` seeded from a `cyrb53` hash. Part picks happen in a fixed
order so future part additions go to the end of the stream without shifting
existing seeds.

## Develop

```bash
pnpm install
pnpm test
pnpm build
pnpm dev:api   # hot-reload hosted endpoint on :8787
```
