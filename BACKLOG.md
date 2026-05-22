# Navii Backlog

Tracked work beyond the current scaffold. Ordered by impact, not priority — pick what fits the moment.

## Combinatorial expansion (grow output space)

- [x] **More part variants** — _Progress: palette 16→22, body 5→8, eyes 6→10, mouth 6→10, accessory 4→7 (+glasses/eyepatch/mole), topper 8→12 (+headband/halo/crown/antlers). Antenna still at 5. Discrete space now 22.2M._ Further variants are nice-to-have but no longer a bottleneck.
- [x] **Continuous params** — hue ±30°, body scale 0.92–1.08, eye gap ±2, mouth curvature 0.85–1.15, antenna tilt ±8°. Discrete × continuous = effectively unbounded.
- [ ] **Compound accessories** — stack blush + freckles + sparkle on the same avatar. Currently single-pick.
- [ ] **Outfit slot** — collar / scarf / bowtie. New layer below face, anchored to body.

## Art polish (designer handoff)

- [ ] Hand-drawn silhouette paths replacing current passable ones
- [ ] Refined eye/mouth shapes at illustrator quality
- [ ] Color story — palette pairings curated for harmony, not just hue spread
- [ ] Per-body face-feature offsets fine-tuned by eye (anchor table currently sketch quality)

## Distribution

- [x] **Publish to npm** — `@usenavii/core@0.2.1`, `@usenavii/react@0.2.1` live. tsup dual ESM/CJS, per-package READMEs with hero image, GitHub Action publishes on tag with skip-if-published guard.
- [x] **Public hosted endpoint** — `navii-api.uxderrick.com` (Hetzner + host Caddy + auto-TLS). PNG raster via resvg-js. Rate-limit 600/min/IP. LRU PNG cache. `/healthz`. CORS `*`. Immutable cache headers.
- [ ] **Cloudflare Worker deploy** — swap `@resvg/resvg-js` → `@resvg/resvg-wasm`, edge cache, lower latency globally.
- [ ] **Public CDN at `navii.dev`** — buy the domain, front Hetzner with Cloudflare proxy OR move to Workers entirely.

## Product

- [x] **Demo site** — `navii.uxderrick.com`. Hero, framework-aware playground (7 frameworks × 6 use cases), animated cast grid, group demo, Redoc-style API reference, per-use-case rendered preview component.
- [x] **Docs** — `navii.uxderrick.com/docs`. Multi-page.
- [x] **Seed uniqueness guidance** — README ✅/⚠️/❌ table, JSDoc on `createAvatar`, `/api` JSON `seed` block, landing playground bar labeled "user id". Plus `Navii.seed({...})` helper that picks the most-unique field automatically.
- [x] **`Navii.seed({ id, email, name, createdAt })` helper** — pit-of-success seed composer. Prefers id → email → name+createdAt → name.
- [x] **`Navii.build({ body, eyes, mouth, ... })` builder API** — direct construction without a seed. For brand mascots, logo marks, designer curation.
- [x] **`Navii` namespace** — `Navii.{ create, render, select, group, seed, build }` for users who like the dotted style.
- [x] **`<NaviiGroup>` / `renderGroup`** — horizontal stacks with overlap + `+N` counter tile.
- [ ] **Avatar builder UI** at `/build` — interactive customizer over `Navii.build()`. Lets users mix-and-match in the browser, copy the resulting URL or `<Navii build={…} />` snippet. v2 differentiator.
- [ ] Lazy WebP fallback alongside PNG for smaller bytes (esp. mobile)
- [ ] React Native binding (`@usenavii/native`) — same engine, RN-native SVG renderer
- [ ] CLI — `npx @usenavii/cli alice > a.svg`, `--build --body tall --eyes star`, `--batch users.json`. Targets: build scripts, CI, Figma imports.

## Engineering

- [x] **Snapshot tests** — 12 fixed seeds locked: spec fields, static SVG bytes, animated SVG bytes, group SVG. CI fails on drift. Intentional cast changes refresh via `vitest -u` + major bump.
- [x] **CI publish workflow** — on `v*` tag: test → docker image to GHCR → npm publish (skip if version already on registry).
- [ ] Bench: avatars/sec; aim ≥ 50K/s on M1
- [ ] Strict size budget on `@usenavii/core` (target < 8KB gzipped). Wire `size-limit` or `pkg-size` into CI as an assertion.

## Discovery / launch (you-driven, no code)

- [ ] Share — Show HN, Awesome lists, X. Packages + live demo + docs all ready.
- [ ] Submit to https://github.com/topics/avatar and similar listings.
- [ ] Demo GIF in repo README + on landing.
