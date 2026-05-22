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
import type { AvatarOptions, AvatarSpec, BackgroundId } from './types.js';

/**
 * Seed → AvatarSpec.
 *
 * The PRNG is drawn in a fixed order so that adding new parts later doesn't
 * shift existing seeds' selections. Append new picks at the end of this
 * function; never insert in the middle.
 */
export function selectAvatar(seed: string, options: AvatarOptions = {}): AvatarSpec {
  const rng = createRng(seed);

  const paletteOverride = options.paletteId ? PALETTE_BY_ID[options.paletteId] : undefined;
  const palette = paletteOverride ?? rng.pick(PALETTES);

  const body = rng.pick(BODY_IDS);
  const eyes = rng.pick(EYE_IDS);
  const mouth = rng.pick(MOUTH_IDS);
  const antenna = rng.pick(ANTENNA_IDS);
  const accessory = rng.pick(ACCESSORY_IDS);

  let background: BackgroundId;
  if (typeof options.background === 'string') {
    background = options.background;
  } else if (options.background && typeof options.background === 'object') {
    background = 'solid';
  } else {
    background = rng.pick(BACKGROUND_IDS);
  }

  // Topper drawn last so existing seeds keep their other parts identical.
  const topperRaw = rng.pick(TOPPER_IDS);
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

  // Outfit is intentionally NOT drawn from the seed — it's a decorator slot,
  // only set via build() / builder UI. Keeps seeded thumbs visually light.
  return {
    seed, palette, body, eyes, mouth, antenna, accessory, background, topper,
    outfit: 'none',
    hueShift, bodyScale, eyeGapShift, mouthCurveScale, antennaTilt,
  };
}
