# Lagos Danfo Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the premium `lagos-danfo` pack to Navii Core, expose it through the Figma plugin bundle, and make React wrappers forward pack options.

**Architecture:** Core remains the source of truth: pack metadata, palettes, part ids, anchors, and SVG render branches live under `packages/core`. The Figma plugin consumes `BUILT_IN_PACKS` from Core, so plugin work is limited to copy/count updates and rebuild verification. React already re-exports Core, but its `<Navii />` and `<NaviiGroup />` wrappers must explicitly forward `packs`.

**Tech Stack:** TypeScript, Vitest, tsup, React, Figma plugin esbuild bundle.

---

## File Structure

- Create `packages/core/src/packs/lagos-danfo.ts`: pack metadata, five palettes, pack picks, style hints.
- Modify `packages/core/src/packs/index.ts`: import/register `lagosDanfoPack` in `BUILT_IN_PACKS`.
- Modify `packages/core/src/types.ts`: add Lagos body/topper/accessory/outfit ids.
- Modify `packages/core/src/parts/anchor.ts`: add anchors for Lagos body ids.
- Modify `packages/core/src/parts/body.ts`: add Lagos body SVG paths.
- Modify `packages/core/src/parts/topper.ts`: render `danfoRoofStripe`, `naijaBand`, `routeCap`.
- Modify `packages/core/src/parts/accessory.ts`: render `yellowGlasses`, `greenPin`, `routeDot`.
- Modify `packages/core/src/parts/outfit.ts`: render `roadStripeCollar`, `flagCollar`, `yellowTrimNecklace`.
- Modify `packages/core/test/packs.test.ts`: add Lagos registry, palette, deterministic, visibility tests.
- Modify `packages/react/src/index.tsx`: forward `packs` from `<Navii />` and `<NaviiGroup />`.
- Modify `packages/figma-plugin/src/ui.html`: update Pro copy from 8 packs / 80 palettes to 9 packs / 85 palettes.

---

### Task 1: Core Tests For Lagos Danfo Contract

**Files:**
- Modify: `packages/core/test/packs.test.ts`

- [ ] **Step 1: Write failing registry and palette tests**

Add `lagos-danfo` to the built-in ids expectation and add a new test after the Accra palette test:

```ts
expect(ids).toEqual([
  'accra-gallery',
  'earth', 'halloween', 'lagos-danfo', 'mono', 'neon',
  'office', 'office-bright', 'pastel',
]);
```

```ts
it('lagos danfo pack contributes 5 namespaced palettes', () => {
  const pack = PACK_REGISTRY['lagos-danfo']!;
  const paletteIds = pack.palettes!.map((p) => p.id);
  expect(pack).toBeDefined();
  expect(pack.name).toBe('Lagos Danfo');
  expect(pack.description).toContain('Nigerian green-white-green');
  expect(pack.palettes).toBeDefined();
  expect(pack.palettes!.length).toBe(5);
  expect(paletteIds).toEqual([
    'lagos-danfo:green-white',
    'lagos-danfo:white-green',
    'lagos-danfo:danfo-green',
    'lagos-danfo:deep-green',
    'lagos-danfo:street-black',
  ]);
  expect(pack.palettes![0]).toMatchObject({
    bodyFrom: '#008753',
    bodyTo: '#F8F7EF',
    accent: '#F5C51B',
    ink: '#111827',
  });
  expect(pack.palettes!.find((p) => p.id === 'lagos-danfo:street-black')).toMatchObject({
    bodyFrom: '#111827',
    ink: '#F8F7EF',
  });
  for (const p of pack.palettes!) {
    expect(p.id.startsWith('lagos-danfo:'), `palette id "${p.id}" must be namespaced`).toBe(true);
  }
  expect(pack.paletteExclusive).toBe(true);
  expect(pack.flat).toBe(true);
});
```

- [ ] **Step 2: Write failing render behavior tests**

Add these tests after the Lagos palette test:

