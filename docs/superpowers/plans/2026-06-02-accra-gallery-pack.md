# Accra Gallery Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `Accra Gallery` Ghana-inspired identity pack as a built-in Navii pack used by the Figma plugin.

**Architecture:** Implement Accra Gallery through the existing core pack system: a new `packages/core/src/packs/accra-gallery.ts` file, registry import/export changes, type additions for pack-only parts, and focused renderer additions for the pack’s distinctive identity elements. The Figma plugin already renders `BUILT_IN_PACKS`, so once core exposes the pack, the Packs tab should pick it up after rebuild.

**Tech Stack:** TypeScript, `@usenavii/core`, Vitest, Figma plugin bundle via `packages/figma-plugin/scripts/build.mjs`.

---

## Palette Correction

After implementation review, the approved Accra Gallery swatch strip was
clarified as near-black, warm gold, brick red, deep green, and bright gold.
Warm ivory remains the gallery/card surface (`bgColor`), not an avatar body
palette. The final pack implementation should use:

```ts
const palettes: Palette[] = [
  { id: 'accra-gallery:gallery-gold', bodyFrom: '#F3CF4E', bodyTo: '#B12F28', accent: '#111827', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:green-gold',   bodyFrom: '#2F6A3E', bodyTo: '#F3CF4E', accent: '#111827', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:red-black',    bodyFrom: '#812723', bodyTo: '#111827', accent: '#F3CF4E', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:black-gold',   bodyFrom: '#111827', bodyTo: '#F3CF4E', accent: '#B12F28', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:woven-gold',   bodyFrom: '#F8D04A', bodyTo: '#2F6A3E', accent: '#B12F28', ink: '#111827', blush: '#B12F28' },
];
```

---

## File Structure

- Create `packages/core/src/packs/accra-gallery.ts`: pack metadata, palettes, picks, style hints, and render flags.
- Modify `packages/core/src/packs/index.ts`: import `accraGalleryPack`, add it to `BUILT_IN_PACKS`.
- Modify `packages/core/src/types.ts`: add pack-only part ids for Accra Gallery.
- Modify `packages/core/src/parts/index.ts`: keep new part ids pack-only, not in the base seed pools.
- Modify `packages/core/src/parts/body.ts`: render new Accra Gallery body silhouettes.
- Modify `packages/core/src/parts/topper.ts`: render restrained textile/geometric toppers.
- Modify `packages/core/src/parts/accessory.ts`: render gold hoop and black star pin accessories.
- Modify `packages/core/src/parts/outfit.ts`: render a patterned collar outfit.
- Modify `packages/core/test/packs.test.ts`: registry, palette, determinism, and output-difference coverage.
- Optionally modify docs/changelog after visual verification if the release branch needs user-facing notes.

---

### Task 1: Add Failing Registry And Determinism Tests

**Files:**
- Modify: `packages/core/test/packs.test.ts`

- [ ] **Step 1: Update the built-in registry expectation**

Replace the launch-pack id expectation with:

```ts
expect(ids).toEqual([
  'accra-gallery', 'earth', 'halloween', 'mono',
  'neon', 'office', 'office-bright', 'pastel',
]);
```

- [ ] **Step 2: Add Accra Gallery-specific tests**

Append these tests inside the existing `describe('packs — scaffold', () => { ... })` block:

```ts
it('accra gallery pack contributes 5 namespaced palettes', () => {
  const pack = PACK_REGISTRY['accra-gallery']!;
  expect(pack).toBeDefined();
  expect(pack.name).toBe('Accra Gallery');
  expect(pack.palettes).toBeDefined();
  expect(pack.palettes!.length).toBe(5);
  for (const p of pack.palettes!) {
    expect(p.id.startsWith('accra-gallery:'), `palette id "${p.id}" must be namespaced`).toBe(true);
  }
  expect(pack.paletteExclusive).toBe(true);
  expect(pack.flat).toBe(true);
});

it('accra gallery changes output while remaining deterministic', () => {
  const base = createAvatar('ama');
  const first = createAvatar('ama', { packs: ['accra-gallery'] });
  const second = createAvatar('ama', { packs: ['accra-gallery'] });
  expect(first).not.toBe(base);
  expect(first).toBe(second);
});

it('accra gallery paletteId can target a pack palette explicitly', () => {
  const svg = createAvatar('kwame', {
    packs: ['accra-gallery'],
    paletteId: 'accra-gallery:gallery-gold',
  });
  expect(svg).toBe(createAvatar('kwame', {
    packs: ['accra-gallery'],
    paletteId: 'accra-gallery:gallery-gold',
  }));
  expect(svg).toContain('#F6EEDC');
});
```

