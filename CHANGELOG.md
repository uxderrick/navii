# Changelog

All notable changes to `@usenavii/core` and `@usenavii/react`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org). Both packages ship in lockstep.

## [Unreleased]

## [0.22.1] - 2026-05-26

### Changed (API host)
- Support email switched from `tsormed@gmail.com` to `support@navii.dev` (ImprovMX free-tier forward → tsormed@gmail.com).

## [0.22.0] - 2026-05-26

### Added (`@usenavii/core` 0.5.0)
- **Pack overhaul** — all 7 packs given distinct visual identities via new render flags (`flat`, `bgColor`, `featureStroke`, `paletteExclusive`, `glow`). Each pack now reads as a different illustration system, not just a recoloring.
- **New body shapes** (pack-only, base seeds unchanged): `squircle` (full-bleed corporate tile), `pumpkin`, `ghost`, `skullHead`.
- **New mouth styles** (pack-only): `jagged` (carved-pumpkin grin), `fangs` (vampire teeth).
- **New toppers**: `witchHat`, `pumpkinStem`, `ghostSheet`, `bob`, `bun`, `ponytail`.
- **New accessory**: `earring` (palette-themed stud + drop pair).
- **New outfit**: `tie` (corporate necktie — knot + tapered blade).
- **`Pack.glow`** flag emits an outer-glow SVG filter behind the body (Gaussian blur tinted by palette). Used by Neon.
- **`AvatarSpec.flat` / `bgColor` / `featureStroke` / `glow`** — render directives the engine reads to alter body/face rendering per enabled pack.
- **`featureStroke` multiplier** scales stroke widths on eyes, mouth, glasses uniformly. Office bumps to 1.35, Neon 1.5, Mono down to 1.15 (delicate).
- **New `office-bright` pack** — vivid sibling of Office for marketing/design teams.

### Changed (`@usenavii/core` 0.5.0)
- Pack picks now **authoritative** — `resolvePartPool` no longer intersects against base pool, so packs can introduce ids unknown to the base (e.g. Office's squircle). Type system enforces validity.
- Office, Halloween, Pastel, Neon, Mono, Earth packs reauthored with theme-cohesive picks, style hints, and exclusive palette pools.
- Office uses full-bleed squircle + white plate + necktie outfits + bolder strokes for ID-badge look.
- Halloween uses pumpkin/ghost/skullHead bodies + jagged/fangs mouths + witchHat/stem/sheet toppers + dark night plate.
- Neon emits an outer glow halo via SVG filter behind the body.
- Mono switched to full-bleed squircle (was contained orb) for editorial tile look.

### Added (API host)
- **Polar.sh license verification** — `POST /license/verify` now proxies to Polar's `/v1/customer-portal/license-keys/validate` (replaces Gumroad). Validates `status === 'granted'`, expiry, and optional benefit-id match.
- **`GET /checkout`** — redirects to Polar checkout w/ configured product preselected. Powered by `@polar-sh/hono`.
- **`GET /portal`** — Polar customer portal proxy (license re-fetch, refund request).
- **`POST /polar/webhooks`** — signature-verified webhook receiver, logs events.
- New env vars: `POLAR_ORGANIZATION_ID`, `POLAR_PRODUCT_ID`, `POLAR_BENEFIT_ID`, `POLAR_ACCESS_TOKEN`, `POLAR_SUCCESS_URL`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER`.
- Compose file wires all Polar vars from `/opt/navii/.env`.
- 8 new license unit tests w/ fetch mock covering granted/revoked/expired/wrong-product/upstream-error paths.

### Changed (API host)
- Privacy page swapped Gumroad references for Polar.sh.
- `AppOptions` renamed `gumroadProductPermalink` → `polarOrganizationId` + related Polar fields.

### Added (Figma plugin)
- **Style hint pill row** in Packs panel — Auto / Masc / Femme / Neutral toggle. Persisted via `navii.style` localStorage. Disabled when no pack active.
- Plugin checkout URL now points at `${API_BASE}/checkout` (instead of hardcoded Gumroad link), letting us swap payment providers without re-publishing.

### Fixed (Figma plugin)
- Left column in Packs panel was not scrollable when content overflowed (e.g. with new Style hint section). Added `overflow-y: auto` + `min-height: 0` to `.col-left`.

## [0.21.2] - 2026-05-26

### Changed (API host)
- Golly logo now links to `https://gollyexpress.com/` and is labeled "Golly Express".

## [0.21.1] - 2026-05-26

### Added (API host)
- Golly and Fleetlinq logos in the landing "built with navii" wall.
- Client-side Fisher-Yates shuffle of logos on every page load, so positions vary while the response itself stays cacheable.

### Changed (API host)
- On viewports ≤540px the two logo rows collapse into a single wrapping row via `display: contents`. Desktop unchanged.

## [0.21.0] - 2026-05-26

### Added (API host)
- Landing "built with navii" logo wall section above the playground, in two centered rows.
- `GET /logos/:file` route serving PNG/SVG/JPG/WEBP assets from `packages/api/public/logos` with a filename whitelist and path-traversal guard.
- Dockerfile copies `packages/api/public` into the runtime image so the route works in production.

## [0.20.1] - 2026-05-25

### Fixed
- `@usenavii/core`: `StylePartSubset` now includes `eyes` and `mouth` so pastel pack `styleHints` typecheck. No runtime change — pack already used these fields.
- `@usenavii/react`: `NaviiProps` no longer collides with React's `style: CSSProperties`. Engine-level style hint moved to `styleHint?: 'masc' | 'femme' | 'neutral'`. Inline CSS via `style` still works.

## [0.20.0] - 2026-05-25

Deployment-only release. No changes to `@usenavii/core` or `@usenavii/react` (both remain at 0.4.0).

### Added (API host)
- `/privacy` — public privacy policy page covering avatar requests, license verification, and analytics.
- `/support` — public support page with contact email, GitHub issues link, and console-capture instructions.
- Both pages linked from landing + docs footers and listed in `/sitemap.xml`.

### Added (Figma plugin)
- `networkAccess.reasoning` in `manifest.json` explaining why `api.navii.dev` and `navii.dev` are allowlisted.
- Offline pre-flight on insert, fill-random, and license-verify — surfaces a clear notification instead of failing silently when `navigator.onLine` is `false`.
- `notify` message type so the UI iframe can push toasts through `figma.notify`.

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

[Unreleased]: https://github.com/uxderrick/navii/compare/v0.22.1...HEAD
[0.22.1]: https://github.com/uxderrick/navii/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/uxderrick/navii/compare/v0.21.2...v0.22.0
[0.21.2]: https://github.com/uxderrick/navii/compare/v0.21.1...v0.21.2
[0.21.1]: https://github.com/uxderrick/navii/compare/v0.21.0...v0.21.1
[0.21.0]: https://github.com/uxderrick/navii/compare/v0.20.1...v0.21.0
[0.20.1]: https://github.com/uxderrick/navii/compare/v0.20.0...v0.20.1
[0.20.0]: https://github.com/uxderrick/navii/compare/v0.19.0...v0.20.0
[0.4.0]: https://github.com/uxderrick/navii/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/uxderrick/navii/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/uxderrick/navii/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/uxderrick/navii/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/uxderrick/navii/releases/tag/v0.1.0