```ts
it('lagos danfo changes output while remaining deterministic', () => {
  const base = createAvatar('lagos-founder');
  const first = createAvatar('lagos-founder', { packs: ['lagos-danfo'] });
  const second = createAvatar('lagos-founder', { packs: ['lagos-danfo'] });
  expect(first).not.toBe(base);
  expect(first).toBe(second);
  expect(first).toContain('#F8F7EF');
});

it('lagos danfo paletteId can target the street black palette visibly', () => {
  const svg = createAvatar('eko-night', {
    packs: ['lagos-danfo'],
    paletteId: 'lagos-danfo:street-black',
  });
  expect(svg).toBe(createAvatar('eko-night', {
    packs: ['lagos-danfo'],
    paletteId: 'lagos-danfo:street-black',
  }));
  expect(svg).toContain('#111827');
  expect(svg).toContain('#F8F7EF');
  expect(svg).toContain('#F5C51B');
  expect(svg).toContain('#008753');
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
```

Expected: FAIL because `lagos-danfo` is not registered.

- [ ] **Step 4: Commit failing tests**

```bash
git add packages/core/test/packs.test.ts
git commit -m "test: define lagos danfo pack behavior"
```

---

### Task 2: Core Pack Registry And Public Types

**Files:**
- Create: `packages/core/src/packs/lagos-danfo.ts`
- Modify: `packages/core/src/packs/index.ts`
- Modify: `packages/core/src/types.ts`

- [ ] **Step 1: Create Lagos Danfo pack file**

Create `packages/core/src/packs/lagos-danfo.ts`:

```ts
import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Lagos Danfo — premium Lagos/Nigeria avatar identity system.
 *
 * Visual rules:
 * - Nigerian green-white-green leads the pack identity
 * - Danfo yellow is the Lagos accent on bands, trim, and route details
 * - Black route-line strokes keep the avatars crisp at plugin sizes
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'lagos-danfo:green-white', bodyFrom: '#008753', bodyTo: '#F8F7EF', accent: '#F5C51B', ink: '#111827', blush: '#F5C51B' },
  { id: 'lagos-danfo:white-green', bodyFrom: '#F8F7EF', bodyTo: '#008753', accent: '#F5C51B', ink: '#111827', blush: '#008753' },
  { id: 'lagos-danfo:danfo-green', bodyFrom: '#F5C51B', bodyTo: '#008753', accent: '#F8F7EF', ink: '#111827', blush: '#008753' },
  { id: 'lagos-danfo:deep-green', bodyFrom: '#075F3A', bodyTo: '#F8F7EF', accent: '#F5C51B', ink: '#111827', blush: '#F5C51B' },
  { id: 'lagos-danfo:street-black', bodyFrom: '#111827', bodyTo: '#F5C51B', accent: '#008753', ink: '#F8F7EF', blush: '#F5C51B' },
];

export const lagosDanfoPack: Pack = {
  id: 'lagos-danfo',
  name: 'Lagos Danfo',
  description: 'Lagos-inspired avatars with Nigerian green-white-green, danfo yellow accents, bold route-line geometry, and clean city energy.',
  emoji: '▰',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#F8F7EF',
  featureStroke: 1.22,
  picks: {
    body: ['busBadge', 'routePlaque', 'signTile', 'softShield'],
    eyes: ['round', 'oval', 'dot', 'wide', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'glasses', 'yellowGlasses', 'greenPin', 'routeDot'],
    topper: ['danfoRoofStripe', 'naijaBand', 'routeCap'],
    background: ['solid'],
    outfit: ['flagCollar', 'roadStripeCollar', 'yellowTrimNecklace'],
  },
  styleHints: {
    masc: {
      outfit: ['roadStripeCollar', 'flagCollar'],
      accessory: ['none', 'glasses', 'routeDot'],
      topper: ['routeCap', 'danfoRoofStripe'],
    },
    femme: {
      outfit: ['flagCollar', 'yellowTrimNecklace'],
      accessory: ['yellowGlasses', 'greenPin', 'glasses'],
      topper: ['naijaBand', 'danfoRoofStripe'],
    },
    neutral: {
      outfit: ['flagCollar', 'roadStripeCollar'],
      accessory: ['none', 'glasses', 'greenPin'],
      topper: ['naijaBand', 'danfoRoofStripe'],
    },
  },
};
```

