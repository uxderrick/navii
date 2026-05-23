<div align="center">

# Navii

**A face for every user.**
Drop-in deterministic mascot avatars. No uploads, no blank gray circles, no state to manage.

<a href="https://navii.uxderrick.com">
  <img src="https://navii-api.uxderrick.com/cast.svg?animated=1&size=120" alt="Navii cast — 24 unique deterministic mascots" width="100%" />
</a>

```
seed in  →  same avatar out, every time.
```

[![npm](https://img.shields.io/npm/v/@usenavii/core?label=%40navii%2Fcore)](https://www.npmjs.com/package/@usenavii/core)
[![npm](https://img.shields.io/npm/v/@usenavii/react?label=%40navii%2Freact)](https://www.npmjs.com/package/@usenavii/react)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Live demo](https://img.shields.io/badge/demo-navii.uxderrick.com-c084fc)](https://navii.uxderrick.com)

[Live demo](https://navii.uxderrick.com) · [API playground](https://navii.uxderrick.com#playground) · [Gallery](https://navii-api.uxderrick.com/gallery) · [Docs](https://navii.uxderrick.com/docs)

</div>

---

## Why Navii

- **Deterministic.** `createAvatar(seed)` is pure. Same seed → byte-identical SVG, forever.
- **Stateless.** No accounts, no databases, no CDN warm-up. Render anywhere — server, browser, edge.
- **Drop-in.** One function call, or a `<img src="...">` URL. Install to first avatar in under a minute.
- **Expressive.** 3.3M discrete combinations × continuous params (hue, scale, eye gap, mouth curve, antenna tilt) = effectively unbounded.
- **Animated, optionally.** Idle float, blink, antenna sway, spark pulse, sparkle twinkle — all honoring `prefers-reduced-motion`.

---

## Packages

| Package        | What it is                                                  |
| -------------- | ----------------------------------------------------------- |
| `@usenavii/core`  | Framework-agnostic engine. Seed → SVG string. Pure TS.      |
| `@usenavii/react` | Thin React component. `<Navii seed="alice" />`.             |
| `@usenavii/api`   | Hono app exposing `GET /avatar/:seed`. Deploy anywhere.     |

> **Status:** v0.1 — public API stable. Deterministic contract locked. Cast may grow (new variants appended to PRNG stream, never inserted).

---

## Install

```sh
# pick one
npm  add @usenavii/core
pnpm add @usenavii/core
yarn add @usenavii/core
bun  add @usenavii/core

# for React
npm add @usenavii/react
```

## Quick start

### Node / browser (vanilla TS)

```ts
import { createAvatar } from '@usenavii/core';

const svg = createAvatar(user.id, { size: 96 });
document.body.insertAdjacentHTML('beforeend', svg);
```

### React

```tsx
import { Navii } from '@usenavii/react';

<Navii seed={user.id} size={64} title={user.name} animated />
```

### `<img src>` via hosted endpoint

```html
<img src="https://navii-api.uxderrick.com/avatar/alice@example.com?size=96" />
```

For PNG output (e.g. emails, OG images), append `.png`:

```html
<img src="https://navii-api.uxderrick.com/avatar/alice@example.com.png?size=256" />
```

Don't have a seed yet? `/random` returns a fresh avatar each request — same URL, different avatar every refresh. Read the chosen seed from the `X-Navii-Seed` header if you want to persist it:

```html
<img src="https://navii-api.uxderrick.com/random?size=96" />
```

---

## The seed: read this once

The **seed determines the avatar**. Same seed always produces the same avatar — that's the whole contract.

**Rule of thumb:** pass a *stable unique identifier* per user.

| Seed input                | Recommendation                                          |
| ------------------------- | ------------------------------------------------------- |
| `user.id` / UUID          | ✅ Best. Stable and globally unique.                    |
| `user.email`              | ✅ Good. Stable, unique per user.                       |
| `user.name` alone         | ⚠️ Names collide. Two "Alice"s get the same avatar.    |
| `${name}-${createdAt}`    | ✅ Fine fallback if no ID exists. Bake at signup.       |
| `Date.now()` at render    | ❌ **Don't.** Breaks determinism — changes every reload.|

If your app *only* has a display name, compose a stable seed at signup time (e.g. `${name}-${createdAt}`) and store it. Never derive the seed from the current time at render — the avatar must be reproducible.

---

## API reference

### `@usenavii/core`

```ts
createAvatar(seed: string, options?: AvatarOptions): string
random(options?: AvatarOptions): { svg: string; seed: string }
selectAvatar(seed: string, options?: AvatarOptions): AvatarSpec
renderAvatar(spec:  AvatarSpec, options?: AvatarOptions): string
renderGroup(seeds:  string[],   options?: GroupOptions):  string

// ergonomic helpers
seed(fields:  SeedFields): string          // pick most-unique field
build(spec?:  BuildSpec, opts?): string    // manual mix-and-match (no seed)

// namespace bundle
Navii.{ create, random, render, select, group, seed, build }
```

#### `Navii.seed({ id, email, name, createdAt })`

Picks the most-unique stable field automatically. Prefers `id` → `email` → `name+createdAt` → `name`. Stops devs accidentally passing display names.

```ts
import { Navii } from '@usenavii/core';

const s = Navii.seed({ id: user.id, email: user.email, name: user.name });
const svg = Navii.create(s);
```

#### `Navii.random({ ...options })`

Picks a fresh seed for you and renders the avatar. Returns `{ svg, seed }` so you can persist the seed (typical: save to user profile so the avatar is stable on next visit).

```ts
const { svg, seed } = Navii.random({ size: 96 });
await db.users.update(user.id, { naviiSeed: seed });
```

In React, stabilize across re-renders with `useState`:

```tsx
const [{ seed }] = useState(() => Navii.random());
return <Navii seed={seed} />;
```

#### `Navii.build({ body, eyes, mouth, ... })`

Direct construction from explicit part choices — no seed. For brand mascots, logo marks, designer-curated avatars.

```ts
const svg = Navii.build({
  body: 'tall', eyes: 'star', mouth: 'grin',
  palette: 'violet', topper: 'crown',
}, { size: 192, animated: true });
```

Any field left unspecified falls back to its first variant.

#### `AvatarOptions`

| Option       | Type                                                  | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `size`       | `number` (px)                                         | `96`         |
| `paletteId`  | known palette id (e.g. `'mint'`)                      | seed-derived |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `title`      | accessible label (sets `<title>` + `aria-label`)      | none         |
| `animated`   | `boolean` — emits idle animation `<style>` block      | `false`      |

#### `GroupOptions` (extends `AvatarOptions`)

| Option         | Type     | Default    | Notes                                            |
| -------------- | -------- | ---------- | ------------------------------------------------ |
| `size`         | `number` | `64`       | Per-tile size in px.                             |
| `overlap`      | `number` | `0.3`      | Fraction of tile that overlaps previous (0–0.7). |
| `max`          | `number` | all        | Cap tiles; remainder collapse into a `+N` chip.  |
| `ring`         | `string` | `#ffffff`  | Border ring around each tile.                    |
| `tileBg`       | `string` | `#ffffff`  | Solid fill behind avatar inside the clip.        |
| `counterFill`  | `string` | `#E5E7EB`  | Background of the `+N` tile.                     |
| `counterInk`   | `string` | `#374151`  | Text color of the `+N` tile.                     |

### `@usenavii/react`

```tsx
<Navii
  seed={user.id}        // required
  size={64}             // px, default 96
  paletteId="mint"      // optional override
  background="ring"     // 'none' | 'solid' | 'ring' | { color }
  title={user.name}     // accessible label
  animated              // idle animation
  className="rounded-full"
  alt="Alice's avatar"  // falls back to `title`
/>
```

Renders as a memoized `<img src="data:image/svg+xml;...">` so the SVG is treated as opaque by the browser (no inline scripting surface).

### `@usenavii/api` — hosted endpoint

| Method | Path                  | Purpose                                |
| ------ | --------------------- | -------------------------------------- |
| `GET`  | `/`                   | Landing page + interactive playground. |
| `GET`  | `/api`                | JSON index of endpoints + version.     |
| `GET`  | `/avatar/:seed`       | Single avatar as SVG.                  |
| `GET`  | `/avatar/:seed.png`   | Same avatar rastered to PNG.           |
| `GET`  | `/random`             | Fresh avatar each request, same URL. `no-store`. Chosen seed surfaced via `X-Navii-Seed` header. |
| `GET`  | `/random.png`         | Same as `/random` but PNG.             |
| `GET`  | `/group?seeds=a,b,c`  | Overlapping group as SVG.              |
| `GET`  | `/gallery`            | HTML grid of seeded avatars (debug).   |
| `GET`  | `/healthz`            | Liveness probe.                        |

**Query params** (apply to `/avatar/:seed[.png]`):

| Param        | Type     | Default | Notes                                          |
| ------------ | -------- | ------- | ---------------------------------------------- |
| `size`       | `int`    | `96`    | Clamped to 16–1024.                            |
| `palette`    | `string` | seeded  | Palette id, e.g. `mint`, `indigo`.             |
| `background` | `enum`   | seeded  | `none` \| `solid` \| `ring`.                   |
| `title`      | `string` | none    | Accessible label.                              |
| `animated`   | `1` / `0`| `0`     | Idle animation (SVG only — ignored for PNG).   |
| `tileBg`     | `string` | none    | Solid color behind avatar.                     |

Responses set `Cache-Control: public, max-age=31536000, immutable` — safe for CDN fronting.

---

## Parts catalog

| Part         | Variants                                            | Count |
| ------------ | --------------------------------------------------- | ----- |
| `palette`    | indigo, mint, amber, sky, violet, cyan, rose, lime, peach, teal, sand, plum, coral, forest, slate, fuchsia, terracotta, navy, lavender, charcoal, butter, aqua | 22 |
| `body`       | orb, tall, squat, pear, pebble, dumpling, taro, wisp | 8    |
| `eyes`       | round, wide, squint, wink, sleepy, star, heart, oval, dot, cross | 10 |
| `mouth`      | smile, grin, open, flat, smirk, awe, tongue, tooth, wave, dot | 10 |
| `antenna`    | none, classic, curl, double, spike                  | 5     |
| `accessory`  | none, blush, freckles, sparkle, glasses, eyepatch, mole | 7 |
| `background` | none, solid, ring                                   | 3     |
| `topper`     | none, ears, roundEars, horn, horns, tuft, cap, leaf, headband, halo, crown, antlers | 12 |

Discrete combinatorial space: 22 × 8 × 10 × 10 × 5 × 7 × 3 × 12 = **22,176,000** distinct avatars.

**Continuous params** ride on top of every seed:

- Hue rotation: ±30°
- Body scale: 0.92×–1.08×
- Eye gap shift: ±2 (viewBox units)
- Mouth curvature: 0.85×–1.15×
- Antenna tilt: ±8°

Discrete × continuous = effectively unbounded output, still fully deterministic.

---

## Determinism guarantee

`createAvatar(seed)` is a pure function. Same seed → same byte-identical SVG.

- PRNG: `sfc32` seeded from a `cyrb53` hash of the seed string.
- Part picks happen in a **fixed order**. New parts are appended to the end of the stream, so adding variants in future releases never shifts existing seeds' selections.
- No environment lookups, no `Date.now()`, no `Math.random()`, no module-level state.

This means: a backend can render the same avatar in Node that the browser renders in React, and a Cloudflare Worker rasters to PNG — all from the same seed, all byte-identical.

---

## Roadmap

Live backlog: [`BACKLOG.md`](./BACKLOG.md). Highlights:

- More part variants (more eyes, mouths, antennae)
- Compound accessories + outfit slot
- Cloudflare Worker deploy (resvg-wasm)
- `Navii.seed({ id, email, name, createdAt })` ergonomic helper
- React Native binding, CLI
- Avatar builder UI (manual mix-and-match without seed)

---

## Develop

```bash
pnpm install
pnpm test           # runs vitest across all packages
pnpm build          # builds @usenavii/core, @usenavii/react, @usenavii/api
pnpm dev:api        # hot-reload hosted endpoint on :8787
```

---

## License

MIT.
