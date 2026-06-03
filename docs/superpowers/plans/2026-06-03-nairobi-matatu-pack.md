# Nairobi Matatu Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the premium `nairobi-matatu` pack to Navii Core and expose a local `/nairobi-packs` preview route before treating the Figma plugin visuals as final.

**Architecture:** Core remains the source of truth for pack metadata, palettes, part ids, anchors, and SVG render branches. The local API preview route renders directly from Core without Pro auth, matching the Accra/Lagos review pattern. The Figma plugin automatically reads the pack from Core after rebuild, with source copy updated from 9 to 10 packs.

**Tech Stack:** TypeScript, Vitest, tsup, Hono API, Figma plugin esbuild bundle.

---

## File Structure

- Create `packages/core/src/packs/nairobi-matatu.ts`: pack metadata, five palettes, picks, style hints.
- Modify `packages/core/src/packs/index.ts`: import/register `nairobiMatatuPack`.
- Modify `packages/core/src/types.ts`: add Nairobi body/topper/accessory/outfit ids.
- Modify `packages/core/src/parts/anchor.ts`: add anchors for Nairobi body ids.
- Modify `packages/core/src/parts/body.ts`: add Nairobi body SVG paths.
- Modify `packages/core/src/parts/topper.ts`: render `neonRouteBand`, `shukaGridBand`, `stickerCap`.
- Modify `packages/core/src/parts/accessory.ts`: render `brightGlasses`, `kenyaPin`, `matatuMark`.
- Modify `packages/core/src/parts/outfit.ts`: render `shukaCheckCollar`, `neonTrimCollar`, `routeStripeNecklace`.
- Modify `packages/core/test/packs.test.ts`: add Nairobi registry, palette, deterministic, dark-palette visibility tests.
- Modify `packages/api/src/app.ts`: add `/nairobi-packs` local visual review page.
- Modify `packages/figma-plugin/src/ui.html`: update pack copy from 9 packs / 85 palettes to 10 packs / 90 palettes.

---

### Task 1: Core Tests For Nairobi Matatu

**Files:**
- Modify: `packages/core/test/packs.test.ts`

- [ ] **Step 1: Add Nairobi to built-in registry expectation**

Update the built-in ids expectation:

```ts
expect(ids).toEqual([
  'accra-gallery',
  'earth', 'halloween', 'lagos-danfo', 'mono', 'nairobi-matatu', 'neon',
  'office', 'office-bright', 'pastel',
]);
```

- [ ] **Step 2: Add Nairobi palette and behavior tests**

Add these tests after the Lagos Danfo tests:

```ts
it('nairobi matatu pack contributes 5 namespaced palettes', () => {
  const pack = PACK_REGISTRY['nairobi-matatu']!;
  const paletteIds = pack.palettes!.map((p) => p.id);
  expect(pack).toBeDefined();
  expect(pack.name).toBe('Nairobi Matatu');
  expect(pack.description).toContain('matatu route graphics');
  expect(pack.palettes).toBeDefined();
  expect(pack.palettes!.length).toBe(5);
  expect(paletteIds).toEqual([
    'nairobi-matatu:night-green',
    'nairobi-matatu:route-red',
    'nairobi-matatu:electric-blue',
    'nairobi-matatu:shuka-check',
    'nairobi-matatu:safari-neon',
  ]);
  expect(pack.palettes![0]).toMatchObject({
    bodyFrom: '#101820',
    bodyTo: '#12D977',
    accent: '#F8F7EF',
    ink: '#F8F7EF',
  });
  expect(pack.palettes!.find((p) => p.id === 'nairobi-matatu:night-green')).toMatchObject({
    bodyFrom: '#101820',
    ink: '#F8F7EF',
  });
  for (const p of pack.palettes!) {
    expect(p.id.startsWith('nairobi-matatu:'), `palette id "${p.id}" must be namespaced`).toBe(true);
  }
  expect(pack.paletteExclusive).toBe(true);
  expect(pack.flat).toBe(true);
});

it('nairobi matatu changes output while remaining deterministic', () => {
  const base = createAvatar('nairobi-founder');
  const first = createAvatar('nairobi-founder', { packs: ['nairobi-matatu'] });
  const second = createAvatar('nairobi-founder', { packs: ['nairobi-matatu'] });
  expect(first).not.toBe(base);
  expect(first).toBe(second);
  expect(first).toContain('#101820');
});

it('nairobi matatu dark palette keeps neon and light details visible', () => {
  const svg = createAvatar('matatu-night', {
    packs: ['nairobi-matatu'],
    paletteId: 'nairobi-matatu:night-green',
  });
  expect(svg).toBe(createAvatar('matatu-night', {
    packs: ['nairobi-matatu'],
    paletteId: 'nairobi-matatu:night-green',
  }));
  expect(svg).toContain('#101820');
  expect(svg).toContain('#F8F7EF');
  expect(svg).toContain('#12D977');
  expect(svg).toContain('#FF2D55');
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
```

