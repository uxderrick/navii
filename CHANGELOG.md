# Changelog

All notable changes to `@usenavii/core`, `@usenavii/react`, `@usenavii/react-native`, `@usenavii/vue`, and `@usenavii/svelte`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org). All packages ship in lockstep.

## [0.28.1] - 2026-07-24

### Fixed

- Bundled the `@mhaadi/svg` adapters into the React, Vue, and React Native distributions, restoring direct Node ESM/SSR imports and React Native 0.76 Metro compatibility without package-exports opt-in.

## [0.28.0] - 2026-07-24

### Added (`@usenavii/core` 0.9.0)

- **`renderGroupTiles(seeds, options)`** — returns per-tile SVG strings (`GroupTiles`) instead of a single composite SVG. Enables per-tile rendering in framework adapters where nested `<svg>` elements aren't supported (React Native) or where independent per-tile caching is desirable.
- Per-tile unique `clipPath` ids in `renderGroup` output (`navii-clip-${tileId}` instead of shared `navii-clip`), preventing DOM id collisions when multiple groups render on the same page.

### Changed (`@usenavii/react` 0.9.0) — breaking

- `<Navii>` and `<NaviiGroup>` now render inline `<svg>` elements via `@mhaadi/svg` instead of `<img src="data:image/svg+xml;...">`. CSS animations and `<title>` accessibility work natively in the DOM. Pass `as="img"` to keep the old data-URI `<img>` behavior.
- `<NaviiGroup>` now renders each tile as an independent `<svg>` inside a wrapper `<div>` with absolute positioning, instead of a single composite `<img>`. Pass `as="img"` for the composite data-URI `<img>` shape.
- Added `@mhaadi/svg` as a dependency.
- `react-dom` is now an optional peer dependency (for SSR).

### Added (`@usenavii/react` 0.9.0)

- `as` prop on `<Navii>` and `<NaviiGroup>` — `'svg'` (default, inline) or `'img'` (data-URI `<img>` fallback).
- `sanitize` prop — run better-svg's sanitizer on engine output. Default `false` (engine output is already escaped).
- `loading` / `fallback` props — rendered while SVG is parsing or when parsing fails. Forwarded to `@mhaadi/svg`.
- `onSvgLoad` / `onSvgError` callbacks — forwarded to `@mhaadi/svg`.
- `GroupTiles` type re-exported from `@usenavii/core`.

### Added (`@usenavii/react-native` 0.9.0)

- **New package.** React Native binding for Navii. Renders avatars as `react-native-svg` trees via `@mhaadi/svg/react-native`. Peer deps: `react-native` `>=0.73`, `react-native-svg` `>=15`.
- `<Navii seed="..." />` and `<NaviiGroup seeds={[...]} />` components with the same prop surface as `@usenavii/react` (minus `as`, `className`, DOM-specific props).
- `animated` prop accepted but rendered statically on React Native (first frame only). CSS keyframe animations don't translate to `react-native-svg`. A future version will use `react-native-reanimated`.

### Added (`@usenavii/vue` 0.9.0)

- **New package.** Vue 3 binding for Navii. Renders inline `<svg>` via `@mhaadi/svg/vue`. Peer dep: `vue` `>=3.5`.
- `<Navii>` and `<NaviiGroup>` components with the same prop surface as `@usenavii/react`. Uses Vue's `defineComponent` + `computed` + `h`.

### Added (`@usenavii/svelte` 0.9.0)

- **New package.** Svelte 5 binding for Navii. Renders inline `<svg>` via `@mhaadi/svg/svelte`. Peer dep: `svelte` `>=5`.
- `<Navii>` and `<NaviiGroup>` components using Svelte 5 runes (`$props`, `$derived`, `$derived.by`).

## [0.27.0] - 2026-06-10

### Added (`@usenavii/core` 0.8.0)

- Added premium packs: Accra Gallery, Lagos Danfo, Nairobi Matatu, and Command Center.
- Added the pack-specific palettes, body shapes, toppers, accessories, outfits, and render directives needed for those premium pack identities.

