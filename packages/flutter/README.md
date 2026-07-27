# usenavii

**Flutter binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `Navii(seed: user.id)` and every user has a face, no uploads.

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)
- [Implementation plan](../../AGENTS.md) (Phases 2+ — engine port in progress)

> **Status:** Phase 1 scaffold. `createAvatar` and related APIs throw
> `UnimplementedError` until the Dart core port lands (see root `AGENTS.md`).

## Install

```yaml
dependencies:
  usenavii: ^0.1.0-dev.1
```

```sh
flutter pub get
```

## Usage

```dart
import 'package:usenavii/usenavii.dart';

Navii(
  seed: user.id,
  size: 64,
  title: user.name,
)
```

Renders engine SVG via [`flutter_svg`](https://pub.dev/packages/flutter_svg)
(`SvgPicture.string`).

> **Animation:** the `animated` flag is accepted but not yet supported in the
> Flutter widget — the first frame is painted statically (same as
> `@usenavii/react-native`). CSS keyframes from the engine do not run inside
> `flutter_svg`.

## Props (`Navii`)

| Prop | Type | Default |
| --- | --- | --- |
| `seed` | `String` — **required** | — |
| `size` | `double` (logical px) | `96` |
| `paletteId` | known palette id (e.g. `'mint'`) | seed-derived |
| `palette` | `Palette` — runtime/brand palette | none |
| `background` | `'none' \| 'solid' \| 'ring'` or `BackgroundOverride` | seed-derived |
| `mood` | `'neutral' \| 'happy' \| 'serious' \| 'sleepy' \| 'wink'` | `'neutral'` |
| `packs` | `List<String>` — premium pack ids | none |
| `styleHint` | `'masc' \| 'femme' \| 'neutral'` | none |
| `title` | accessible label | none |
| `animated` | `bool` — accepted, painted statically for now | `false` |
| `alt` | accessible label | none |
| `tileBg` | opaque disc behind the avatar | none |

## `NaviiGroup`

```dart
NaviiGroup(
  seeds: team.map((u) => u.id).toList(),
  size: 48,
  overlap: 0.3,
  max: 5,
)
```

Each tile renders as an independent SVG inside a positioned `Stack`.

## Engine API (re-exported)

Once implemented (Phases 2–5):

```dart
createAvatar(seed, options);
selectAvatar(seed, options);
renderAvatar(spec, options);
renderGroup(seeds, options);
renderGroupTiles(seeds, options);
seed(fields);
seedFromEmail(email);
normalizeEmail(email);
random(options);
```

## License

MIT. See [LICENSE](./LICENSE).