Expected: FAIL because `nairobi-matatu` is not registered.

- [ ] **Step 4: Commit failing tests**

```bash
git add packages/core/test/packs.test.ts
git commit -m "test: define nairobi matatu pack behavior"
```

---

### Task 2: Core Pack Registry And Types

**Files:**
- Create: `packages/core/src/packs/nairobi-matatu.ts`
- Modify: `packages/core/src/packs/index.ts`
- Modify: `packages/core/src/types.ts`

- [ ] **Step 1: Create Nairobi pack file**

Create `packages/core/src/packs/nairobi-matatu.ts`:

```ts
import type { Pack } from './types.js';
import type { Palette } from '../types.js';

const palettes: Palette[] = [
  { id: 'nairobi-matatu:night-green', bodyFrom: '#101820', bodyTo: '#12D977', accent: '#F8F7EF', ink: '#F8F7EF', blush: '#FF2D55' },
  { id: 'nairobi-matatu:route-red', bodyFrom: '#C1121F', bodyTo: '#101820', accent: '#2F80ED', ink: '#F8F7EF', blush: '#FFD23F' },
  { id: 'nairobi-matatu:electric-blue', bodyFrom: '#2F80ED', bodyTo: '#101820', accent: '#FFD23F', ink: '#F8F7EF', blush: '#12D977' },
  { id: 'nairobi-matatu:shuka-check', bodyFrom: '#D72638', bodyTo: '#101820', accent: '#F8F7EF', ink: '#F8F7EF', blush: '#2F80ED' },
  { id: 'nairobi-matatu:safari-neon', bodyFrom: '#F2E8CF', bodyTo: '#0B6E4F', accent: '#FF2D55', ink: '#101820', blush: '#FFD23F' },
];

export const nairobiMatatuPack: Pack = {
  id: 'nairobi-matatu',
  name: 'Nairobi Matatu',
  description: 'Nairobi-inspired avatars with matatu route graphics, dark plates, neon color, and restrained shuka-grid accents.',
  emoji: '▣',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#101820',
  featureStroke: 1.28,
  picks: {
    body: ['matatuBadge', 'routeSticker', 'cityPlaque', 'angledSignTile'],
    eyes: ['round', 'oval', 'wide', 'dot', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'brightGlasses', 'routeDot', 'kenyaPin', 'matatuMark'],
    topper: ['neonRouteBand', 'shukaGridBand', 'stickerCap'],
    background: ['solid'],
    outfit: ['shukaCheckCollar', 'neonTrimCollar', 'routeStripeNecklace'],
  },
  styleHints: {
    masc: {
      outfit: ['neonTrimCollar', 'shukaCheckCollar'],
      accessory: ['none', 'routeDot', 'matatuMark'],
      topper: ['neonRouteBand', 'stickerCap'],
    },
    femme: {
      outfit: ['shukaCheckCollar', 'routeStripeNecklace'],
      accessory: ['brightGlasses', 'kenyaPin'],
      topper: ['shukaGridBand', 'stickerCap'],
    },
    neutral: {
      outfit: ['shukaCheckCollar', 'neonTrimCollar'],
      accessory: ['none', 'brightGlasses', 'kenyaPin'],
      topper: ['neonRouteBand', 'shukaGridBand'],
    },
  },
};
```

- [ ] **Step 2: Register pack**