### Fixed (`@usenavii/react` 0.8.1)

- `<Navii>` and `<NaviiGroup>` now forward `packs` to the core renderer, so React consumers can render premium pack avatars directly.

## [0.26.1] - 2026-05-31

### Changed (docs)

- Removed Gravatar comparisons from user-facing docs (README, package READMEs, `/docs/recipes`, `/docs/sdk-core`). Functionality unchanged — `seedFromEmail()` still hashes `sha256(email.trim().toLowerCase())`, so cross-product seed parity still holds for any caller using the same scheme.

## [0.26.0] - 2026-05-30

### Added (`@usenavii/core` 0.7.0)

- **`seedFromEmail(email)`** — Gravatar-compatible seed helper. Returns `sha256` hex of the trimmed + lowercased email so the raw address never reaches URLs, server access logs, `Referer` headers, browser history, CDN cache keys, or analytics pixels. Two services hashing the same email produce the same seed → drop-in compatible with Gravatar's lookup scheme.
- **`normalizeEmail(email)`** — exported canonicalization step (trim + lowercase + NFC) for callers who need to reproduce the form before hashing.
- **`sha256Hex(input)`** — sync SHA-256 (FIPS 180-4) primitive used by `seedFromEmail`. Pure JS, no deps; available for callers that want to hash other inputs in the same scheme.
- **`SeedOptions`** type + `hashEmail` option on `Navii.seed()`.

### Changed (`@usenavii/core` 0.7.0) — breaking

- `Navii.seed({ email })` now returns `sha256(normalizeEmail(email))` instead of the raw address. **Migration:** if your existing avatars were keyed on raw emails and you need them to stay stable, pass `{ hashEmail: false }` until you can re-key. New deployments should leave the default.
- `Navii.seedFromEmail` exposed on the `Navii` namespace.

### Added (`@usenavii/react` 0.8.0)

- Re-exports `seed`, `seedFromEmail`, `normalizeEmail`, `SeedFields`, `SeedOptions` from `@usenavii/core` so `<Navii seed={seedFromEmail(user.email)} />` works without a second import.

### Added (API host)

- `/avatar/:seed` sets `x-navii-warning: plaintext-email-seed; hash with seedFromEmail()` when the seed matches an email pattern. Render still succeeds — the header is a client-side nudge. Also logged at `warn` level for ops visibility.

### Changed (API host)

- `/docs/recipes` gets a new "Using emails as seeds (Gravatar-style)" section.
- `/docs/sdk-core#seed` documents `seedFromEmail`, `normalizeEmail`, and the `hashEmail` option on `Navii.seed()`.
- `/docs/http-api#headers` documents the new `x-navii-warning` response header.

## [0.25.2] - 2026-05-28

