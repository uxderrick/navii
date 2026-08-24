# usenavii

**Flutter binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `Navii(seed: user.id)` and every user has a face, no uploads.

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)

> **Status:** Stable. Engine and widgets match `@usenavii/core` /
> `@usenavii/react-native`; Flutter-specific renderer limitations are listed
> below.

## Install

```yaml
dependencies:
  usenavii: ^0.1.1
```

```sh
flutter pub add usenavii
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

> **SVG filters:** `flutter_svg` does not support the engine's hue-rotation or
> Gaussian-glow filters. Avatars still render, but affected pack effects can
> look different from Web.

## Platform support

`usenavii` supports Android, iOS, Web, macOS, Windows, and Linux on Flutter
3.24 or newer. Rendering is fully offline and does not load remote assets.

## Example app

```sh
cd packages/flutter/example
flutter pub get
flutter run -d chrome    # or: flutter run -d macos
```

Demo covers seed input, size, mood, and `NaviiGroup`. See [`example/README.md`](./example/README.md).

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
| `alt` | accessible label (wins over `title`) | none |
| `tileBg` | opaque disc behind the avatar | none |

Accessibility uses `alt ?? title` via [Semantics] (image role), matching RN
`accessibilityLabel`.

## `NaviiGroup`

```dart
NaviiGroup(
  seeds: team.map((u) => u.id).toList(),
  size: 48,
  overlap: 0.3,
  max: 5,
)
```

Each avatar tile renders as an independent SVG inside a positioned `Stack`.
The `+N` overflow chip is a Flutter-centered disc (`flutter_svg` does not
honor SVG `dominant-baseline`). Empty `seeds` yields a zero-size widget (RN
returns `null`).

| Prop | Type | Default |
| --- | --- | --- |
| `seeds` | `List<String>` — **required** | — |
| `size` | `double` | `64` |
| `overlap` | `double` (clamped 0–0.7) | `0.3` |
| `max` | `int` — overflow → `+N` tile | all seeds |
| `ring` / `tileBg` / `counterFill` / `counterInk` | colors | engine defaults |
| `paletteId` / `palette` / `background` / `mood` / `packs` / `styleHint` / `animated` | same as `Navii` | — |
| `alt` | accessible label | `'Group of N avatars'` |
| `groupId` | clipPath id namespace | derived from seeds |

## Engine API (re-exported)

```dart
sha256Hex(input);
cyrb53(input, [salt]);
createRng(seed);
normalizeEmail(email);
seedFromEmail(email);
seed(SeedFields(...), [SeedOptions(hashEmail: true)]);
selectAvatar(seed, options);
createAvatar(seed, options); // → SVG string
renderAvatar(spec, options);
build(spec, options); // explicit parts, no seed
renderGroup(seeds, options);
renderGroupTiles(seeds, options);
resolvePacks(ids);
random(options);
```

## License

MIT. See [LICENSE](./LICENSE).

## Publishing

Flutter versions independently of the npm `@usenavii/*` lockstep:

```sh
cd packages/flutter
dart pub publish --dry-run
dart pub publish
```

Do **not** add this package to `.github/workflows/release.yml`.
