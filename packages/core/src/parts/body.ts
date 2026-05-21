import type { BodyShapeId, Palette } from '../types.js';
import { ANCHORS, type FaceAnchor } from './anchor.js';

/**
 * Body silhouettes as SVG paths.
 *
 * Each shape is hand-tuned so the silhouettes read as distinct creatures of
 * the same species — different proportions, not just stretched ellipses.
 * Paths are pre-baked rather than generated so they can be replaced 1:1 by an
 * illustrator's exports without touching the renderer.
 */

const BODY_PATHS: Record<BodyShapeId, string> = {
  // Orb — true round, slight under-bulge for grounded feel
  orb: 'M50 20 C72 20 84 36 84 54 C84 73 70 86 50 86 C30 86 16 73 16 54 C16 36 28 20 50 20 Z',

  // Tall — egg pointing up, narrow shoulders, fuller bottom
  tall: 'M50 15 C66 15 74 30 74 48 C74 70 66 91 50 91 C34 91 26 70 26 48 C26 30 34 15 50 15 Z',

  // Squat — wide mushroom cap, low waist
  squat: 'M50 28 C74 28 88 42 88 60 C88 78 74 86 50 86 C26 86 12 78 12 60 C12 42 26 28 50 28 Z',

  // Pear — narrow top, broad rounded bottom
  pear: 'M50 18 C62 18 70 32 70 46 C70 56 80 66 80 76 C80 86 68 90 50 90 C32 90 20 86 20 76 C20 66 30 56 30 46 C30 32 38 18 50 18 Z',

  // Pebble — asymmetric river stone, slight tilt right
  pebble: 'M52 19 C72 21 86 36 84 56 C82 73 68 85 50 85 C30 85 16 72 16 54 C16 35 32 17 52 19 Z',

  // Dumpling — round bottom-heavy, narrow shoulders, sits low
  dumpling: 'M50 30 C62 30 70 38 70 48 C70 56 78 64 80 72 C82 82 70 88 50 88 C30 88 18 82 20 72 C22 64 30 56 30 48 C30 38 38 30 50 30 Z',

  // Taro — gourd shape: small head bulge, fuller bottom
  taro: 'M50 14 C58 14 64 22 64 30 C64 36 60 40 60 46 C60 54 76 60 78 76 C80 88 66 91 50 91 C34 91 20 88 22 76 C24 60 40 54 40 46 C40 40 36 36 36 30 C36 22 42 14 50 14 Z',

  // Wisp — tall narrow body, slight bottom flare, ghost-like
  wisp: 'M50 12 C60 12 66 24 66 40 C66 60 74 78 70 90 C64 96 36 96 30 90 C26 78 34 60 34 40 C34 24 40 12 50 12 Z',
};

export function bodyAnchor(id: BodyShapeId): FaceAnchor {
  return ANCHORS[id];
}

export function renderBodyDefs(_id: BodyShapeId, _palette: Palette, gradId: string): string {
  return `
<radialGradient id="${gradId}" cx="42%" cy="32%" r="68%">
  <stop offset="0%" stop-color="${_palette.bodyFrom}" />
  <stop offset="100%" stop-color="${_palette.bodyTo}" />
</radialGradient>`.trim();
}

export function renderBody(id: BodyShapeId, palette: Palette, gradId: string): string {
  const d = BODY_PATHS[id];
  const a = ANCHORS[id];
  const outlineColor = withAlpha(palette.ink, 0.18);

  return [
    // Ground shadow — soft ellipse just below body, grounds the figure
    `<ellipse cx="${a.cx}" cy="${a.groundY + 4}" rx="22" ry="2.6" fill="${palette.ink}" opacity="0.16" />`,
    // Body fill
    `<path d="${d}" fill="url(#${gradId})" stroke="${outlineColor}" stroke-width="0.7" />`,
    // Sheen — small light spot upper-left, scaled to body
    `<ellipse cx="${a.cx - 12}" cy="${a.eyeY - 14}" rx="11" ry="7" fill="#FFFFFF" opacity="0.22" transform="rotate(-18 ${a.cx - 12} ${a.eyeY - 14})" />`,
  ].join('');
}

/** Inline rgba() from hex — keeps SVG self-contained. */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const part = v.slice(0, 6);
  const r = parseInt(part.slice(0, 2), 16);
  const g = parseInt(part.slice(2, 4), 16);
  const b = parseInt(part.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
