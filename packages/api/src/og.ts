/**
 * Open Graph image composer.
 *
 * Builds a 1200×630 SVG with a stack of seeded avatars and the marketing
 * headline, then rasters to PNG. Result is cached in-process since the
 * output never changes.
 */

import { selectAvatar, renderAvatarInner } from '@navii/core';
import { svgToPng } from './raster.js';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_SEEDS = ['aria', 'milo', 'nova', 'kai', 'sage'];

let cachedPng: Uint8Array | null = null;

export function ogSvg(): string {
  const size = 200;
  const overlap = 0.22;
  const step = size * (1 - overlap);
  const totalW = step * (OG_SEEDS.length - 1) + size;
  const startX = (OG_WIDTH - totalW) / 2;
  const y = 90;

  const tiles = OG_SEEDS.map((seed, i) => {
    const spec = selectAvatar(seed);
    const inner = renderAvatarInner(spec, { size });
    const x = startX + i * step;
    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 100 100">${inner}</svg>`;
  }).join('');

  // Font stack: DejaVu Sans ships in the Docker runtime; the others are
  // fallbacks for local dev. Resvg picks the first font it can resolve.
  const sans = `'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  const mono = `'DejaVu Sans Mono', 'Menlo', monospace`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <radialGradient id="ogBg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#1c1c22" />
      <stop offset="100%" stop-color="#0a0a0b" />
    </radialGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#ogBg)" />
  ${tiles}
  <text x="${OG_WIDTH / 2}" y="430" font-family="${sans}" font-size="72" font-weight="700" fill="#f5f5f5" text-anchor="middle" letter-spacing="-2">Every user, <tspan fill="#c084fc">a face.</tspan></text>
  <text x="${OG_WIDTH / 2}" y="490" font-family="${sans}" font-size="28" fill="#a1a1aa" text-anchor="middle">Deterministic mascot avatars from a seed.</text>
  <text x="${OG_WIDTH / 2}" y="575" font-family="${mono}" font-size="22" fill="#71717a" text-anchor="middle">navii.uxderrick.com</text>
</svg>`;
}

export async function ogPng(): Promise<Uint8Array> {
  if (cachedPng) return cachedPng;
  cachedPng = await svgToPng(ogSvg(), OG_WIDTH);
  return cachedPng;
}
