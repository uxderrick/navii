# Navii Backlog

Tracked work beyond the current scaffold. Ordered by impact, not priority — pick what fits the moment.

## Combinatorial expansion (grow output space beyond 1.4M)

- [ ] **More part variants** — multiplicative. Each new eye style ≈ +16.6%, each new body ≈ +20%, each new topper ≈ +12.5%. Cheap, fast wins. _Progress: palette 16→22, accessory 4→7 (+glasses/eyepatch/mole). Body/eyes/mouth/antenna still at original counts — easy next wins._
- [x] **Continuous params** — hue rotation (±30°), body scale (0.92–1.08), eye gap shift (±2), mouth curvature (0.85×–1.15×), antenna tilt (±8°). Wired in `select.ts` + `render.ts`, covered by `continuous.test.ts`. Discrete space (3.3M) × continuous = effectively unbounded.
- [ ] **Compound accessories** — allow stacking (blush + freckles + sparkle). Currently single-pick.
- [ ] **Outfit slot** — collar / scarf / bowtie. New part layer below face, anchored to body.

## Art polish (designer-needed, flagged for handoff)

- [ ] Hand-drawn silhouette paths replacing current passable ones
- [ ] Refined eye/mouth shapes at illustrator quality
- [ ] Color story — palette pairings curated for harmony, not just hue spread
- [ ] Per-body face-feature offsets fine-tuned by eye (anchor table currently sketch quality)

## Distribution

- [ ] Publish `@navii/core` + `@navii/react` to npm. Add tsup for dual ESM/CJS.
- [ ] Tag v0.1.0
- [ ] Cloudflare Worker deploy of `@navii/api` (swap `@resvg/resvg-js` → `@resvg/resvg-wasm`)
- [ ] Public CDN at `navii.dev/avatar/<seed>`

## Product

- [ ] Demo site + docs — hero gallery, live seed input, copy-paste install
- [ ] **Seed uniqueness guidance** — must land in README, demo site docs, AND hosted `/api` documentation. Cover everywhere a dev meets Navii. Key points:
  - Seed must be a **stable unique identifier** per user (e.g. `user.id`, UUID, email). NOT display name — names collide → duplicate avatars.
  - Determinism is the contract: same seed always = same avatar. So **do not pass `Date.now()` at render time** — avatar would change on every refresh.
  - If only a name exists, recommend composing with a stable created-at: `seed = \`${name}-${user.createdAt}\``. Bake uniqueness in at signup, not at render.
  - Same rule applies to hosted endpoint `/avatar/:seed`.
  - Add JSDoc on `createAvatar(seed)` echoing this.
  - Follow-up task once docs land: ship `Navii.seed({ id?, email?, name?, createdAt? })` helper that picks the most unique field and hashes a composite — guides callers into pit of success.
- [x] `<NaviiGroup seeds={[...]} max={5} />` overlap stack with +N tile — `renderGroup` + `GroupOptions` exported from `@navii/core`, covered by `group.test.ts`.
- [ ] Lazy WebP fallback alongside PNG for smaller bytes
- [ ] React Native binding (`@navii/native`) — same engine, native SVG renderer
- [ ] CLI: `npx navii alice` → writes SVG to stdout

## Engineering

- [ ] Snapshot test of N seeds — guard against unintended part-pick drift
- [ ] Bench: avatars/sec; aim ≥ 50K/s on M1
- [ ] Strict size budget on `@navii/core` (target < 8KB gzipped)
- [ ] Builder API — programmatic mix-and-match without seed: `Navii.build({body:'tall', eyes:'star'})`
- [ ] `Navii.seed({ id?, email?, name?, createdAt? })` helper — composes most-unique-available field(s), hashes to stable seed string. Ships after uniqueness guidance doc lands so callers already understand why.