- [ ] **Step 3: Run the focused test and verify failure**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run packages/core/test/packs.test.ts
```

Expected: FAIL because `accra-gallery` is not in `BUILT_IN_PACKS` and `PACK_REGISTRY['accra-gallery']` is undefined.

- [ ] **Step 4: Commit the failing tests**

```bash
git add packages/core/test/packs.test.ts
git commit -m "test: define accra gallery pack behavior"
```

---

### Task 2: Add The Accra Gallery Pack Definition

**Files:**
- Create: `packages/core/src/packs/accra-gallery.ts`
- Modify: `packages/core/src/packs/index.ts`

- [ ] **Step 1: Create the pack file**

Create `packages/core/src/packs/accra-gallery.ts`:

```ts
import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Accra Gallery — contemporary Ghana-inspired avatar identity system.
 *
 * Visual rules:
 * - Warm ivory gallery surfaces
 * - Gold, red, green, and black accents
 * - Kente-inspired geometry as restrained bands/collars/toppers
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'accra-gallery:gallery-gold', bodyFrom: '#D8A928', bodyTo: '#B88716', accent: '#F6EEDC', ink: '#1D1710', blush: '#D97058' },
  { id: 'accra-gallery:ivory-red',    bodyFrom: '#F6EEDC', bodyTo: '#B93A32', accent: '#D8A928', ink: '#201813', blush: '#D97058' },
  { id: 'accra-gallery:green-gold',   bodyFrom: '#1F6B45', bodyTo: '#12442E', accent: '#D8A928', ink: '#171A13', blush: '#E2A08A' },
  { id: 'accra-gallery:black-star',   bodyFrom: '#F3DEC2', bodyTo: '#D8A928', accent: '#111111', ink: '#111111', blush: '#C75B4D' },
  { id: 'accra-gallery:woven-warm',   bodyFrom: '#C9852A', bodyTo: '#7D2D24', accent: '#1F6B45', ink: '#1C130E', blush: '#D98B70' },
];

