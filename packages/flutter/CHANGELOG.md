# Changelog

All notable changes to the Flutter package [`usenavii`](https://pub.dev/packages/usenavii).

This package versions **independently** of the npm `@usenavii/*` lockstep
(see root [`CHANGELOG.md`](../../CHANGELOG.md) for JS SDKs).

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [SemVer](https://semver.org).

## [0.1.0] - 2026-08-24

### Changed

- Promoted the initial official Flutter SDK to a stable release after
  validating the published package in Flutter web and Android applications.

## [0.1.0-dev.1] - 2026-07-27

### Added

- Initial Flutter / Dart SDK port of `@usenavii/core` with SVG string parity.
- `createAvatar`, `selectAvatar`, `renderAvatar`, `renderGroup` /
  `renderGroupTiles`, `build`, packs registry, seed / PRNG / sha256 helpers.
- `Navii` and `NaviiGroup` widgets via `flutter_svg` (mirrors
  `@usenavii/react-native`; `animated` accepted, painted statically in v1).
- Example app under `example/` (seed, size, mood, group).
- Golden tests against `@usenavii/core` fixtures.
- Flutter SDK guide at `/docs/sdk-flutter`, including supported platforms and
  current `flutter_svg` animation / filter limitations.