In `packages/core/src/packs/index.ts`, add:

```ts
import { nairobiMatatuPack } from './nairobi-matatu.js';
```

Place it after `lagosDanfoPack`:

```ts
export const BUILT_IN_PACKS: Pack[] = [
  accraGalleryPack,
  lagosDanfoPack,
  nairobiMatatuPack,
  officePack,
  officeBrightPack,
  halloweenPack,
  pastelPack,
  neonPack,
  monoPack,
  earthPack,
];
```

- [ ] **Step 3: Add part ids**

In `packages/core/src/types.ts`, extend unions:

```ts
  // Nairobi Matatu pack-only bodies
  | 'matatuBadge' | 'routeSticker' | 'cityPlaque' | 'angledSignTile';
```

```ts
  // Nairobi Matatu pack-only accessories
  | 'brightGlasses' | 'kenyaPin' | 'matatuMark';
```

```ts
  // Nairobi Matatu pack-only toppers
  | 'neonRouteBand' | 'shukaGridBand' | 'stickerCap';
```

```ts
  // Nairobi Matatu pack-only outfits
  | 'shukaCheckCollar' | 'neonTrimCollar' | 'routeStripeNecklace';
```

- [ ] **Step 4: Run tests to verify renderer failures remain**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
```

Expected: FAIL because anchors/render cases are missing.

- [ ] **Step 5: Commit registry and types**

```bash
git add packages/core/src/packs/nairobi-matatu.ts packages/core/src/packs/index.ts packages/core/src/types.ts
git commit -m "feat: register nairobi matatu pack"
```

---

### Task 3: Nairobi Bodies And Anchors

**Files:**
- Modify: `packages/core/src/parts/body.ts`
- Modify: `packages/core/src/parts/anchor.ts`

- [ ] **Step 1: Add body paths**

In `BODY_PATHS`, add:

```ts
  matatuBadge: 'M18 18 L82 18 C86 18 89 22 89 28 L86 76 C85 84 76 89 50 91 C24 89 15 84 14 76 L11 28 C11 22 14 18 18 18 Z',
  routeSticker: 'M17 22 L79 14 C84 13 88 17 88 22 L84 73 C83 80 78 85 71 86 L21 91 C15 91 11 86 12 80 L16 29 C16 25 14 23 17 22 Z',
  cityPlaque: 'M22 16 L78 16 C83 16 86 19 86 24 L86 78 C86 84 80 88 50 90 C20 88 14 84 14 78 L14 24 C14 19 17 16 22 16 Z',
  angledSignTile: 'M28 14 L82 22 C86 23 88 27 87 32 L79 78 C78 84 72 88 50 90 C28 88 18 82 16 75 L13 29 C12 23 18 16 28 14 Z',