### Changed (API host)
- Landing hero CTAs reworked. New triple: `Install Navii →` (primary, scrolls to install snippets), `Get Figma Plugin →` (secondary, opens Figma community), `Try the Builder` (tertiary text link → `/builder`). Old single-purpose pair (`Try it` + `Customize a face`) replaced — plugin is now visible from the hero.
- `/docs/sdk-core` SDK options table picks up `packs` + `style` rows (matches the engine surface that's been live since v0.23.0).

## [0.25.1] - 2026-05-27

### Added (API host)
- **`/avatar/:seed?packs=…&style=…`** — `/avatar/:seed` now parses `packs` (comma-separated pack ids) and `style` (`masc | femme | neutral`) query params. Unknown pack ids are silently skipped (engine ignores them). Pack order does not affect cached output — the PNG cache key normalizes by sorting.

### Fixed (API host)
- PNG cache key extended to include `packs` + `style` so cached renders no longer collide across different pack/style combinations of the same seed.

### Changed (API host)
- `/docs/http-api` documents the new `packs` and `style` rows in the `/avatar/:seed` query table, plus new example URLs (`?packs=halloween`, `?packs=office,mono&style=neutral`).
- `/random` inherits the new params (it forwards every `/avatar/:seed` query through unchanged).

### Notes
- Required by the upcoming Figma plugin update (fixes fill-mode rendering — plugin was sending the right options to the main thread but `buildUrl()` was stripping `packs`/`mood`/`style` before the HTTP request).
- Backward compatible. Existing `<img src="https://api.navii.dev/avatar/alice">` URLs unchanged.

## [0.25.0] - 2026-05-27

### Added (`@usenavii/react` 0.7.0)
- **`<NaviiGroup>`** — overlapping avatar stack, thin React wrapper around `@usenavii/core`'s `renderGroup()`. Props: `seeds`, `size`, `overlap`, `max` (overflow → `+N` counter tile), `ring`, `tileBg`, `counterFill`, `counterInk`, plus all per-tile options (`paletteId`, `palette`, `mood`, `background`, `animated`, `styleHint`). `<img>` width is computed from `size + overlap + max` so layout is stable on load.
- `renderGroup` + `GroupOptions` re-exported from `@usenavii/react`.

### Changed (`@usenavii/core`)
- No source changes. Stays at `0.6.0` — react `0.7.0` ships independently. Lockstep convention relaxed when only one package has source changes.

### Changed (tooling)
- `scripts/release-audit.mjs` — core/react version mismatch downgraded from `error` to `warn`. Lockstep stays the default expectation, but the audit no longer forces a no-op publish on the unchanged package.

### Added (API host)
- `/docs/sdk-react` documents `<NaviiGroup>` props + behavior, plus the new `renderGroup`/`GroupOptions` re-exports.

## [0.24.2] - 2026-05-27

### Added (API host)
- The Skill Club and ForYu logos in the landing "built with navii" wall.

## [0.24.1] - 2026-05-27

### Added (Figma plugin)
- **Sign out of Pro** — Pro pill in header now opens upgrade modal even when Pro. Modal footer shows the signed-in email + a Sign-out button that clears the cached license via `license-clear`. Lets users test the free-tier flow on the same device without losing access (the underlying Polar license is unchanged).

### Changed (Figma plugin)
- Pro pill click now always opens the upgrade modal (was: free-only). Pro view exposes account info + sign-out.
- Footer (Insert / Fill random) hidden on **Packs** and **Mascots** tabs — those are browsing surfaces with their own inline actions (Enable button in pack-modal, card-click action modal in Mascots). Footer remains on Seed + Build where Insert is the primary CTA.

### Fixed (Figma plugin)
- Pro user's usage chip stayed stuck at "10 of 10 left today" on plugin open due to a race between `usage-get` (UI request) and `doLicenseRestore` (main thread state). Restore now pushes a fresh usage snapshot via `doUsageGet()` after setting `cachedLicenseOk`, so the chip flips to "Pro · Unlimited" reliably.

## [0.24.0] - 2026-05-27

### Added (API host)
- **Per-release OG cards** — `GET /og/blog/v<X.Y.Z>.png` composes a 1200×630 card for each minor+ release: dark radial background, hero avatar (deterministic from `navii <version>` seed + `mood: happy`, transparent so the mascot floats on the gradient), version pill, headline parsed from CHANGELOG, date, and `navii.dev/blog` brand mark. Cached per version. `/blog/v<X.Y.Z>` now sets `og:image` + `twitter:image` to this URL so social previews show the release-specific card instead of the generic landing OG image.

## [0.23.6] - 2026-05-27

### Removed (API host)
- Ghana Duty logo from the landing "built with navii" wall (asset + markup). Wall keeps Elorm UI, Golly Express, Fleetlinq.

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

[Unreleased]: https://github.com/uxderrick/navii/compare/v0.28.1...HEAD
[0.28.1]: https://github.com/uxderrick/navii/compare/v0.28.0...v0.28.1
[0.28.0]: https://github.com/uxderrick/navii/compare/v0.27.2...v0.28.0
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