export const accraGalleryPack: Pack = {
  id: 'accra-gallery',
  name: 'Accra Gallery',
  description: 'Contemporary Ghana-inspired avatars with refined textile geometry, warm ivory, gold, red, green, and black accents.',
  emoji: '✦',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#F6EEDC',
  featureStroke: 1.18,
  picks: {
    body: ['galleryPlaque', 'softShield', 'wovenTile', 'medallion'],
    eyes: ['round', 'oval', 'dot', 'wide', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'glasses', 'goldHoop', 'blackStarPin'],
    topper: ['none', 'textileBand', 'geometricCap', 'galleryWrap'],
    background: ['solid'],
    outfit: ['none', 'patternedCollar', 'necklace'],
  },
  styleHints: {
    masc: {
      outfit: ['none', 'patternedCollar'],
      accessory: ['none', 'glasses', 'blackStarPin'],
      topper: ['none', 'geometricCap', 'textileBand'],
    },
    femme: {
      outfit: ['none', 'patternedCollar', 'necklace'],
      accessory: ['none', 'goldHoop', 'glasses'],
      topper: ['none', 'galleryWrap', 'textileBand'],
    },
    neutral: {
      outfit: ['none', 'patternedCollar'],
      accessory: ['none', 'glasses', 'blackStarPin'],
      topper: ['none', 'textileBand'],
    },
  },
};
```

- [ ] **Step 2: Register the pack**

Modify `packages/core/src/packs/index.ts`:

```ts
import { accraGalleryPack } from './accra-gallery.js';
```

Add it first in `BUILT_IN_PACKS` so it appears prominently in the Figma plugin:

```ts
export const BUILT_IN_PACKS: Pack[] = [
  accraGalleryPack,
  officePack,
  officeBrightPack,
  halloweenPack,
  pastelPack,
  neonPack,
  monoPack,
  earthPack,
];
```

- [ ] **Step 3: Run typecheck and verify type failures**

Run:

```bash
pnpm --filter @usenavii/core run typecheck
```

Expected: FAIL because `galleryPlaque`, `softShield`, `wovenTile`, `medallion`, `goldHoop`, `blackStarPin`, `textileBand`, `geometricCap`, `galleryWrap`, and `patternedCollar` are not in the part-id union types yet.

- [ ] **Step 4: Commit the pack definition**

```bash
git add packages/core/src/packs/accra-gallery.ts packages/core/src/packs/index.ts
git commit -m "feat: add accra gallery pack definition"
```

---

### Task 3: Add Pack-Only Part Types And Renderers

**Files:**
- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/parts/body.ts`
- Modify: `packages/core/src/parts/topper.ts`
- Modify: `packages/core/src/parts/accessory.ts`
- Modify: `packages/core/src/parts/outfit.ts`

- [ ] **Step 1: Extend part-id union types**

Modify `packages/core/src/types.ts`:

```ts
export type BodyShapeId =
  | 'orb' | 'tall' | 'squat' | 'pear' | 'pebble'
  | 'dumpling' | 'taro' | 'wisp' | 'squircle'
  // Halloween pack-only bodies (kept out of base BODY_IDS to preserve seeds)
  | 'pumpkin' | 'ghost' | 'skullHead'
  // Accra Gallery pack-only bodies
  | 'galleryPlaque' | 'softShield' | 'wovenTile' | 'medallion';
```

```ts
export type AccessoryId =
  | 'none' | 'blush' | 'freckles' | 'sparkle'
  | 'glasses' | 'eyepatch' | 'mole' | 'earring'
  // Accra Gallery pack-only accessories
  | 'goldHoop' | 'blackStarPin';
```

```ts
export type TopperId =
  | 'none' | 'ears' | 'roundEars' | 'horn' | 'horns' | 'tuft' | 'cap' | 'leaf'
  | 'headband' | 'halo' | 'crown' | 'antlers'
  | 'bob' | 'bun' | 'ponytail'
  // Halloween pack-only toppers
  | 'witchHat' | 'pumpkinStem' | 'ghostSheet'
  // Accra Gallery pack-only toppers
  | 'textileBand' | 'geometricCap' | 'galleryWrap';
```

```ts
export type OutfitId =
  | 'none' | 'collar' | 'scarf' | 'bowtie' | 'sunflower' | 'necklace' | 'tie'
  // Accra Gallery pack-only outfits
  | 'patternedCollar';
```

Do not add these ids to `BODY_IDS`, `ACCESSORY_IDS`, `TOPPER_IDS`, or `OUTFIT_IDS`; they are pack-only so base seeds do not shift.

- [ ] **Step 2: Add body paths**

In `packages/core/src/parts/body.ts`, add these entries to `BODY_PATHS`:

```ts
  galleryPlaque: 'M50 16 C68 16 78 29 78 48 L78 80 C78 87 71 91 50 91 C29 91 22 87 22 80 L22 48 C22 29 32 16 50 16 Z',
  softShield: 'M50 15 C67 18 80 30 80 49 C80 70 67 84 50 91 C33 84 20 70 20 49 C20 30 33 18 50 15 Z',
  wovenTile: 'M20 18 L80 18 C83 18 86 21 86 24 L86 76 C86 83 80 88 50 91 C20 88 14 83 14 76 L14 24 C14 21 17 18 20 18 Z',
  medallion: 'M50 14 C68 14 82 28 82 48 C82 70 68 88 50 88 C32 88 18 70 18 48 C18 28 32 14 50 14 Z',
```

