# usenavii

**Flutter binding for [Navii](https://navii.dev) — deterministic mascot avatars.**
Drop a `Navii(seed: user.id)` and every user has a face, no uploads.

- [Live demo](https://navii.dev)
- [Docs](https://navii.dev/docs)
- [GitHub](https://github.com/uxderrick/navii)
- [Implementation plan](../../AGENTS.md) (Phases 2+ — engine port in progress)

> **Status:** Phase 4 complete — `createAvatar` / `renderAvatar` match `@usenavii/core` SVG output.
> Group / packs polish and Flutter widgets polish continue in Phases 5–6.

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

**Phases 2–4 (available now):**

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
