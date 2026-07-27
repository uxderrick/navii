# AGENTS.md — Flutter SDK (`packages/flutter`)

Senior engineering guide for building the Navii Flutter SDK in this fork.
Follow phases in order. Do not skip exit criteria.

## Mission

Ship a Flutter package (`usenavii` on pub.dev) that matches the contract of
`@usenavii/core` + `@usenavii/react-native`:

- Same seed + same options → **identical SVG string** as `@usenavii/core`.
- Offline, pure, deterministic. No network required for rendering.
- Thin Flutter widgets (`Navii`, `NaviiGroup`) over a Dart port of the engine.

**Architecture (locked):** Dart port of the TypeScript core inside
`packages/flutter/lib/src/core/`, plus widgets that render via `flutter_svg`
(`SvgPicture.string`). Not a hosted-API wrapper. Not a JS/WASM bridge.

Reference surfaces:

- Docs: [https://navii.dev/docs/quickstart](https://navii.dev/docs/quickstart) · [https://navii.dev/](https://navii.dev/)
- Upstream: [https://github.com/uxderrick/navii](https://github.com/uxderrick/navii) (`upstream` remote)
- Origin (this fork): [https://github.com/404khai/navii](https://github.com/404khai/navii) (`origin` remote)
- TS engine: `packages/core`
- Native widget contract: `packages/react-native`

---



## Non-negotiables

1. **SVG parity.** Golden tests must assert string-identical SVG for fixed
  seeds/options against `@usenavii/core` (export fixtures from vitest or a
   small Node script). Soften only with an explicit, documented allowlist
   (e.g. float formatting) — prefer exact match.
2. **PRNG stream order.** Never insert draws into the middle of the
  consumption sequence. New variants **append** only, same rule as core.
3. **Thin widgets.** All selection/render logic lives under `lib/src/core/`.
  Widgets map props → options and paint SVG. No second engine.
4. **Out of npm lockstep.** Flutter versions independently on pub.dev.
  Do **not** add `packages/flutter` to the npm publish matrix in
   `.github/workflows/release.yml`. Document version mapping in root
   `CHANGELOG.md` when shipping.
5. **Prop naming.** Mirror react-native: engine `style` → widget `styleHint`.
  Flutter `style` / decoration stays on the host `Widget`. Accessibility via
   `title` / `alt` → `Semantics`.
6. **No Node** `package.json` **in** `packages/flutter`**.** Keeps pnpm filters and
  release CI from treating it as an npm package.
7. **Seed guidance.** Prefer stable ids (`user.id` → UUID → email). Never
  `Date.now()` or display names as seeds.

---



## Monorepo conventions (read before coding)


| Area              | Convention                                                                         |
| ----------------- | ---------------------------------------------------------------------------------- |
| Workspace         | pnpm `packages/*` for JS SDKs; Flutter is Dart-only beside them                    |
| JS SDKs           | `@usenavii/{core,react,react-native,vue,svelte}` lockstep SemVer                   |
| Framework pattern | Call `createAvatar` / `renderGroupTiles`; re-export core helpers                   |
| RN animation      | `animated` accepted, rendered statically (CSS keyframes N/A) — same for Flutter v1 |
| Group layout      | `step = size * (1 - clamp(overlap, 0, 0.7))`; stack tiles + optional counter       |
| Contrib           | `CONTRIBUTING.md` — Flutter is an exception to npm lockstep                        |
| Branch            | `feat/flutter-sdk`                                                                 |


Public API to port (from `packages/core/src/index.ts`):

- `createAvatar`, `random`, `selectAvatar`, `renderAvatar`, `renderAvatarInner`
- `renderGroup`, `renderGroupTiles`
- `seed`, `seedFromEmail`, `normalizeEmail`
- `sha256Hex`, `createRng`, `cyrb53`, `build`
- Packs: `BUILT_IN_PACKS`, `PACK_REGISTRY`, `resolvePacks`
- Types: `AvatarOptions`, `AvatarSpec`, `GroupOptions`, `GroupTiles`, `Palette`,
`MoodId`, `StyleHint`, `SeedFields`, `SeedOptions`, …

Widget contract (from `packages/react-native`):

- `Navii(seed, size, paletteId, palette, background, mood, packs, styleHint, title, alt, animated, …)`
- `NaviiGroup(seeds, size, overlap, max, ring, tileBg, …)`
- Re-export engine helpers from the package barrel

---



## Phase 0 — Repo / tooling placement

**Goal:** Flutter package lives correctly in this monorepo without breaking JS tooling.

**Work:**

- Ensure `packages/flutter/` exists (scaffold in Phase 1).
- Root `.gitignore` covers `.dart_tool/`, Flutter `build/`, etc.
- Confirm `pnpm -r --filter './packages/*'` never requires Flutter (no
`package.json` in the Flutter package).
- Remotes: `origin` = fork, `upstream` = `uxderrick/navii` (fetch-only push URL).

**Exit criteria:**

- [ ] `packages/flutter` present; no npm `package.json` there
- [ ] `pnpm -r run build` / `test` still pass for existing JS packages
- [ ] Remotes configured as above; work on `feat/flutter-sdk`

---



## Phase 1 — Package scaffold + public API contract

**Goal:** Pub-ready skeleton with documented consumer API (stubs OK).

**Work:**

- `pubspec.yaml` — `name: usenavii`, Flutter SDK constraint, `flutter_svg`
- `lib/usenavii.dart` barrel exporting core + widgets
- `lib/src/core/` stubs (`createAvatar` may throw `UnimplementedError`)
- `lib/src/widgets/navii.dart`, `navii_group.dart`
- README shaped like `packages/react-native/README.md` (install, usage, props)
- `analysis_options.yaml`, MIT `LICENSE`, placeholder tests

**Exit criteria:**

- [ ] `flutter analyze` clean (or only expected stub warnings documented)
- [ ] Barrel exports match the intended public surface
- [ ] README props table matches RN (minus RN-only peers)

---



## Phase 2 — Port primitives

**Goal:** Deterministic hashing / PRNG / seed helpers match TS.

**Port from:**

- `packages/core/src/sha256.ts`
- `packages/core/src/prng.ts` (`cyrb53`, `sfc32` / `createRng`)
- `packages/core/src/seed.ts`

**Work:**

- Faithful Dart ports (same numeric widths / masking as JS where needed)
- Unit tests comparing outputs to known TS fixtures for the same inputs

**Exit criteria:**

- [x] `sha256Hex`, `cyrb53`, `createRng` sequence match TS fixtures
- [x] `seed` / `seedFromEmail` / `normalizeEmail` match TS
- [x] Tests green under `dart test` / `flutter test`

---



## Phase 3 — Port types + `selectAvatar`

**Goal:** Resolved `AvatarSpec` identical to TS for the same seed+options.

**Port from:**

- `packages/core/src/types.ts`
- `packages/core/src/select.ts`
- Part ID pools in `packages/core/src/parts/` (IDs only first if needed)

**Work:**

- Dart enums / typedefs mirroring TS unions
- `selectAvatar` with **identical PRNG draw order**
- Cover `paletteId`, `palette`, `background`, `mood`, `packs`, `style` (engine)

**Exit criteria:**

- [x] Spec field equality tests vs TS JSON fixtures for a seed matrix
- [x] Mood / styleHint / pack flags behave as in core docs
- [x] No PRNG inserts mid-stream

---



## Phase 4 — Port parts + `renderAvatar` / `createAvatar`

**Goal:** End-to-end `createAvatar` SVG parity with `@usenavii/core`.

**Port from:**

- `packages/core/src/parts/**`
- `packages/core/src/render.ts`, `xml.ts`, `animate.ts` (static path first)
- `packages/core/src/index.ts` (`createAvatar` composition)

**Work:**

- Port path/markup generators exactly (string templates, escapes)
- `createAvatar(seed, options) => renderAvatar(selectAvatar(...), options)`
- Cross-language golden: generate SVG from Node `@usenavii/core`, assert Dart
output equals fixture file

**Exit criteria:**

- [x] Golden suite passes for fixed seeds (include emails, UUIDs, edge sizes)
- [x] Empty seed throws (same error contract as core)
- [x] `animated: true` emits same CSS/`<style>` as core (Flutter paints first frame statically in widgets — Phase 6)

---



## Phase 5 — Group, packs, `build`, animation polish

**Goal:** Parity for group stacks, premium packs, and manual `build`.

**Port from:**

- `packages/core/src/group.ts`
- `packages/core/src/packs/**`
- `packages/core/src/build.ts`
- Remaining animate behavior as needed for string parity

**Work:**

- `renderGroup` / `renderGroupTiles` — same overlap math and counter tile
- Pack registry + `resolvePacks`
- `build(BuildSpec)` for non-seeded composition

**Exit criteria:**

- [x] Group tile SVGs + dimensions match TS fixtures
- [x] Built-in packs resolve and affect selection like core
- [x] `build` golden tests pass

---



## Phase 6 — Flutter widgets

**Goal:** Drop-in `Navii` / `NaviiGroup` for Flutter apps.

**Mirror:** `packages/react-native/src/index.tsx`

**Work:**

- `Navii`: required `seed`; map props → `AvatarOptions`; `SvgPicture.string`
- `NaviiGroup`: `renderGroupTiles` + `Stack`/`Positioned` with `step` math
- Semantics: `alt` ?? `title` for accessibility
- Accept `animated` but document static paint in v1 (like RN)
- Re-export engine API from `lib/usenavii.dart`

**Exit criteria:**

- [x] Widget tests: determinism (same seed → same SVG), layout size
- [x] Empty `seeds` on group → empty/zero-size widget (match RN null behavior)
- [x] README usage snippets compile against the public API

---



## Phase 7 — Example app + docs surface

**Goal:** Consumer-ready demo and discoverability.

**Work:**

- `packages/flutter/example/` — minimal app (seed field, size, mood, group)
- Update root `README.md` Packages table with Flutter / `usenavii`
- Optional: docs site page later (out of band unless API package updated)

**Exit criteria:**

- [x] Example runs on iOS/Android/macOS or web as documented
- [x] Root README lists the Flutter package
- [x] Package README links to [https://navii.dev](https://navii.dev) and GitHub

---



## Phase 8 — CI / publish

**Goal:** Quality gate and pub.dev path without touching npm release lockstep.

**Work:**

- GitHub Actions workflow (e.g. `.github/workflows/flutter.yml`) on changes
under `packages/flutter/**`: `flutter pub get`, `analyze`, `test`
- pub.dev publish checklist (`dart pub publish --dry-run`)
- CHANGELOG entry for Flutter releases (root and/or package)
- Explicitly **exclude** Flutter from `.github/workflows/release.yml` npm matrix

**Exit criteria:**

- [ ] CI green on the Flutter workflow
- [ ] Dry-run publish succeeds
- [ ] npm tag release still only publishes the five JS packages

---



## Working rules for agents

1. Read this file and the cited TS sources before editing.
2. Prefer small, test-backed commits per phase exit criteria.
3. When porting, copy algorithm and string output — do not “improve” SVG.
4. If TS core changes upstream, rebase/`git fetch upstream` and re-run goldens.
5. Do not push to `upstream`. Push feature work to `origin` on `feat/flutter-sdk`.
6. Do not expand scope into API/Docker/Figma unless asked.
7. Generate one standard detailed commit message with proper detailed PR description when done with each phase



### PR Description

You could write something like:

```
## Summary

This PR adds an official Flutter SDK for Navii.

### Features

- Flutter/Dart client
- Authentication support
- Chat API
- Error handling
- Example application
- Documentation

### Notes

The SDK follows the structure and API design of the existing React, React Native, Vue, and Svelte SDKs.
```

8. DO NOT commit for me, just give me the commit message when done



## Quick commands

```sh
# JS monorepo (unchanged)
pnpm -r --filter './packages/*' run test

# Flutter package
cd packages/flutter
flutter pub get
flutter analyze
flutter test

# Example app (web / macOS)
cd packages/flutter/example
flutter pub get
flutter run -d chrome
# flutter run -d macos
```



## Current status

- Phase 0–1: scaffold landed on `feat/flutter-sdk` (stubs).
- Phase 2: primitives ported (`sha256`, `prng`, `seed`) with TS fixture parity tests.
- Phase 3: `selectAvatar` + palettes/part IDs + built-in packs; TS spec fixtures green.
- Phase 4: `createAvatar` / `renderAvatar` SVG string parity with `@usenavii/core` goldens.
- Phase 5: `renderGroup` / `renderGroupTiles`, `build(BuildSpec)`, packs registry parity + goldens.
- Phase 6: `Navii` / `NaviiGroup` widgets (SvgPicture, Semantics, widget tests).
- Phase 7: example app (`packages/flutter/example`) + root README Packages listing.
- Phase 8+: implement per exit criteria above.

