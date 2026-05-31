# @usenavii/core

**Deterministic mascot avatars from a seed.** Pure TypeScript engine. Same seed in → byte-identical SVG out, every time. No state, no uploads, no network.

<p align="center">
  <img src="https://api.navii.dev/group?seeds=aria,milo,nova,kai,sage,eden,luna,rio,pip,wren,zane,iris&size=72&overlap=0.32&ring=%230a0a0b&tileBg=%23ffffff" alt="Navii cast" />
</p>

- [Live demo](https://navii.dev) — interactive playground + cast
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)

## Install

```sh
npm  add @usenavii/core
pnpm add @usenavii/core
yarn add @usenavii/core
bun  add @usenavii/core
```

## Quick start

```ts
import { createAvatar } from '@usenavii/core';

const svg = createAvatar(user.id, { size: 96 });
document.body.insertAdjacentHTML('beforeend', svg);
```

Or use the namespace bundle:

```ts
import { Navii } from '@usenavii/core';

Navii.create(user.id);
Navii.seed({ id: user.id, email: user.email, name: user.name });
Navii.build({ body: 'tall', eyes: 'star', palette: 'violet' });
Navii.group([user1.id, user2.id, user3.id]);
```

## The seed: read this once

Same seed always produces the same avatar — that's the contract.

| Pass                       | Result                                                      |
| -------------------------- | ----------------------------------------------------------- |
| `user.id` / UUID           | ✅ Best. Stable and globally unique.                        |
| `seedFromEmail(email)`     | ✅ Good. Hashed email — stable, unique, no PII on the wire. |
| `user.email` (raw)         | ⚠️ Leaks email into URLs, logs, Referer headers. Hash it.   |
| `user.name` alone          | ⚠️ Names collide. Two "Alice"s get the same avatar.         |
| `${name}-${createdAt}`     | ✅ Fine fallback if no ID exists. Bake at signup.           |
| `Date.now()` at render     | ❌ **Don't.** Breaks determinism — changes on reload.       |

If your shape is uncertain, use the helper:

```ts
const s = Navii.seed({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt });
const svg = Navii.create(s);
```

It picks the most unique field automatically: `id` → `email` → `name + createdAt` → `name`. When the email branch is used it hashes via `seedFromEmail()` by default — pass `{ hashEmail: false }` only to preserve existing raw-email seeds during a migration.

### Using emails as seeds

Raw emails in URLs leak through server logs, Referer headers, browser history, and CDN cache keys. Hash the email — `sha256` of the trimmed + lowercased address:

```ts
import { seedFromEmail, createAvatar } from '@usenavii/core';

const s = seedFromEmail(user.email);  // sha256 hex, 64 chars
createAvatar(s);
```

Two services that both hash with `seedFromEmail()` get the same seed for the same person, so avatars stay consistent across products.

## API

```ts
createAvatar(seed: string, options?: AvatarOptions): string
random(options?: AvatarOptions): { svg: string; seed: string }
selectAvatar(seed: string, options?: AvatarOptions): AvatarSpec
renderAvatar(spec:  AvatarSpec, options?: AvatarOptions): string
renderGroup(seeds:  string[],   options?: GroupOptions):  string

seed(fields:  SeedFields): string         // pick most-unique field
build(spec?:  BuildSpec, opts?): string   // manual mix-and-match (no seed)

Navii.{ create, random, render, select, group, seed, build }
```

### `AvatarOptions`

| Option       | Type                                                  | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `size`       | `number` (px)                                         | `96`         |
| `paletteId`  | known palette id (e.g. `'mint'`)                      | seed-derived |
| `palette`    | `Palette` object — runtime/brand palette, no registration in `PALETTES` needed. Wins over `paletteId`. | none |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `mood`       | `'neutral' \| 'happy' \| 'serious' \| 'sleepy' \| 'wink'` — overrides seed-derived eyes + mouth with a curated pair. Same seed + same mood = byte-identical. Bypasses pack eye/mouth constraints by design. | `'neutral'` |
| `tileBg`     | CSS color or `'auto'` (palette accent)                | none         |
| `title`      | accessible label (sets `<title>` + `aria-label`)      | none         |
| `animated`   | `boolean` — idle float / blink / sway / pulse / twinkle | `false`    |

#### Mood overlay

Same seed, four expressions — body / palette / topper stay identical:

```ts
import { createAvatar } from '@usenavii/core';

createAvatar('alice');                          // neutral (seed-derived)
createAvatar('alice', { mood: 'happy' });       // wide eyes + smile
createAvatar('alice', { mood: 'serious' });     // squint + flat mouth
createAvatar('alice', { mood: 'sleepy' });      // sleepy + dot
createAvatar('alice', { mood: 'wink' });        // wink + smirk
```

#### Runtime palette injection (`build()` only)

Pass a `Palette` object (e.g. pulled from Figma variables or design tokens) without registering it in the global `PALETTES` lookup:

```ts
import { build } from '@usenavii/core';

const acmePalette = {
  id: 'acme', name: 'Acme Brand',
  bodyFrom: '#FF5722', bodyTo: '#FFA726',
  feature: '#1A1A1A', background: '#FFF8F0',
};

build({ body: 'tall', eyes: 'wide' }, { palette: acmePalette, size: 128 });
```

### `random()` — pick a seed for you

For "spin again" UX, onboarding before the user picks an avatar, dev/demo seeding. Returns the chosen seed so you can persist it:

```ts
const { svg, seed } = Navii.random({ size: 96 });
await db.users.update(user.id, { naviiSeed: seed });
```

Calling `random()` in a React render gives a new avatar every re-render. Stabilize with `useState`:

```tsx
const [{ seed }] = useState(() => Navii.random());
return <Navii seed={seed} />;
```

### `build()` — direct construction without a seed

Use for brand mascots, logo marks, designer-curated avatars:

```ts
const svg = Navii.build({
  body: 'tall', eyes: 'star', mouth: 'grin',
  palette: 'violet', topper: 'crown',
}, { size: 192, animated: true });
```

Any field omitted falls back to the first variant.

## Determinism guarantee

`createAvatar(seed)` is a pure function. Same seed + same options → byte-identical SVG.

- PRNG: `sfc32` seeded from a `cyrb53` hash of the seed string.
- Part picks happen in a fixed order. New parts are appended to the end of the stream, so adding variants in future releases never shifts existing seeds.
- No `Date.now()`, no `Math.random()`, no module-level state, no environment lookups.

Render the same avatar in Node, in the browser, on the edge — all byte-identical.

## Cast (output space)

22 palettes × 8 bodies × 10 eyes × 10 mouths × 5 antennae × 7 accessories × 3 backgrounds × 12 toppers = **22,176,000** discrete combinations. Plus continuous tweaks (hue rotation ±30°, body scale ±8%, eye gap ±2, mouth curvature ±15%, antenna tilt ±8°) → effectively unbounded.

## License

MIT. See [LICENSE](https://github.com/uxderrick/navii/blob/main/LICENSE).
