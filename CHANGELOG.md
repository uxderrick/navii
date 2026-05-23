# Changelog

All notable changes to `@usenavii/core` and `@usenavii/react`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org). Both packages ship in lockstep.

## [Unreleased]

## [0.4.0] - 2026-05-23

### Added
- `Navii.random()` — pick a random seed and return its avatar, so callers don't need to bring their own RNG.

## [0.3.0] - 2026-05-22

### Added
- Outfit slot, builder-only and opt-in: `collar`, `scarf`, `bowtie`, `sunflower`, `necklace`.

## [0.2.1] - 2026-05-22

### Changed
- Each package now ships its own README to npm (`@usenavii/core` and `@usenavii/react` show distinct landing pages on npmjs.com).

## [0.2.0] - 2026-05-22

### Added
- `Navii.build(parts)` — compose an avatar from explicit part choices, no seed required.
- `Navii.seed(...)` — public seed-to-parts derivation surface.
- Snapshot test coverage for `build` and `seed`.

## [0.1.0] - 2026-05-22

### Added
- Initial public release of `@usenavii/core` and `@usenavii/react`.
- Deterministic avatar engine: `Navii(seed)` returns a stable SVG string for any seed.
- React binding: `<Navii seed="..." />`.
- Dual ESM/CJS build via tsup. TypeScript types included.

[Unreleased]: https://github.com/uxderrick/navii/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/uxderrick/navii/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/uxderrick/navii/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/uxderrick/navii/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/uxderrick/navii/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/uxderrick/navii/releases/tag/v0.1.0
