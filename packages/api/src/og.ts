/**
 * Open Graph image composer.
 *
 * Builds a 1200×630 SVG: a 5-row × 11-column grid of seeded mascot avatars
 * with the middle row reserved for the headline. Rasterized to PNG and
 * cached in-process since the output never changes.
 */

import { selectAvatar, renderAvatarInner } from '@navii/core';
import { svgToPng } from './raster.js';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

let cachedPng: Uint8Array | null = null;

export function ogSvg(): string {
  const cols = 11;
  const rows = 5;
  const size = 100;
  const gap = 12;
  const totalW = cols * size + (cols - 1) * gap; // 11×100 + 10×12 = 1220
  const totalH = rows * size + (rows - 1) * gap; // 5×100  + 4×12  = 548
  const startX = (OG_WIDTH - totalW) / 2;        // -10 (slight bleed each side)
  const startY = (OG_HEIGHT - totalH) / 2;       // 41

  const textRow = 2; // middle row reserved for the headline (no avatars)

  // DejaVu ships in the Docker runtime; others fall back for local dev.
  const sans = `'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

  const tiles: string[] = [];
  let n = 0;
  for (let r = 0; r < rows; r++) {
    if (r === textRow) continue;
    for (let c = 0; c < cols; c++) {
      const seed = `og-grid-${n++}`;
      const spec = selectAvatar(seed);
      const inner = renderAvatarInner(spec, { size });
      const x = startX + c * (size + gap);
      const y = startY + r * (size + gap);
      tiles.push(
        `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 100 100">${inner}</svg>`,
      );
    }
  }

  const textRowY = startY + textRow * (size + gap);
  // Baseline-positioned y: offset from row center by ~0.35 × font-size so the
  // visual cap-height centers on the row. resvg does not honor
  // `dominant-baseline="middle"` reliably, so we tune y manually.
  const headlineFontSize = 76;
  const headlineY = textRowY + size / 2 + headlineFontSize * 0.34;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <radialGradient id="ogBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1c1c22" />
      <stop offset="100%" stop-color="#0a0a0b" />
    </radialGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#ogBg)" />
  ${tiles.join('\n  ')}
  <text x="${OG_WIDTH / 2}" y="${headlineY}" font-family="${sans}" font-size="${headlineFontSize}" font-weight="700" fill="#f5f5f5" text-anchor="middle" letter-spacing="-2.5">A face for <tspan fill="#c084fc">every user.</tspan></text>
</svg>`;
}

export async function ogPng(): Promise<Uint8Array> {
  if (cachedPng) return cachedPng;
  cachedPng = await svgToPng(ogSvg(), OG_WIDTH);
  return cachedPng;
}