- [ ] **Step 2: Register pack**

In `packages/core/src/packs/index.ts`, add:

```ts
import { lagosDanfoPack } from './lagos-danfo.js';
```

Place `lagosDanfoPack` after `accraGalleryPack` in `BUILT_IN_PACKS`:

```ts
export const BUILT_IN_PACKS: Pack[] = [
  accraGalleryPack,
  lagosDanfoPack,
  officePack,
  officeBrightPack,
  halloweenPack,
  pastelPack,
  neonPack,
  monoPack,
  earthPack,
];
```

- [ ] **Step 3: Add public part ids**

In `packages/core/src/types.ts`, extend unions:

```ts
  // Lagos Danfo pack-only bodies
  | 'busBadge' | 'routePlaque' | 'signTile';
```

```ts
  // Lagos Danfo pack-only accessories
  | 'yellowGlasses' | 'greenPin' | 'routeDot';
```

```ts
  // Lagos Danfo pack-only toppers
  | 'danfoRoofStripe' | 'naijaBand' | 'routeCap';
```

```ts
  // Lagos Danfo pack-only outfits
  | 'roadStripeCollar' | 'flagCollar' | 'yellowTrimNecklace';
```

- [ ] **Step 4: Run tests to verify remaining failures**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
```

Expected: FAIL or TypeScript compile failure because renderer anchors/part switches do not yet support the new ids.

- [ ] **Step 5: Commit registry and types**

```bash
git add packages/core/src/packs/lagos-danfo.ts packages/core/src/packs/index.ts packages/core/src/types.ts
git commit -m "feat: register lagos danfo pack"
```

---

### Task 3: Lagos Body Shapes And Anchors

**Files:**
- Modify: `packages/core/src/parts/body.ts`
- Modify: `packages/core/src/parts/anchor.ts`

- [ ] **Step 1: Add body paths**

In `BODY_PATHS` in `packages/core/src/parts/body.ts`, add:

```ts
  busBadge: 'M22 18 L78 18 C83 18 86 22 86 28 L86 73 C86 82 78 88 50 91 C22 88 14 82 14 73 L14 28 C14 22 17 18 22 18 Z',
  routePlaque: 'M20 20 L80 20 C84 20 87 23 87 27 L87 75 C87 82 82 87 75 87 L25 87 C18 87 13 82 13 75 L13 27 C13 23 16 20 20 20 Z',
  signTile: 'M25 15 L75 15 C82 15 86 21 86 30 L86 70 C86 82 76 90 50 90 C24 90 14 82 14 70 L14 30 C14 21 18 15 25 15 Z',
