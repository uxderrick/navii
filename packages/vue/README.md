# @usenavii/vue

**Vue 3 binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `<Navii seed="user.id" />` and every user has a face, no uploads.

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)

## Install

```sh
pnpm add @usenavii/vue
```

Vue `>=3.5` is a peer dep. `@usenavii/core` and `@mhaadi/svg` are auto-installed.

## Usage

```vue
<script setup lang="ts">
import { Navii } from '@usenavii/vue';
</script>

<template>
  <Navii :seed="user.id" :size="64" :title="user.name" animated />
</template>
```

Renders as an inline `<svg>` via `@mhaadi/svg` so CSS animations and `<title>` accessibility work natively in the DOM.

## Props

| Prop         | Type                                                  | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `seed`       | `string` — **required**                               | —            |
| `size`       | `number` (px)                                         | `96`         |
| `as`         | `'svg' \| 'img'` — inline `<svg>` or data-URI `<img>` | `'svg'`      |
| `paletteId`  | known palette id (e.g. `'mint'`)                      | seed-derived |
| `palette`    | `Palette` object — runtime/brand palette              | none         |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `mood`       | `'neutral' \| 'happy' \| 'serious' \| 'sleepy' \| 'wink'` | `'neutral'` |
| `packs`      | `string[]` — premium pack ids                         | none         |
| `styleHint`  | `'masc' \| 'femme' \| 'neutral'`                      | none         |
| `title`      | accessible label                                      | none         |
| `animated`   | `boolean` — idle float / blink / sway / twinkle       | `false`      |
| `alt`        | accessible label (falls back to `title`)              | `''`         |
| `sanitize`   | `boolean` — run better-svg sanitizer                  | `false`      |
| `class`      | passed through to the root element                    | —            |
| `style`      | passed through to the root element                    | —            |

## `<NaviiGroup>`

```vue
<script setup lang="ts">
import { NaviiGroup } from '@usenavii/vue';
</script>

<template>
  <NaviiGroup :seeds="team.map(u => u.id)" :size="48" :overlap="0.3" :max="5" />
</template>
```

## License

MIT. See [LICENSE](https://github.com/uxderrick/navii/blob/main/LICENSE).