```

- [ ] **Step 2: Add anchors**

In `ANCHORS`, add:

```ts
  matatuBadge: {
    cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 8,
    topperX: 50, topperY: 18,
    groundY: 91,
    cheekY: 56, cheekOffset: 22,
  },
  routeSticker: {
    cx: 50, eyeY: 48, eyeOffset: 11, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 8,
    topperX: 50, topperY: 17,
    groundY: 91,
    cheekY: 56, cheekOffset: 21,
  },
  cityPlaque: {
    cx: 50, eyeY: 49, eyeOffset: 12, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 8,
    topperX: 50, topperY: 16,
    groundY: 90,
    cheekY: 56, cheekOffset: 22,
  },
  angledSignTile: {
    cx: 50, eyeY: 49, eyeOffset: 11, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 7,
    topperX: 50, topperY: 15,
    groundY: 90,
    cheekY: 56, cheekOffset: 20,
  },
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm --filter @usenavii/core run typecheck
```

Expected: FAIL only for missing switch cases, or PASS if switch exhaustiveness is not enforced.

- [ ] **Step 4: Commit body support**

```bash
git add packages/core/src/parts/body.ts packages/core/src/parts/anchor.ts
git commit -m "feat: add nairobi matatu body shapes"
```

---

### Task 4: Nairobi Toppers, Accessories, And Outfits

**Files:**
- Modify: `packages/core/src/parts/topper.ts`
- Modify: `packages/core/src/parts/accessory.ts`
- Modify: `packages/core/src/parts/outfit.ts`

- [ ] **Step 1: Add topper cases**

In `renderTopper`, add:

```ts
    case 'neonRouteBand':
      return [
        `<path d="M${cx - 21} ${topY + 8} Q${cx} ${topY + 1} ${cx + 21} ${topY + 8} L${cx + 19} ${topY + 13} Q${cx} ${topY + 7} ${cx - 19} ${topY + 13} Z" fill="#101820" stroke="${ink}" stroke-width="0.6" />`,
        `<path d="M${cx - 16} ${topY + 9} L${cx + 16} ${topY + 7}" stroke="#12D977" stroke-width="2.4" stroke-linecap="round" />`,
        `<path d="M${cx - 12} ${topY + 12} L${cx + 12} ${topY + 10}" stroke="#FFD23F" stroke-width="1.5" stroke-linecap="round" />`,
        `<rect x="${cx - 3}" y="${topY + 5}" width="6" height="5" rx="1" fill="#FF2D55" opacity="0.95" />`,
      ].join('');

    case 'shukaGridBand':
      return [
        `<path d="M${cx - 20} ${topY + 8} Q${cx} ${topY + 3} ${cx + 20} ${topY + 8} L${cx + 20} ${topY + 13} Q${cx} ${topY + 8} ${cx - 20} ${topY + 13} Z" fill="#D72638" stroke="${ink}" stroke-width="0.55" />`,
        `<rect x="${cx - 15}" y="${topY + 8}" width="30" height="1.7" fill="#101820" opacity="0.96" />`,
        `<rect x="${cx - 15}" y="${topY + 11.5}" width="30" height="1.5" fill="#F8F7EF" opacity="0.96" />`,
        `<rect x="${cx - 6}" y="${topY + 6.5}" width="2" height="7" fill="#2F80ED" opacity="0.9" />`,
        `<rect x="${cx + 5}" y="${topY + 6.5}" width="2" height="7" fill="#101820" opacity="0.9" />`,
      ].join('');

    case 'stickerCap':
      return [
        `<path d="M${cx - 16} ${topY + 6} L${cx + 11} ${topY - 6} C${cx + 16} ${topY - 4} ${cx + 19} ${topY + 1} ${cx + 17} ${topY + 6} Z" fill="#2F80ED" stroke="${ink}" stroke-width="0.6" />`,
        `<path d="M${cx - 13} ${topY + 5} L${cx + 14} ${topY + 5}" stroke="#FFD23F" stroke-width="2.4" stroke-linecap="round" />`,
        `<circle cx="${cx + 7}" cy="${topY - 1}" r="2.2" fill="#12D977" stroke="${ink}" stroke-width="0.4" />`,
      ].join('');
```

- [ ] **Step 2: Add accessory cases**

In `renderAccessory`, add:

```ts
    case 'brightGlasses': {
      const lx = anchor.cx - anchor.eyeOffset;
      const rx = anchor.cx + anchor.eyeOffset;
      const y = anchor.eyeY;
      const r = 6;
      const gw = 1.35 * sw;
      return [
        `<circle cx="${lx}" cy="${y}" r="${r}" fill="none" stroke="#12D977" stroke-width="${gw}" />`,
        `<circle cx="${rx}" cy="${y}" r="${r}" fill="none" stroke="#FFD23F" stroke-width="${gw}" />`,
        `<line x1="${lx + r}" y1="${y}" x2="${rx - r}" y2="${y}" stroke="#FF2D55" stroke-width="${gw}" />`,
        `<circle cx="${lx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
        `<circle cx="${rx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
      ].join('');
    }

    case 'kenyaPin': {
      const x = anchor.cx + 13;
      const y = anchor.cheekY + 10;
      return [
        `<circle cx="${x}" cy="${y}" r="${3.3 * sw}" fill="#101820" stroke="${palette.ink}" stroke-width="${0.45 * sw}" />`,
        `<rect x="${x - 2.4}" y="${y - 0.8}" width="4.8" height="1.6" fill="#F8F7EF" opacity="0.96" />`,
        `<rect x="${x - 0.8}" y="${y - 2.4}" width="1.6" height="4.8" fill="#D72638" opacity="0.96" />`,
      ].join('');
    }

    case 'matatuMark': {
      const x = anchor.cx - 13;
      const y = anchor.cheekY + 10;
      return [
        `<path d="M${x - 4} ${y + 1} L${x + 3} ${y - 4} L${x + 4} ${y + 3} Z" fill="#FFD23F" stroke="${palette.ink}" stroke-width="${0.45 * sw}" />`,
        `<circle cx="${x - 1.5}" cy="${y + 2.6}" r="${0.9 * sw}" fill="#12D977" />`,
        `<circle cx="${x + 2.5}" cy="${y - 0.2}" r="${0.9 * sw}" fill="#FF2D55" />`,
      ].join('');
    }
