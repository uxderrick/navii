# @usenavii/react-native

**React Native binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `<Navii seed={user.id} />` and every user has a face, no uploads.

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)

## Install

```sh
pnpm add @usenavii/react-native react-native-svg@^15.16.1 react-native-reanimated@~4.8.0 react-native-worklets@~0.14.0
```

Use React Native 0.87 through 0.89 with the New Architecture. Add `react-native-worklets/plugin` as the last plugin in your Babel config, then rebuild the native app. Follow the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) for your app's setup.

## Usage

```tsx
import { Navii } from '@usenavii/react-native';

<Navii seed={user.id} size={64} title={user.name} />
```

Navii renders the avatar as native SVG. The `animated` prop enables body float, blinking, and any antenna, spark, or sparkle motion for the avatar.

```tsx
<Navii seed={user.id} size={64} animated />
```

Reanimated runs the motion on the UI thread. Navii renders a static avatar when system reduced motion is enabled.

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
| `animated`   | `boolean` — opt into idle animation                   | `false`      |
| `alt`        | accessible label (maps to `accessibilityLabel`)       | none         |
| `sanitize`   | `boolean` — sanitize the generated SVG                  | `false`      |
| `style`      | `StyleProp<ViewStyle>` — applied to wrapper `View`    | —            |

## `<NaviiGroup>`

```tsx
import { NaviiGroup } from '@usenavii/react-native';

<NaviiGroup seeds={team.map(u => u.id)} size={48} overlap={0.3} max={5} />
```

Pass `animated` to animate each visible avatar using its own seed. The overflow counter stays still.

## License

MIT. See [LICENSE](https://github.com/uxderrick/navii/blob/main/LICENSE).
