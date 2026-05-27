# Changelog

All notable changes to `@usenavii/core` and `@usenavii/react`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org). Both packages ship in lockstep.

## [Unreleased]

## [0.23.5] - 2026-05-27

### Added (API host)
- Ghana Duty logo (PNG) in the landing "built with navii" wall, alongside Elorm UI.

## [0.23.4] - 2026-05-26

### Fixed (API tests)
- `license/verify` "route not mounted" test expected `404` but the app's catchall `notFound` handler returns `302 → /`. Test updated to match actual behavior. v0.23.3 release pipeline failed on this stale expectation; v0.23.4 reships the `/blog` timeline with the fix.

## [0.23.3] - 2026-05-26 (yanked — test pipeline failed)

### Added (API host)
- **`/blog` — release timeline.** New page parses `CHANGELOG.md` at request time, surfaces minor+ releases (`x.y.0`) only, links to GitHub release notes per entry. Per-release permalinks at `/blog/v<x.y.z>`. Hero avatar per release derived from the version string. Sitemap includes every release URL. Linked from landing + docs nav.

## [0.23.2] - 2026-05-26

### Changed (docs)
- Public READMEs (root, `@usenavii/core`, `@usenavii/react`) and the live API reference at `/docs/http-api` + `/docs/sdk-core` now document `AvatarOptions.mood`, the new `Palette` object override on `build()`, and the `?mood=` query param on `/avatar/:seed`. React README memo-deps line corrected to match source (`mood`, `palette`, `styleHint` in; stale `tileBg` claim out).
- Chore release — image rebuild deploys the updated landing page and `/docs/*` pages to `api.navii.dev`. No npm package contents changed (publish step no-ops on existing versions).

## [0.23.1] - 2026-05-26

### Fixed (release)
- `@usenavii/react` workspace dep on `@usenavii/core` updated to `^0.6.0` — v0.23.0 release workflow failed pnpm install with `ERR_PNPM_NO_MATCHING_VERSION_INSIDE_WORKSPACE` because the workspace spec was stuck at `^0.5.0`. v0.23.1 reships the v0.23.0 feature set (mood overlay + runtime palette injection) with the dep bump.

## [0.23.0] - 2026-05-26 (yanked — release pipeline failed)

### Added (`@usenavii/core` 0.6.0, `@usenavii/react` 0.6.0)
- **`AvatarOptions.mood`** — new `MoodId = 'neutral' | 'happy' | 'serious' | 'sleepy' | 'wink'`. Overrides seed-derived eyes + mouth with a curated pair: `happy` → wide + smile, `serious` → squint + flat, `sleepy` → sleepy + dot, `wink` → wink + smirk. Same seed + same mood = byte-identical render. Different mood on the same seed shares body / palette / topper. Bypasses pack pick constraints by design (the mood IS the override). `neutral` (or undefined) preserves prior behavior.
- **Runtime palette injection in `build()`** — `options.palette` (Palette object) now wins over `spec.palette` (id). Lets callers pass a brand or runtime-built palette without registering it in `PALETTES`. Fall-through: `options.palette` → `spec.palette` id → `PALETTES[0]`.
- **React `<Navii>`** forwards new `mood` and `palette` props through to the engine; `MoodId` re-exported from the React package.

### Added (API host)
- `GET /avatar/:seed?mood=happy|serious|sleepy|wink|neutral` — server-side mood overlay. PNG cache key extended with `m=` so moods don't collide.
- Elorm UI logo (inline SVG, `currentColor`) in the landing "built with navii" wall, sized via new `.logo svg.lg` rule.

## [0.22.4] - 2026-05-26

### Fixed (Figma plugin)
- **Missing `permissions: ["teamlibrary"]`** in `manifest.json`. Without it, `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()` throws and Brand mode silently returns an empty palette list for every Pro user. Added.
- **`innerHTML` interpolation** of `pack.name` and `pack.emoji` replaced with `createElement` + `textContent` (ui.ts, active-packs chip + pack-card title). XSS surface closed even though current pack data is static.
- **`doInsertBuild` new-node path** now wrapped in try/catch — uncaught throw from `figma.createNodeFromSvg` would otherwise kill the plugin's main thread.

### Removed (Figma plugin)
- **Cmd+Shift+P dev-bypass shortcut** that unlocked Pro features for free. Violated Figma's review policy (hidden functionality circumventing fees). Deleted entirely; only the Cmd+Enter primary-action shortcut remains.

### Changed (Figma plugin)
- **License key no longer crosses the iframe boundary.** Main thread sends a sanitized `publicLicenseView()` over `figma.ui.postMessage`. The raw key stays in the main thread (needed for re-verify) + `figma.clientStorage` only. UI never sees or stores the key string.

### Fixed (build pipeline)
- **`scripts/build.mjs`** stopped escaping `<script` (without `/`). Per HTML5 only `</script` ends a script block; the extra replace could corrupt minified regex/string literals containing the substring. Only `</script` is escaped now.

## [0.22.3] - 2026-05-26

### Fixed (API host)
- `/license/verify` blocked by CORS when called from the Figma plugin iframe (`Origin: null` preflight). Added permissive CORS middleware (route only accepts a license key — no cookies/auth — so wide-open CORS is safe) plus an `OPTIONS` preflight handler. Plugin verify flow now reaches the API end-to-end.

## [0.22.2] - 2026-05-26

### Added (API host)
- `GET /thanks` — post-purchase confirmation page Polar redirects buyers to after successful checkout. Confirms payment, points them to their email for the license key, and links to the Polar customer portal via the one-time `customer_session_token` query param.

### Fixed (API host)
- Buyers hit a 404 at `https://navii.dev/thanks` after paying because no route existed yet.

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
- **Polar.sh license verification** — `POST /license/verify` now proxies to Polar's `/v1/customer-portal/license-keys/validate` (replaces Polar.sh). Validates `status === 'granted'`, expiry, and optional benefit-id match.
- **`GET /checkout`** — redirects to Polar checkout w/ configured product preselected. Powered by `@polar-sh/hono`.
- **`GET /portal`** — Polar customer portal proxy (license re-fetch, refund request).
- **`POST /polar/webhooks`** — signature-verified webhook receiver, logs events.
- New env vars: `POLAR_ORGANIZATION_ID`, `POLAR_PRODUCT_ID`, `POLAR_BENEFIT_ID`, `POLAR_ACCESS_TOKEN`, `POLAR_SUCCESS_URL`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER`.
- Compose file wires all Polar vars from `/opt/navii/.env`.
- 8 new license unit tests w/ fetch mock covering granted/revoked/expired/wrong-product/upstream-error paths.

### Changed (API host)
- Privacy page swapped Polar.sh references for Polar.sh.
- `AppOptions` renamed `Polar.shProductPermalink` → `polarOrganizationId` + related Polar fields.

### Added (Figma plugin)
- **Style hint pill row** in Packs panel — Auto / Masc / Femme / Neutral toggle. Persisted via `navii.style` localStorage. Disabled when no pack active.
- Plugin checkout URL now points at `${API_BASE}/checkout` (instead of hardcoded Polar.sh link), letting us swap payment providers without re-publishing.

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

[Unreleased]: https://github.com/uxderrick/navii/compare/v0.22.4...HEAD
[0.22.4]: https://github.com/uxderrick/navii/compare/v0.22.3...v0.22.4
[0.22.3]: https://github.com/uxderrick/navii/compare/v0.22.2...v0.22.3
[0.22.2]: https://github.com/uxderrick/navii/compare/v0.22.1...v0.22.2
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
