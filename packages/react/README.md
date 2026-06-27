# @usenavii/react

**React binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `<Navii seed={user.id} />` and every user has a face, no uploads.

<p align="center">
  <img src="https://api.navii.dev/group?seeds=aria,milo,nova,kai,sage,eden,luna,rio,pip,wren,zane,iris&size=72&overlap=0.32&ring=%230a0a0b&tileBg=%23ffffff" alt="Navii cast" />
</p>

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)

## Install

```sh
npm  add @usenavii/react
pnpm add @usenavii/react
yarn add @usenavii/react
bun  add @usenavii/react
```

React `>=17` is a peer dep. `@usenavii/core` and `@mhaadi/svg` are auto-installed.

## Usage

```tsx
import { Navii } from '@usenavii/react';

<Navii
  seed={user.id}
  size={64}
  title={user.name}
  animated
/>
```

Renders as an inline `<svg>` via [`@mhaadi/svg`](https://svg.mhaadi.dev) so CSS animations and `<title>` accessibility work natively in the DOM. Pass `as="img"` for the data-URI `<img>` shape (CDN prefetch, download attributes, etc.).

## Props

| Prop         | Type                                                  | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `seed`       | `string` — **required**                               | —            |
| `size`       | `number` (px)                                         | `96`         |
| `as`         | `'svg' \| 'img'` — inline `<svg>` or data-URI `<img>` | `'svg'`      |
| `paletteId`  | known palette id (e.g. `'mint'`)                      | seed-derived |
| `palette`    | `Palette` object — runtime/brand palette, wins over `paletteId` | none |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `mood`       | `'neutral' \| 'happy' \| 'serious' \| 'sleepy' \| 'wink'` — overrides seed-derived eyes + mouth. Same seed + mood = byte-identical. | `'neutral'` |
| `packs`      | `string[]` — premium pack ids, e.g. `['accra-gallery']` | none |
| `styleHint`  | `'masc' \| 'femme' \| 'neutral'` — biases pack picks when supported | none |
| `tileBg`     | CSS color or `'auto'` (palette accent)                | none         |
| `title`      | accessible label                                      | none         |
| `animated`   | `boolean` — idle float / blink / sway / twinkle       | `false`      |
| `alt`        | accessible label (falls back to `title`)              | `''`         |
| `sanitize`   | `boolean` — run better-svg sanitizer on engine output | `false`      |
| `loading`    | `ReactNode` — rendered while SVG is parsing           | none         |
| `fallback`   | `ReactNode` — rendered when parsing fails             | none         |
| `className`  | passed through to the root element                    | —            |
| `style`      | passed through to the root element                    | —            |

### Mood overlay

Same seed, four expressions — body / palette / topper stay identical:

```tsx
<Navii seed="alice" mood="happy"   size={96} />
<Navii seed="alice" mood="serious" size={96} />
<Navii seed="alice" mood="sleepy"  size={96} />
<Navii seed="alice" mood="wink"    size={96} />
```

## `<NaviiGroup>` — overlapping stack

For team rows, contributor lists, etc. Wraps core's `renderGroup()`.

```tsx
import { NaviiGroup } from '@usenavii/react';

<NaviiGroup
  seeds={team.map((u) => u.id)}
  size={48}
  overlap={0.3}        // 0 = no overlap, 0.7 = heavy stack
  max={5}              // overflow collapses into a "+N" counter tile
  ring="#0a0a0b"       // border around each tile
/>
```

### `NaviiGroupProps`

| Prop          | Type                                                  | Default      |
| ------------- | ----------------------------------------------------- | ------------ |
| `seeds`       | `string[]` — **required**                             | —            |
| `size`        | `number` per-tile px                                  | `64`         |
| `as`          | `'svg' \| 'img'` — per-tile inline or composite `<img>` | `'svg'`    |
| `overlap`     | `number` 0–0.7                                        | `0.3`        |
| `max`         | `number` cap before showing `+N` counter              | all          |
| `ring`        | `string` border color                                 | `#ffffff`    |
| `tileBg`      | CSS color or `'transparent'` (fill behind each tile)  | `#ffffff`    |
| `counterFill` | `string` background of `+N` tile                      | `#E5E7EB`    |
| `counterInk`  | `string` text color of `+N` tile                      | `#374151`    |
| `paletteId`   | known palette id — applies to every tile              | seed-derived |
| `palette`     | `Palette` object override — applies to every tile     | none         |
| `mood`        | mood overlay — applies to every tile                  | `'neutral'`  |
| `packs`       | `string[]` — premium pack ids, e.g. `['command-center']` | none |
| `background`  | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `animated`    | `boolean` — idle motion per tile                      | `false`      |
| `styleHint`   | `'masc' \| 'femme' \| 'neutral'`                      | none         |
| `alt`         | accessible label (defaults to "Group of N avatars")   | derived      |
| `sanitize`    | `boolean` — run better-svg sanitizer per tile         | `false`      |
| `loading`     | `ReactNode` — forwarded to each tile                  | none         |
| `fallback`    | `ReactNode` — forwarded to each tile                  | none         |
| `className`   | passed through to the wrapper element                 | —            |
| `style`       | passed through to the wrapper element                 | —            |

When `as="svg"` (default), each tile renders as an independent inline `<svg>` positioned absolutely inside a wrapper `<div>`. When `as="img"`, the composite SVG is rendered as a data-URI `<img>` with correct intrinsic dimensions.

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

Need a helper that picks the right field automatically?

```tsx
import { seed, seedFromEmail } from '@usenavii/react';

// Hashes the email branch by default (sha256 of normalized email).
const s = seed({ id: user.id, email: user.email, name: user.name });
<Navii seed={s} />

// Or hash an email explicitly:
<Navii seed={seedFromEmail(user.email)} />
```

## Example use cases

### Profile card

```tsx
function UserCard({ user }) {
  return (
    <div className="user-card">
      <Navii seed={user.id} size={64} title={user.name} />
      <div>
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
    </div>
  );
}
```

### Team list

```tsx
{team.map(u => (
  <Navii key={u.id} seed={u.id} size={48} title={u.name} />
))}
```

### Photo fallback

```tsx
<img
  src={user.photoUrl}
  onError={(e) => { e.currentTarget.src = `https://api.navii.dev/avatar/${encodeURIComponent(user.id)}`; }}
/>
```

Or render `<Navii>` directly when `photoUrl` is null — no fetch needed, deterministic.

## Determinism guarantee

Same seed + same options → byte-identical SVG. Memoized on `seed + size + paletteId + palette + background + mood + title + animated + styleHint + packs`. Re-renders with same props don't re-run the engine. `@mhaadi/svg` also caches parsed SVG markup by source string, so identical avatars across the tree deduplicate automatically.

## License

MIT. See [LICENSE](https://github.com/uxderrick/navii/blob/main/LICENSE).