```

- [ ] **Step 2: Add anchors**

In `ANCHORS` in `packages/core/src/parts/anchor.ts`, add:

```ts
  busBadge: {
    cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 8,
    topperX: 50, topperY: 18,
    groundY: 91,
    cheekY: 56, cheekOffset: 22,
  },
  routePlaque: {
    cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0,
    mouthY: 62, mouthSpan: 8,
    topperX: 50, topperY: 20,
    groundY: 87,
    cheekY: 56, cheekOffset: 23,
  },
  signTile: {
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

Expected: FAIL only for missing accessory/topper/outfit switch cases, or PASS if TypeScript does not enforce switch exhaustiveness.

- [ ] **Step 4: Commit body support**

```bash
git add packages/core/src/parts/body.ts packages/core/src/parts/anchor.ts
git commit -m "feat: add lagos danfo body shapes"
```

---

### Task 4: Lagos Toppers, Accessories, And Outfits

**Files:**
- Modify: `packages/core/src/parts/topper.ts`
- Modify: `packages/core/src/parts/accessory.ts`
- Modify: `packages/core/src/parts/outfit.ts`

- [ ] **Step 1: Add topper render cases**

In `renderTopper`, add cases before Halloween-specific cases:

```ts
    case 'danfoRoofStripe':
      return [
        `<path d="M${cx - 20} ${topY + 8} Q${cx} ${topY + 2} ${cx + 20} ${topY + 8} L${cx + 20} ${topY + 13} Q${cx} ${topY + 7} ${cx - 20} ${topY + 13} Z" fill="#F5C51B" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 15}" y="${topY + 8}" width="30" height="2.5" rx="1" fill="#111827" opacity="0.9" />`,
        `<rect x="${cx - 10}" y="${topY + 11}" width="8" height="2.5" fill="#008753" opacity="0.96" />`,
        `<rect x="${cx - 1}" y="${topY + 11}" width="8" height="2.5" fill="#F8F7EF" opacity="0.96" />`,
        `<rect x="${cx + 8}" y="${topY + 11}" width="8" height="2.5" fill="#008753" opacity="0.96" />`,
      ].join('');

    case 'naijaBand':
      return [
        `<path d="M${cx - 19} ${topY + 8} Q${cx} ${topY + 3} ${cx + 19} ${topY + 8} L${cx + 19} ${topY + 13} Q${cx} ${topY + 8} ${cx - 19} ${topY + 13} Z" fill="#008753" stroke="${ink}" stroke-width="0.55" />`,
        `<rect x="${cx - 5}" y="${topY + 6.5}" width="10" height="6" rx="1" fill="#F8F7EF" opacity="0.98" />`,
        `<rect x="${cx - 18}" y="${topY + 9}" width="6" height="3" fill="#F5C51B" opacity="0.96" />`,
        `<rect x="${cx + 12}" y="${topY + 9}" width="6" height="3" fill="#F5C51B" opacity="0.96" />`,
      ].join('');

    case 'routeCap':
      return [
        `<path d="M${cx - 16} ${topY + 6} Q${cx - 13} ${topY - 6} ${cx} ${topY - 7} Q${cx + 13} ${topY - 6} ${cx + 16} ${topY + 6} Z" fill="#008753" stroke="${ink}" stroke-width="0.6" />`,
        `<path d="M${cx - 14} ${topY + 6} L${cx + 14} ${topY + 6}" stroke="#F5C51B" stroke-width="3" stroke-linecap="round" />`,
        `<rect x="${cx - 4}" y="${topY - 5}" width="8" height="8" rx="1.5" fill="#F8F7EF" stroke="${ink}" stroke-width="0.4" />`,
      ].join('');
```

- [ ] **Step 2: Add accessory render cases**

In `renderAccessory`, add:

```ts
    case 'yellowGlasses': {
      const lx = anchor.cx - anchor.eyeOffset;
      const rx = anchor.cx + anchor.eyeOffset;
      const y = anchor.eyeY;
      const r = 6;
      const gw = 1.3 * sw;
      return [
        `<circle cx="${lx}" cy="${y}" r="${r}" fill="none" stroke="#F5C51B" stroke-width="${gw}" />`,
        `<circle cx="${rx}" cy="${y}" r="${r}" fill="none" stroke="#F5C51B" stroke-width="${gw}" />`,
        `<line x1="${lx + r}" y1="${y}" x2="${rx - r}" y2="${y}" stroke="#F5C51B" stroke-width="${gw}" />`,
        `<circle cx="${lx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
        `<circle cx="${rx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
      ].join('');
    }

    case 'greenPin': {
      const x = anchor.cx + 13;
      const y = anchor.cheekY + 10;
      return [
        `<circle cx="${x}" cy="${y}" r="${3.2 * sw}" fill="#008753" stroke="${palette.ink}" stroke-width="${0.45 * sw}" />`,
        `<rect x="${x - 1}" y="${y - 3}" width="2" height="6" fill="#F8F7EF" opacity="0.96" />`,
      ].join('');
    }

    case 'routeDot': {
      const x = anchor.cx - 13;
      const y = anchor.cheekY + 10;
      return [
        `<circle cx="${x}" cy="${y}" r="${3.3 * sw}" fill="#F5C51B" stroke="${palette.ink}" stroke-width="${0.5 * sw}" />`,
        `<circle cx="${x}" cy="${y}" r="${1.1 * sw}" fill="#111827" opacity="0.9" />`,
      ].join('');
    }
