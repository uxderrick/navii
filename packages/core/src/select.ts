import { createRng } from './prng.js';
import {
  ACCESSORY_IDS,
  ANTENNA_IDS,
  BACKGROUND_IDS,
  BODY_IDS,
  EYE_IDS,
  MOUTH_IDS,
  PALETTES,
  PALETTE_BY_ID,
  TOPPER_IDS,
} from './parts/index.js';
import { resolvePacks } from './packs/index.js';
import type { Pack, PackPicks, StylePartSubset } from './packs/types.js';
import type { AvatarOptions, AvatarSpec, BackgroundId, OutfitId, Palette, StyleHint } from './types.js';

/**
 * Apply a style-hint subset filter to a pool. Looks across enabled packs for
 * the first declared subset matching `hint` + `partKey`. Intersection avoids
 * empty results (falls back to original pool if no surviving candidates).
 *
 * Determinism preserved: same seed + same hint = same downstream pick.
 */
function applyStyleHint<T extends string>(
  pool: readonly T[],
  packs: readonly Pack[],
  hint: StyleHint,
  partKey: keyof StylePartSubset,
): readonly T[] {
  for (const pack of packs) {
    const subset = pack.styleHints?.[hint]?.[partKey] as readonly T[] | undefined;
    if (subset && subset.length > 0) {
      const narrowed = pool.filter((id) => subset.includes(id));
      if (narrowed.length > 0) return narrowed;
    }
  }
  return pool;
}

/**
 * Resolve the selection pool for a single part across enabled packs.
 *
 * - No pack has a pick → return base pool unchanged
 * - One or more packs constrain → take the INTERSECTION (must satisfy all)
 * - Intersection empty → fall back to the UNION so we never blank-render
 *
 * Pack constraints are AUTHORITATIVE — they can introduce ids that aren't in
 * the base pool (e.g. pack-only body shapes like Office's 'squircle'). The
 * type system enforces that ids are still valid renderable variants.
 */
function resolvePartPool<T extends string>(
  basePool: readonly T[],
  packs: readonly Pack[],
  partKey: keyof PackPicks,
): readonly T[] {
  const constraints = packs
    .map((p) => p.picks?.[partKey] as readonly T[] | undefined)
    .filter((list): list is readonly T[] => Array.isArray(list) && list.length > 0);
  if (constraints.length === 0) return basePool;
  // Intersection across all pack constraints. Don't filter against basePool —
  // packs can legitimately introduce new variants.
  let pool: readonly T[] = constraints[0]!;
  for (let i = 1; i < constraints.length; i++) {
    pool = pool.filter((id) => constraints[i]!.includes(id));
  }
  if (pool.length > 0) return pool;
  // Empty intersection → union fallback so we never blank-render.
  const seen = new Set<T>();
  const union: T[] = [];
  for (const list of constraints) {
    for (const id of list) {
      if (!seen.has(id)) { seen.add(id); union.push(id); }
    }
  }
  return union.length > 0 ? union : basePool;
}

/**
 * Seed → AvatarSpec.
 *
 * The PRNG is drawn in a fixed order so that adding new parts later doesn't
 * shift existing seeds' selections. Append new picks at the end of this
 * function; never insert in the middle.
 */