- [ ] **Step 3: Add topper render cases**

In `packages/core/src/parts/topper.ts`, add cases before the Halloween-specific cases:

```ts
    case 'textileBand':
      return [
        `<path d="M${cx - 20} ${topY + 9} Q${cx} ${topY + 3} ${cx + 20} ${topY + 9} L${cx + 20} ${topY + 13} Q${cx} ${topY + 7} ${cx - 20} ${topY + 13} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.55" />`,
        `<rect x="${cx - 13}" y="${topY + 7.5}" width="5" height="4" fill="${palette.bodyTo}" opacity="0.9" />`,
        `<rect x="${cx - 4}" y="${topY + 6.5}" width="5" height="4.5" fill="${palette.ink}" opacity="0.92" />`,
        `<rect x="${cx + 5}" y="${topY + 7.5}" width="5" height="4" fill="${palette.bodyFrom}" opacity="0.9" />`,
      ].join('');

    case 'geometricCap':
      return [
        `<path d="M${cx - 15} ${topY + 7} L${cx - 8} ${topY - 6} L${cx + 8} ${topY - 6} L${cx + 15} ${topY + 7} Z" fill="${palette.ink}" opacity="0.94" />`,
        `<path d="M${cx - 12} ${topY + 5} L${cx - 5} ${topY - 3} L${cx} ${topY + 5} Z" fill="${palette.accent}" opacity="0.9" />`,
        `<path d="M${cx + 12} ${topY + 5} L${cx + 5} ${topY - 3} L${cx} ${topY + 5} Z" fill="${palette.bodyFrom}" opacity="0.9" />`,
      ].join('');

    case 'galleryWrap':
      return [
        `<path d="M${cx - 18} ${topY + 8} Q${cx - 14} ${topY - 6} ${cx + 2} ${topY - 8} Q${cx + 17} ${topY - 5} ${cx + 19} ${topY + 9} Q${cx + 8} ${topY + 4} ${cx - 18} ${topY + 8} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.55" />`,
        `<path d="M${cx - 6} ${topY - 5} Q${cx + 2} ${topY + 1} ${cx + 16} ${topY + 5}" stroke="${palette.ink}" stroke-width="0.7" opacity="0.35" fill="none" />`,
      ].join('');
```

- [ ] **Step 4: Add accessory render cases**

In `packages/core/src/parts/accessory.ts`, add cases before the final closing switch:

```ts
    case 'goldHoop': {
      const ex = anchor.cheekOffset + 4;
      const ey = anchor.cheekY + 4;
      return [
        `<circle cx="${anchor.cx - ex}" cy="${ey}" r="${2.4 * sw}" fill="none" stroke="${palette.accent}" stroke-width="${0.9 * sw}" />`,
        `<circle cx="${anchor.cx + ex}" cy="${ey}" r="${2.4 * sw}" fill="none" stroke="${palette.accent}" stroke-width="${0.9 * sw}" />`,
      ].join('');
    }

    case 'blackStarPin': {
      const x = anchor.cx + 13;
      const y = anchor.cheekY + 11;
      return `<path d="M${x} ${y - 3.6} L${x + 1.1} ${y - 1.1} L${x + 3.8} ${y - 1.1} L${x + 1.6} ${y + 0.6} L${x + 2.4} ${y + 3.2} L${x} ${y + 1.6} L${x - 2.4} ${y + 3.2} L${x - 1.6} ${y + 0.6} L${x - 3.8} ${y - 1.1} L${x - 1.1} ${y - 1.1} Z" fill="${palette.ink}" opacity="0.88" />`;
    }
```

- [ ] **Step 5: Add patterned collar outfit**

In `packages/core/src/parts/outfit.ts`, add this case before the end of the switch:

```ts
    case 'patternedCollar':
      return [
        `<path d="M${cx - 15} ${cy - 3} Q${cx} ${cy + 5} ${cx + 15} ${cy - 3} L${cx + 12} ${cy + 5} Q${cx} ${cy + 12} ${cx - 12} ${cy + 5} Z" fill="${accent}" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 10}" y="${cy + 1}" width="4" height="5" fill="${palette.bodyTo}" opacity="0.9" />`,
        `<rect x="${cx - 3}" y="${cy + 3}" width="4" height="5" fill="${palette.ink}" opacity="0.82" />`,
        `<rect x="${cx + 4}" y="${cy + 1}" width="4" height="5" fill="${palette.bodyFrom}" opacity="0.9" />`,
      ].join('');
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
pnpm --filter @usenavii/core run typecheck
```

Expected: PASS.

- [ ] **Step 7: Run focused pack tests**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run packages/core/test/packs.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit renderer support**

```bash
git add packages/core/src/types.ts packages/core/src/parts/body.ts packages/core/src/parts/topper.ts packages/core/src/parts/accessory.ts packages/core/src/parts/outfit.ts
git commit -m "feat: render accra gallery pack parts"
```

---

### Task 4: Verify Figma Plugin Integration And Visual Output

**Files:**
- Modify if needed: `packages/figma-plugin/src/ui.ts`
- Modify if needed: `packages/figma-plugin/README.md`
- Modify if needed: `CHANGELOG.md`

- [ ] **Step 1: Build core**

Run:

```bash
pnpm --filter @usenavii/core run build
```

Expected: PASS and `packages/core/dist` updates.

- [ ] **Step 2: Build the Figma plugin**

Run:

```bash
pnpm --filter @usenavii/figma-plugin run build
```

Expected: PASS. No `ui.ts` code change should be required because the plugin imports `BUILT_IN_PACKS`.

- [ ] **Step 3: Verify generated SVG contains Accra Gallery features**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run packages/core/test/packs.test.ts
```

Expected: PASS.

Then inspect a sample by temporarily using a Node/TypeScript runner or existing preview flow. The rendered SVG for:

```ts
createAvatar('ama', { packs: ['accra-gallery'], paletteId: 'accra-gallery:gallery-gold' })
```

must include the ivory color `#F6EEDC` and must differ from `createAvatar('ama')`.

- [ ] **Step 4: Update docs only if release notes are being maintained on this branch**

If `CHANGELOG.md` is already being updated for the release, add:

```md
- Added `Accra Gallery`, a premium Ghana-inspired pack with warm ivory, gold, red, green, black accents, and refined textile geometry.
```

If the release notes are being handled separately, skip this step and do not create unrelated changelog churn.

- [ ] **Step 5: Run full core verification**

Run:

```bash
pnpm --filter @usenavii/core run test
pnpm --filter @usenavii/core run typecheck
pnpm --filter @usenavii/figma-plugin run typecheck
```

Expected: all commands PASS.

- [ ] **Step 6: Commit verification/docs changes**

If Task 4 changed files:

```bash
git add packages/figma-plugin/src/ui.ts packages/figma-plugin/README.md CHANGELOG.md
git commit -m "docs: note accra gallery figma pack"
```

If Task 4 changed no files, do not create an empty commit.

---

## Self-Review

- Spec coverage: The plan adds the `Accra Gallery` built-in pack, keeps API catalog work out of scope, includes exclusive palettes, flat editorial rendering, distinct pack-only body/topper/accessory/outfit ids, Pro-compatible plugin behavior through `BUILT_IN_PACKS`, and deterministic tests.
- Placeholder scan: No `TBD`, `TODO`, or open-ended “handle edge cases” steps remain. Optional docs changes are explicitly conditional.
- Type consistency: The ids used in `accra-gallery.ts` match the ids added to `types.ts` and renderer switch cases: `galleryPlaque`, `softShield`, `wovenTile`, `medallion`, `goldHoop`, `blackStarPin`, `textileBand`, `geometricCap`, `galleryWrap`, and `patternedCollar`.