```

- [ ] **Step 3: Add outfit cases**

In `renderOutfit`, add:

```ts
    case 'shukaCheckCollar':
      return [
        `<path d="M${cx - 15} ${cy - 3} Q${cx} ${cy + 5} ${cx + 15} ${cy - 3} L${cx + 12} ${cy + 5} Q${cx} ${cy + 11} ${cx - 12} ${cy + 5} Z" fill="#D72638" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 13}" y="${cy}" width="26" height="1.6" fill="#101820" opacity="0.96" />`,
        `<rect x="${cx - 13}" y="${cy + 4}" width="26" height="1.5" fill="#F8F7EF" opacity="0.96" />`,
        `<rect x="${cx - 5}" y="${cy - 1}" width="2" height="8" fill="#2F80ED" opacity="0.9" />`,
        `<rect x="${cx + 5}" y="${cy - 1}" width="2" height="8" fill="#101820" opacity="0.9" />`,
      ].join('');

    case 'neonTrimCollar':
      return [
        `<path d="M${cx - 15} ${cy - 3} Q${cx} ${cy + 5} ${cx + 15} ${cy - 3} L${cx + 12} ${cy + 5} Q${cx} ${cy + 11} ${cx - 12} ${cy + 5} Z" fill="#101820" stroke="${ink}" stroke-width="0.6" />`,
        `<path d="M${cx - 11} ${cy + 1} L${cx + 11} ${cy + 1}" stroke="#12D977" stroke-width="1.8" stroke-linecap="round" />`,
        `<path d="M${cx - 7} ${cy + 5} L${cx + 7} ${cy + 5}" stroke="#FFD23F" stroke-width="1.5" stroke-linecap="round" />`,
        `<rect x="${cx - 2}" y="${cy + 2}" width="4" height="5" fill="#FF2D55" opacity="0.95" />`,
      ].join('');

    case 'routeStripeNecklace':
      return [
        `<path d="M${cx - 11} ${cy} Q${cx} ${cy + 8} ${cx + 11} ${cy}" stroke="#2F80ED" stroke-width="1" fill="none" stroke-linecap="round" />`,
        `<rect x="${cx - 3}" y="${cy + 5}" width="6" height="5" rx="1" fill="#FFD23F" stroke="${ink}" stroke-width="0.45" />`,
        `<path d="M${cx - 2} ${cy + 7.5} L${cx + 2} ${cy + 7.5}" stroke="#101820" stroke-width="0.8" />`,
      ].join('');
```

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
pnpm --filter @usenavii/core run typecheck
```

Expected: both PASS.

- [ ] **Step 5: Commit renderers**

```bash
git add packages/core/src/parts/topper.ts packages/core/src/parts/accessory.ts packages/core/src/parts/outfit.ts
git commit -m "feat: render nairobi matatu pack parts"
```

---

### Task 5: Local `/nairobi-packs` Preview Route

**Files:**
- Modify: `packages/api/src/app.ts`

- [ ] **Step 1: Add route**

Near the existing `/accra-packs` and `/lagos-packs` routes, add:

```ts
  app.get('/nairobi-packs', (c) => {
    const count = clampInt(c.req.query('count'), 12, 240, 72);
    const size = clampInt(c.req.query('size'), 48, 180, 96);
    const animated = c.req.query('animated') === '1' || c.req.query('animated') === 'true';
    return c.html(renderNairobiPacksDemo(count, size, animated));
  });
```