```

- [ ] **Step 3: Add outfit render cases**

In `renderOutfit`, add:

```ts
    case 'roadStripeCollar':
      return [
        `<path d="M${cx - 15} ${cy - 3} Q${cx} ${cy + 5} ${cx + 15} ${cy - 3} L${cx + 12} ${cy + 5} Q${cx} ${cy + 11} ${cx - 12} ${cy + 5} Z" fill="#111827" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 11}" y="${cy}" width="7" height="5" fill="#F5C51B" opacity="0.98" />`,
        `<rect x="${cx - 2}" y="${cy + 2}" width="4" height="6" fill="#F8F7EF" opacity="0.98" />`,
        `<rect x="${cx + 5}" y="${cy}" width="7" height="5" fill="#008753" opacity="0.98" />`,
      ].join('');

    case 'flagCollar':
      return [
        `<path d="M${cx - 14} ${cy - 3} Q${cx} ${cy + 4} ${cx + 14} ${cy - 3} L${cx + 11} ${cy + 5} Q${cx} ${cy + 10} ${cx - 11} ${cy + 5} Z" fill="#008753" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 4}" y="${cy - 1}" width="8" height="9" rx="1" fill="#F8F7EF" opacity="0.98" />`,
        `<path d="M${cx - 13} ${cy + 1} L${cx + 13} ${cy + 1}" stroke="#F5C51B" stroke-width="1.1" stroke-linecap="round" />`,
      ].join('');

    case 'yellowTrimNecklace':
      return [
        `<path d="M${cx - 11} ${cy} Q${cx} ${cy + 8} ${cx + 11} ${cy}" stroke="#F5C51B" stroke-width="1" fill="none" stroke-linecap="round" />`,
        `<rect x="${cx - 2.5}" y="${cy + 5.5}" width="5" height="5" rx="1" fill="#008753" stroke="${ink}" stroke-width="0.45" />`,
        `<rect x="${cx - 0.8}" y="${cy + 5.8}" width="1.6" height="4.4" fill="#F8F7EF" opacity="0.96" />`,
      ].join('');
```

- [ ] **Step 4: Run pack tests**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run typecheck**

Run:

```bash
pnpm --filter @usenavii/core run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit part renderers**

```bash
git add packages/core/src/parts/topper.ts packages/core/src/parts/accessory.ts packages/core/src/parts/outfit.ts
git commit -m "feat: render lagos danfo pack parts"
```

---

### Task 5: React Wrapper Pack Forwarding

**Files:**
- Modify: `packages/react/src/index.tsx`

- [ ] **Step 1: Forward packs from `<Navii />`**

In `Navii` destructuring, add `packs`:

```ts
export function Navii({
  seed,
  size = 96,
  paletteId,
  palette,
  background,
  title,
  animated,
  mood,
  packs,
  className,
  style,
  styleHint,
  alt,
}: NaviiProps): React.ReactElement {
```

Inside the memo, before `styleHint`, add:

```ts
    if (packs !== undefined) opts.packs = packs;
```

Add `packs` to the dependency array:

```ts
  }, [seed, size, paletteId, palette, background, title, animated, mood, packs, styleHint]);
```

- [ ] **Step 2: Forward packs from `<NaviiGroup />`**

In `NaviiGroup` destructuring, add `packs`:

```ts
export function NaviiGroup({
  seeds,
  size = 64,
  overlap = 0.3,
  max,
  ring,
  tileBg,
  counterFill,
  counterInk,
  paletteId,
  palette,
  background,
  mood,
  animated,
  packs,
  className,
  style,
  styleHint,
  alt,
}: NaviiGroupProps): React.ReactElement | null {
```

Inside the memo, before `styleHint`, add:

```ts
    if (packs !== undefined) opts.packs = packs;
```

Add `packs` to the dependency array:

```ts
  }, [stableSeeds, size, overlap, max, ring, tileBg, counterFill, counterInk, paletteId, palette, background, mood, animated, packs, styleHint]);
```

- [ ] **Step 3: Run React typecheck**

Run:

