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

React `>=17` is a peer dep. `@usenavii/core` is auto-installed.

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

Renders as a memoized `<img src="data:image/svg+xml;...">` so the SVG is treated as opaque by the browser — no inline scripting surface.

## Props

| Prop         | Type                                                  | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `seed`       | `string` — **required**                               | —            |
| `size`       | `number` (px)                                         | `96`         |
| `paletteId`  | known palette id (e.g. `'mint'`)                      | seed-derived |
| `palette`    | `Palette` object — runtime/brand palette, wins over `paletteId` | none |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `mood`       | `'neutral' \| 'happy' \| 'serious' \| 'sleepy' \| 'wink'` — overrides seed-derived eyes + mouth. Same seed + mood = byte-identical. | `'neutral'` |
| `tileBg`     | CSS color or `'auto'` (palette accent)                | none         |
| `title`      | accessible label                                      | none         |
| `animated`   | `boolean` — idle float / blink / sway / twinkle       | `false`      |
| `alt`        | image alt text (falls back to `title`)                | `''`         |
| `className`  | passed through to `<img>`                             | —            |
| `style`      | passed through to `<img>`                             | —            |

### Mood overlay

Same seed, four expressions — body / palette / topper stay identical:

```tsx
<Navii seed="alice" mood="happy"   size={96} />
<Navii seed="alice" mood="serious" size={96} />
<Navii seed="alice" mood="sleepy"  size={96} />
<Navii seed="alice" mood="wink"    size={96} />
```

## The seed: read this once

Same seed always produces the same avatar — that's the contract.

| Pass                       | Result                                                  |
| -------------------------- | ------------------------------------------------------- |
| `user.id` / UUID           | ✅ Best. Stable and globally unique.                    |
| `user.email`               | ✅ Good. Stable, unique per user.                       |
| `user.name` alone          | ⚠️ Names collide. Two "Alice"s get the same avatar.    |
| `${name}-${createdAt}`     | ✅ Fine fallback if no ID exists. Bake at signup.       |
| `Date.now()` at render     | ❌ **Don't.** Breaks determinism — changes on reload.   |

Need a helper that picks the right field automatically?

```ts
import { seed } from '@usenavii/core';

const s = seed({ id: user.id, email: user.email, name: user.name });
<Navii seed={s} />
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

Same seed + same options → byte-identical SVG. Memoized on `seed + size + paletteId + palette + background + mood + title + animated + styleHint`. Re-renders with same props don't re-run the engine.

## License

MIT. See [LICENSE](https://github.com/uxderrick/navii/blob/main/LICENSE).
