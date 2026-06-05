# Nairobi Route Sticker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Nairobi pack away from generic neon mascots into a route-number, matatu-sticker, Kenya-flag, and subtle shuka identity system.

**Architecture:** Keep Core as the source of truth. Reuse the existing `nairobi-matatu` pack id and existing part ids so the public API shape does not churn, but change palettes and SVG details to emphasize route plates, yellow stripes, black/red/green/white, chrome/window marks, and restrained shuka checks. The API preview route remains a local visual review page only.

**Tech Stack:** TypeScript, Vitest, tsup, Hono API.

---

## File Structure

- Modify `packages/core/test/packs.test.ts`: update Nairobi palette expectations and add a route-sticker visual marker test.
- Modify `packages/core/src/packs/nairobi-matatu.ts`: rename palettes and shift copy/colors toward Nairobi route sticker identity.
- Modify `packages/core/src/parts/topper.ts`: make the three Nairobi toppers read as route stripe, shuka strip, and windshield sticker rather than candy neon.
- Modify `packages/core/src/parts/accessory.ts`: make Nairobi accessories read as chrome glasses, Kenya badge, and route-number sticker.
- Modify `packages/core/src/parts/outfit.ts`: make Nairobi outfits read as route stripe, shuka collar, and ticket/plate necklace.
- Modify `packages/api/src/app.ts`: update `/nairobi-packs` palette ids and page copy.

### Task 1: Red Tests For Route Sticker Identity

- [ ] **Step 1: Update Nairobi palette expectations**

In `packages/core/test/packs.test.ts`, change the Nairobi palette ids to:

```ts
[
  'nairobi-matatu:route-black',
  'nairobi-matatu:kanu-red',
  'nairobi-matatu:city-green',
  'nairobi-matatu:yellow-stripe',
  'nairobi-matatu:shuka-blue',
]
```

Expect the first palette to match:

```ts
{
  bodyFrom: '#101820',
  bodyTo: '#101820',
  accent: '#F5C51B',
  ink: '#F8F7EF',
}
```

- [ ] **Step 2: Add route-sticker marker test**

Add a test that renders `createAvatar('route-46', { packs: ['nairobi-matatu'], paletteId: 'nairobi-matatu:route-black' })` and expects `#F5C51B`, `#00843D`, `#C8102E`, `#F8F7EF`, and text markers `46` or `CBD`.

- [ ] **Step 3: Run focused pack tests**

Run `pnpm --filter @usenavii/core exec vitest run test/packs.test.ts`.

Expected: FAIL because the current pack still uses old palette ids and does not render route-number text.

### Task 2: Core Pack And Renderer Redesign

- [ ] **Step 1: Update `nairobi-matatu.ts`**

Replace the five palettes with:

```ts
{ id: 'nairobi-matatu:route-black', bodyFrom: '#101820', bodyTo: '#101820', accent: '#F5C51B', ink: '#F8F7EF', blush: '#C8102E' },
{ id: 'nairobi-matatu:kanu-red', bodyFrom: '#C8102E', bodyTo: '#101820', accent: '#F5C51B', ink: '#F8F7EF', blush: '#00843D' },
{ id: 'nairobi-matatu:city-green', bodyFrom: '#00843D', bodyTo: '#101820', accent: '#F5C51B', ink: '#F8F7EF', blush: '#C8102E' },
{ id: 'nairobi-matatu:yellow-stripe', bodyFrom: '#F5C51B', bodyTo: '#101820', accent: '#00843D', ink: '#101820', blush: '#C8102E' },
{ id: 'nairobi-matatu:shuka-blue', bodyFrom: '#1E4EA8', bodyTo: '#101820', accent: '#C8102E', ink: '#F8F7EF', blush: '#F5C51B' },
```

Update the description to include `route stickers`.

- [ ] **Step 2: Update Nairobi SVG cases**

In the existing Nairobi cases, replace candy-neon colors with route/flag constants:

```ts
const routeYellow = '#F5C51B';
const kenyaGreen = '#00843D';
const kenyaRed = '#C8102E';
const matatuBlack = '#101820';
const paperWhite = '#F8F7EF';
```

Use route-number text in `matatuMark`, `neonRouteBand`, and `stickerCap`.

- [ ] **Step 3: Run tests**

Run `pnpm --filter @usenavii/core exec vitest run test/packs.test.ts` and `pnpm --filter @usenavii/core run typecheck`.

Expected: PASS.

### Task 3: Local Preview Refresh

- [ ] **Step 1: Update `/nairobi-packs` palette ids and copy**

In `packages/api/src/app.ts`, replace the old Nairobi palette ids with the five new ids and update the paragraph to say the page is scanning route-sticker, yellow stripe, Kenya flag, and shuka details.

- [ ] **Step 2: Build Core and verify server output**

Run:

```bash
pnpm --filter @usenavii/core run build
pnpm --filter @usenavii/api run typecheck
curl -s http://localhost:8787/nairobi-packs | rg -n "route-black|yellow-stripe|#F5C51B|#00843D|#C8102E|46|CBD"
```

Expected: build/typecheck PASS and the local page contains the new palette ids and route markers.
