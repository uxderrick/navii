# @usenavii/react-native

**React Native binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `<Navii seed={user.id} />` and every user has a face, no uploads.

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)

## Install

```sh
pnpm add @usenavii/react-native react-native-svg
```

`react-native` and `react-native-svg` are peer deps. `@usenavii/core` and `@mhaadi/svg` are auto-installed.

## Usage

```tsx
import { Navii } from '@usenavii/react-native';

<Navii seed={user.id} size={64} title={user.name} />
```

Renders as a `react-native-svg` tree via `@mhaadi/svg/react-native`. The SVG is parsed into native components (`Svg`, `Path`, `Circle`, `Rect`, `G`, gradients, `ClipPath`, etc.).

> **Animation:** the `animated` prop is accepted but not yet supported on React Native — the first frame is rendered statically. CSS keyframe animations (`<style>` blocks) don't translate to `react-native-svg`. A future version will use `react-native-reanimated` for per-element animations.

## Props

| Prop         | Type                                                  | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `seed`       | `string` — **required**                               | —            |
| `size`       | `number` (px)                                         | `96`         |
| `paletteId`  | known palette id (e.g. `'mint'`)                      | seed-derived |
| `palette`    | `Palette` object — runtime/brand palette              | none         |
| `background` | `'none' \| 'solid' \| 'ring'` or `{ color }`          | seed-derived |
| `mood`       | `'neutral' \| 'happy' \| 'serious' \| 'sleepy' \| 'wink'` | `'neutral'` |
| `packs`      | `string[]` — premium pack ids                         | none         |
| `styleHint`  | `'masc' \| 'femme' \| 'neutral'`                      | none         |
| `title`      | accessible label (maps to `accessibilityLabel`)       | none         |
| `animated`   | `boolean` — accepted, rendered statically on RN       | `false`      |
| `alt`        | accessible label (maps to `accessibilityLabel`)       | none         |
| `sanitize`   | `boolean` — run better-svg sanitizer                  | `false`      |
| `style`      | `StyleProp<ViewStyle>` — applied to wrapper `View`    | —            |

## `<NaviiGroup>`

```tsx
import { NaviiGroup } from '@usenavii/react-native';

<NaviiGroup seeds={team.map(u => u.id)} size={48} overlap={0.3} max={5} />
```

Each tile renders as an independent `react-native-svg` tree inside a positioned `View`.

## License

MIT. See [LICENSE](https://github.com/uxderrick/navii/blob/main/LICENSE).
