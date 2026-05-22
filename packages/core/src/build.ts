import { PALETTES, PALETTE_BY_ID } from './parts/palette.js';
import { renderAvatar } from './render.js';
import type {
  AccessoryId,
  AntennaStyleId,
  AvatarOptions,
  AvatarSpec,
  BackgroundId,
  BodyShapeId,
  EyeStyleId,
  MouthStyleId,
  TopperId,
} from './types.js';

/**
 * Direct construction of an avatar from explicit part choices — no seed.
 *
 * Use when you need a SPECIFIC mascot rather than a deterministic one
 * derived from a user id. Common uses: brand mascots, logo marks, fixed
 * tests, designer curation, gallery hero shots.
 *
 * Any field left unspecified falls back to its first variant (mostly the
 * neutral / "none" option). Continuous params default to 0 / 1 (no tweak).
 */
export interface BuildSpec {
  palette?: string;
  body?: BodyShapeId;
  eyes?: EyeStyleId;
  mouth?: MouthStyleId;
  antenna?: AntennaStyleId;
  accessory?: AccessoryId;
  background?: BackgroundId;
  topper?: TopperId;
  hueShift?: number;
  bodyScale?: number;
  eyeGapShift?: number;
  mouthCurveScale?: number;
  antennaTilt?: number;
}

/**
 * Build an SVG avatar from explicit part choices.
 *
 * @example
 * ```ts
 * const svg = build({
 *   body: 'tall',
 *   eyes: 'star',
 *   mouth: 'grin',
 *   palette: 'violet',
 *   topper: 'crown',
 * }, { size: 192 });
 * ```
 *
 * Pass `AvatarOptions` (size, title, animated, tileBg) as the second arg —
 * same shape as `createAvatar`'s options.
 */
export function build(spec: BuildSpec = {}, options: AvatarOptions = {}): string {
  const palette = spec.palette ? (PALETTE_BY_ID[spec.palette] ?? PALETTES[0]!) : PALETTES[0]!;

  const resolved: AvatarSpec = {
    seed: '__build__',
    palette,
    body: spec.body ?? 'orb',
    eyes: spec.eyes ?? 'round',
    mouth: spec.mouth ?? 'smile',
    antenna: spec.antenna ?? 'none',
    accessory: spec.accessory ?? 'none',
    background: spec.background ?? 'none',
    topper: spec.topper ?? 'none',
    hueShift: spec.hueShift ?? 0,
    bodyScale: spec.bodyScale ?? 1,
    eyeGapShift: spec.eyeGapShift ?? 0,
    mouthCurveScale: spec.mouthCurveScale ?? 1,
    antennaTilt: spec.antennaTilt ?? 0,
  };

  return renderAvatar(resolved, options);
}
