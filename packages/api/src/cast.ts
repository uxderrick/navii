import { renderAvatarInner, selectAvatar } from '@usenavii/core';

/**
 * Renders N avatars as a single SVG grid — meant for use as a live README
 * hero, blog embed, or any "show off the cast" surface. Defaults match the
 * landing page's 24-tile cast strip (6 cols × 4 rows).
 *
 * GET /cast.svg
 *   ?seeds=a,b,c,...   comma-separated seeds (defaults to the built-in cast)
 *   &cols=6            grid columns (1–12)
 *   &size=100          per-tile size in px (16–256)
 *   &gap=12            gap between tiles (0–48)
 *   &animated=1        emit idle animations
 */

export const DEFAULT_CAST_SEEDS: readonly string[] = [
  'aria', 'milo', 'nova', 'kai', 'sage', 'eden',
  'luna', 'rio', 'pip', 'wren', 'zane', 'iris',
  'fox', 'jin', 'leo', 'pax', 'roo', 'tava',
  'yumi', 'cass', 'odi', 'hex', 'fae', 'rune',
];

export interface CastOptions {
  cols?: number;
  size?: number;
  gap?: number;
  animated?: boolean;
  bg?: string;
}

export function renderCast(seeds: readonly string[], options: CastOptions = {}): string {
  const cols = Math.max(1, Math.min(12, options.cols ?? 6));
  const size = Math.max(16, Math.min(256, options.size ?? 100));
  const gap = Math.max(0, Math.min(48, options.gap ?? 12));
  const animated = options.animated === true;
  const bg = options.bg ?? 'transparent';

  const rows = Math.ceil(seeds.length / cols);
  const width = cols * size + Math.max(0, cols - 1) * gap;
  const height = rows * size + Math.max(0, rows - 1) * gap;

  const tiles = seeds
    .map((seed, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (size + gap);
      const y = row * (size + gap);
      const spec = selectAvatar(seed);
      const inner = renderAvatarInner(spec, animated ? { animated: true } : {});
      return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 100 100">${inner}</svg>`;
    })
    .join('');

  const bgRect = bg === 'transparent' ? '' : `<rect width="100%" height="100%" fill="${bg}" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${seeds.length} Navii avatars">${bgRect}${tiles}</svg>`;
}