export function selectAvatar(seed: string, options: AvatarOptions = {}): AvatarSpec {
  const rng = createRng(seed);

  // Resolve enabled packs (silently skips unknown ids).
  const enabledPacks = resolvePacks(options.packs);

  // Build the palette pool: base palettes + any palettes contributed by
  // enabled packs. Stable ordering: base first, then packs in the order they
  // were requested. Same seed + same pack ids = same pick.
  const packPalettes: Palette[] = [];
  let exclusivePackPalettes: Palette[] | null = null;
  for (const pack of enabledPacks) {
    if (pack.palettes && pack.palettes.length > 0) {
      packPalettes.push(...pack.palettes);
      // Track palettes from exclusive packs separately — when any pack opts
      // into exclusivity we restrict the pool to only those packs' palettes.
      if (pack.paletteExclusive) {
        exclusivePackPalettes = exclusivePackPalettes ?? [];
        exclusivePackPalettes.push(...pack.palettes);
      }
    }
  }
  const palettePool: readonly Palette[] = exclusivePackPalettes
    ? exclusivePackPalettes
    : packPalettes.length > 0
    ? [...PALETTES, ...packPalettes]
    : PALETTES;

  // Palette priority: explicit palette object > paletteId lookup > seed-random
  // from the (possibly extended) pool.
  const paletteByIdLookup = options.paletteId
    ? PALETTE_BY_ID[options.paletteId] ??
      packPalettes.find((p) => p.id === options.paletteId)
    : undefined;
  const paletteOverride = options.palette ?? paletteByIdLookup;
  const palette = paletteOverride ?? rng.pick(palettePool);

  // Resolve per-part pools honoring pack picks (intersection of constraints).
  const bodyPool = resolvePartPool(BODY_IDS, enabledPacks, 'body');
  const eyesPool = resolvePartPool(EYE_IDS, enabledPacks, 'eyes');
  const mouthPool = resolvePartPool(MOUTH_IDS, enabledPacks, 'mouth');
  const antennaPool = resolvePartPool(ANTENNA_IDS, enabledPacks, 'antenna');
  let accessoryPool = resolvePartPool(ACCESSORY_IDS, enabledPacks, 'accessory');
  const backgroundPool = resolvePartPool(BACKGROUND_IDS, enabledPacks, 'background');
  let topperPool = resolvePartPool(TOPPER_IDS, enabledPacks, 'topper');

  // Style hint — narrow accessory + topper pools (outfit applied later) to
  // the subset declared by enabled packs for the requested style. Packs
  // without a declaration for that style ignore the hint.
  const styleHint = options.style;
  if (styleHint) {
    accessoryPool = applyStyleHint(accessoryPool, enabledPacks, styleHint, 'accessory');
    topperPool = applyStyleHint(topperPool, enabledPacks, styleHint, 'topper');
  }

  const body = rng.pick(bodyPool);
  const eyes = rng.pick(eyesPool);
  const mouth = rng.pick(mouthPool);
  const antenna = rng.pick(antennaPool);
  const accessory = rng.pick(accessoryPool);

  let background: BackgroundId;
  if (typeof options.background === 'string') {
    background = options.background;
  } else if (options.background && typeof options.background === 'object') {
    background = 'solid';
  } else {
    background = rng.pick(backgroundPool);
  }

  // Topper drawn last so existing seeds keep their other parts identical.
  const topperRaw = rng.pick(topperPool);
  // If antenna already mounts something on the apex, suppress topper to avoid
  // visual collision — keeps silhouettes legible.
  const topper = antenna !== 'none' && topperRaw !== 'none' && topperRaw !== 'leaf'
    ? 'none'
    : topperRaw;

  // Continuous tweaks — appended to the RNG stream so existing seeds keep the
  // selections above unchanged when these were introduced.
  const hueShift = Math.round(rng.range(-30, 30));
  const bodyScale = Number(rng.range(0.92, 1.08).toFixed(3));
  const eyeGapShift = Number(rng.range(-2, 2).toFixed(2));
  const mouthCurveScale = Number(rng.range(0.85, 1.15).toFixed(3));
  const antennaTilt = Math.round(rng.range(-8, 8));

  // Outfit: by default not drawn from seed (keeps base avatars plain-chested).
  // Packs can opt in by listing outfit picks — that signals the pack wants
  // every seed to wear that outfit family.
  const outfitConstraints = enabledPacks
    .map((p) => p.picks?.outfit)
    .filter((list): list is readonly OutfitId[] => Array.isArray(list) && list.length > 0);
  let outfit: OutfitId = 'none';
  if (outfitConstraints.length > 0) {
    // Intersect all pack outfit lists.
    let pool: readonly OutfitId[] = outfitConstraints[0]!;
    for (let i = 1; i < outfitConstraints.length; i++) {
      pool = pool.filter((id) => outfitConstraints[i]!.includes(id));
    }
    // Empty intersection → union fallback (avoid blank outfit drop).
    if (pool.length === 0) {
      const seen = new Set<OutfitId>();
      const union: OutfitId[] = [];
      for (const list of outfitConstraints) {
        for (const id of list) {
          if (!seen.has(id)) { seen.add(id); union.push(id); }
        }
      }
      pool = union;
    }
    // Narrow by style hint if requested + a pack declares it.
    if (styleHint) {
      pool = applyStyleHint(pool, enabledPacks, styleHint, 'outfit');
    }
    outfit = pool.length > 0 ? rng.pick(pool) : 'none';
  }

  // Style flags from enabled packs — last-write-wins for collisions.
  let flat: boolean | undefined;
  let bgColor: string | undefined;
  let featureStroke: number | undefined;
  let glow: boolean | undefined;
  for (const pack of enabledPacks) {
    if (pack.flat) flat = true;
    if (pack.bgColor) bgColor = pack.bgColor;
    if (pack.featureStroke) featureStroke = pack.featureStroke;
    if (pack.glow) glow = true;
  }

  return {
    seed, palette, body, eyes, mouth, antenna, accessory, background, topper,
    outfit,
    hueShift, bodyScale, eyeGapShift, mouthCurveScale, antennaTilt,
    ...(flat ? { flat: true } : {}),
    ...(bgColor ? { bgColor } : {}),
    ...(featureStroke ? { featureStroke } : {}),
    ...(glow ? { glow: true } : {}),
  };
}
