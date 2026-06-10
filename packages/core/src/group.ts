import { renderAvatarInner } from './render.js';
import { selectAvatar } from './select.js';
import { escapeXml } from './xml.js';
import type { AvatarOptions } from './types.js';

export interface GroupOptions extends AvatarOptions {
  /** Per-avatar size in px. Default 64. */
  size?: number;
  /** Fraction of size each tile overlaps the previous one. 0 = no overlap, 0.6 = heavy stack. Default 0.3. */
  overlap?: number;
  /** Max tiles to render. Extra seeds collapse into a "+N" counter tile. Default = all seeds. */
  max?: number;
  /** Background color for the "+N" counter tile. */
  counterFill?: string;
  /** Text color for the "+N" counter tile. */
  counterInk?: string;
  /** Optional ring around each tile (border). Default: white-ish for visual separation when overlapping. */
  ring?: string;
  /** Solid (or near-solid) fill behind each avatar inside the clip — prevents underlying avatars showing through gaps when tiles overlap. Default `#ffffff`. Use `'transparent'` to skip. */
  tileBg?: string;
}

/**
 * Renders N seeded avatars in a horizontal overlapping stack, with an optional
 * "+N" counter tile when `max` is exceeded.
 *
 * Each avatar is placed in its own 100x100 viewBox via nested <svg> so the
 * existing renderer is reused without changes. A circular clip per tile
 * crops to a disc — typical avatar UI.
 */
export function renderGroup(seeds: string[], options: GroupOptions = {}): string {
  if (!Array.isArray(seeds) || seeds.length === 0) {
    throw new Error('navii: renderGroup requires at least one seed');
  }
  const size = options.size ?? 64;
  const overlap = clamp(options.overlap ?? 0.3, 0, 0.7);
  const max = options.max ?? seeds.length;
  const ring = escapeXml(options.ring ?? '#ffffff');
  const tileBg = escapeXml(options.tileBg ?? '#ffffff');
  const counterFill = escapeXml(options.counterFill ?? '#E5E7EB');
  const counterInk = escapeXml(options.counterInk ?? '#374151');

  const visibleSeeds = seeds.slice(0, Math.max(0, max - (seeds.length > max ? 1 : 0)));
  const overflow = seeds.length - visibleSeeds.length;
  const tileCount = visibleSeeds.length + (overflow > 0 ? 1 : 0);

  const step = size * (1 - overlap);
  const totalWidth = tileCount > 0 ? step * (tileCount - 1) + size : 0;

  // Per-tile clip + ring share generic ids since each is scoped inside its own
  // nested <svg>, isolating ids per tile.
  const tiles = visibleSeeds.map((seed, i) => {
    const x = i * step;
    const spec = selectAvatar(seed, options);
    const bgCircle = tileBg !== 'transparent'
      ? `<circle cx="50" cy="50" r="50" fill="${tileBg}" />`
      : '';
    return `<svg x="${x}" y="0" width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible">
      <defs><clipPath id="navii-clip"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clip-path="url(#navii-clip)">${bgCircle}${renderAvatarInner(spec, options)}</g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="${ring}" stroke-width="2" />
    </svg>`;
  });

  if (overflow > 0) {
    const x = visibleSeeds.length * step;
    tiles.push(`<svg x="${x}" y="0" width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible">
      <circle cx="50" cy="50" r="50" fill="${counterFill}" />
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, system-ui, sans-serif" font-weight="600" font-size="34" fill="${counterInk}">+${overflow}</text>
      <circle cx="50" cy="50" r="49" fill="none" stroke="${ring}" stroke-width="2" />
    </svg>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${size}" width="${totalWidth}" height="${size}" aria-hidden="true">${tiles.join('')}</svg>`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