- [ ] **Step 2: Add renderer function**

Add a `renderNairobiPacksDemo()` function near the Accra/Lagos demo functions. It should:

```ts
const palettes = [
  'nairobi-matatu:night-green',
  'nairobi-matatu:route-red',
  'nairobi-matatu:electric-blue',
  'nairobi-matatu:shuka-check',
  'nairobi-matatu:safari-neon',
];
```

For each tile, call:

```ts
const svg = createAvatar(seed, {
  size,
  packs: ['nairobi-matatu'],
  paletteId,
  ...(style ? { style } : {}),
  ...(mood !== 'neutral' ? { mood } : {}),
  animated,
});
```

Use the same grid layout pattern as `renderLagosPacksDemo`, but set:

```css
--canvas: #101820;
--ink: #f8f7ef;
--green: #12d977;
--red: #ff2d55;
--blue: #2f80ed;
--yellow: #ffd23f;
```

- [ ] **Step 3: Run API typecheck**

Run:

```bash
pnpm --filter @usenavii/api run typecheck
```

Expected: PASS.

- [ ] **Step 4: Verify local route**

With the dev server running, run:

```bash
curl -sI http://localhost:8787/nairobi-packs
```

Expected: `HTTP/1.1 200 OK`.

This route is for local review and can remain uncommitted if demo routes are not intended to ship.

---

### Task 6: Plugin Copy And Bundle Verification

**Files:**
- Modify: `packages/figma-plugin/src/ui.html`

- [ ] **Step 1: Update Pro copy**

In `packages/figma-plugin/src/ui.html`, update the Pro copy:

```html
<div class="upgrade-feat-desc">10 themed bundles today (Accra Gallery, Lagos Danfo, Nairobi Matatu, Office, Halloween, Pastel, Neon, Mono, Earth, Office Bright). Buy once — every new pack lands in your library.</div>
```

```html
<li><strong>+10 themed packs today</strong>, plus every future pack — Accra Gallery, Lagos Danfo, Nairobi Matatu, Office, Halloween, Pastel, Neon, Mono, Earth, Office Bright (90 palettes total)</li>
```

- [ ] **Step 2: Build and verify**

Run:

```bash
pnpm --filter @usenavii/core run build
pnpm --filter @usenavii/figma-plugin run typecheck
pnpm --filter @usenavii/figma-plugin run build
rg -n "Nairobi Matatu|nairobi-matatu|10 themed|90 palettes" packages/figma-plugin/src/ui.html packages/figma-plugin/dist/ui.html packages/figma-plugin/dist/ui.js
```

Expected: all commands PASS and grep finds Nairobi in source and dist.

- [ ] **Step 3: Commit plugin source copy**

```bash
git add packages/figma-plugin/src/ui.html
git commit -m "feat(figma): include nairobi matatu in pack copy"
```

---

### Task 7: Final Verification

**Files:**
- No additional source files expected.

- [ ] **Step 1: Run targeted verification**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
pnpm --filter @usenavii/core run typecheck
pnpm --filter @usenavii/core run build
pnpm --filter @usenavii/api run typecheck
pnpm --filter @usenavii/figma-plugin run typecheck
pnpm --filter @usenavii/figma-plugin run build
```

Expected: all commands PASS.

- [ ] **Step 2: Run direct visibility sample**

Run:

```bash
node --input-type=module -e "import { createAvatar } from './packages/core/dist/index.js'; const svg = createAvatar('matatu-night', { size: 96, packs: ['nairobi-matatu'], paletteId: 'nairobi-matatu:night-green' }); console.log(JSON.stringify({ hasBlack: svg.includes('#101820'), hasLightInk: svg.includes('#F8F7EF'), hasGreen: svg.includes('#12D977'), hasRed: svg.includes('#FF2D55') }));"
```

Expected:

```json
{"hasBlack":true,"hasLightInk":true,"hasGreen":true,"hasRed":true}
```

- [ ] **Step 3: Review final status**

Run:

```bash
git status --short
git diff --stat
```

Expected: committed Nairobi source changes plus uncommitted preview route if intentionally kept local-only.