```bash
pnpm --filter @usenavii/react run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit React forwarding**

```bash
git add packages/react/src/index.tsx
git commit -m "fix(react): forward pack options"
```

---

### Task 6: Plugin Copy And Bundle Verification

**Files:**
- Modify: `packages/figma-plugin/src/ui.html`

- [ ] **Step 1: Update Pro copy**

In `packages/figma-plugin/src/ui.html`, update the Pro copy:

```html
<div class="upgrade-feat-desc">9 themed bundles today (Accra Gallery, Lagos Danfo, Office, Halloween, Pastel, Neon, Mono, Earth, Office Bright). Buy once — every new pack lands in your library.</div>
```

```html
<li><strong>+9 themed packs today</strong>, plus every future pack — Accra Gallery, Lagos Danfo, Office, Halloween, Pastel, Neon, Mono, Earth, Office Bright (85 palettes total)</li>
```

- [ ] **Step 2: Build Core**

Run:

```bash
pnpm --filter @usenavii/core run build
```

Expected: PASS.

- [ ] **Step 3: Typecheck and build Figma plugin**

Run:

```bash
pnpm --filter @usenavii/figma-plugin run typecheck
pnpm --filter @usenavii/figma-plugin run build
```

Expected: PASS, with `dist/ui.html written`.

- [ ] **Step 4: Verify bundle contains Lagos**

Run:

```bash
rg -n "Lagos Danfo|lagos-danfo|9 themed|85 palettes" packages/figma-plugin/src/ui.html packages/figma-plugin/dist/ui.html packages/figma-plugin/dist/ui.js
```

Expected: matches in source HTML and built `dist/ui.js`/`dist/ui.html`.

- [ ] **Step 5: Commit plugin copy**

Only commit tracked source changes; do not commit generated `dist` unless `git status --short packages/figma-plugin/dist` shows tracked modifications expected by the repo.

```bash
git add packages/figma-plugin/src/ui.html
git commit -m "feat(figma): include lagos danfo in pack copy"
```

---

### Task 7: Final Verification

**Files:**
- No new source files unless previous tasks revealed tracked generated files.

- [ ] **Step 1: Run full targeted verification**

Run:

```bash
pnpm --filter @usenavii/core exec vitest run test/packs.test.ts
pnpm --filter @usenavii/core run typecheck
pnpm --filter @usenavii/core run build
pnpm --filter @usenavii/react run typecheck
pnpm --filter @usenavii/figma-plugin run typecheck
pnpm --filter @usenavii/figma-plugin run build
```

Expected: all commands PASS.

- [ ] **Step 2: Render a direct visibility sample**

Run:

```bash
node --input-type=module -e "import { createAvatar } from './packages/core/dist/index.js'; const svg = createAvatar('eko-night', { size: 96, packs: ['lagos-danfo'], paletteId: 'lagos-danfo:street-black' }); console.log(JSON.stringify({ hasBlack: svg.includes('#111827'), hasLightInk: svg.includes('#F8F7EF'), hasYellow: svg.includes('#F5C51B'), hasGreen: svg.includes('#008753') }));"
```

Expected:

```json
{"hasBlack":true,"hasLightInk":true,"hasYellow":true,"hasGreen":true}
```

- [ ] **Step 3: Review final diff scope**

Run:

```bash
git status --short
git diff --stat
```

Expected: only Lagos/Core/React/plugin source files remain changed by these tasks, plus any unrelated pre-existing dirty files. Do not stage unrelated existing changes.

- [ ] **Step 4: Final commit if needed**

If Task 6 did not commit all remaining intended source changes, commit only intended files:

```bash
git add packages/core/src/packs/lagos-danfo.ts packages/core/src/packs/index.ts packages/core/src/types.ts packages/core/src/parts/anchor.ts packages/core/src/parts/body.ts packages/core/src/parts/topper.ts packages/core/src/parts/accessory.ts packages/core/src/parts/outfit.ts packages/core/test/packs.test.ts packages/react/src/index.tsx packages/figma-plugin/src/ui.html
git commit -m "feat: ship lagos danfo pack"
```

Expected: commit succeeds, or nothing to commit because prior task commits already captured all intended source changes.
