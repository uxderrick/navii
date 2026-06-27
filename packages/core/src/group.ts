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
  /** Optional namespace for clipPath ids. Pass a unique value when rendering
   *  multiple groups with the same seeds on the same page to prevent DOM id
   *  collisions. When omitted, ids are unique within a single group call. */
  groupId?: string;
}

export interface GroupTiles {
  /** Per-tile SVG strings, in render order. Each is a self-contained `<svg>` with nested viewBox. */
  tiles: string[];
  /** Optional "+N" counter tile. undefined when no overflow. */
  counter?: string;
  /** Pixel width of the assembled stack. */
  width: number;
  /** Pixel height of the assembled stack. */
  height: number;
}

/**
 * Renders N seeded avatars in a horizontal overlapping stack, with an optional
 * "+N" counter tile when `max` is exceeded.
 *
 * Each avatar is placed in its own 100x100 viewBox via nested <svg> so the
 * existing renderer is reused without changes. A circular clip per tile
 * crops to a disc — typical avatar UI. Clip ids are auto-unique per call so
 * multiple groups on the same page never collide. Pass `options.groupId` for
 * explicit control over id namespacing. Visual output (shapes, colors,
 * layout) is deterministic; only the clip id strings vary between calls.
 */
export function renderGroup(seeds: string[], options: GroupOptions = {}): string {
  const t = renderGroupTiles(seeds, options);
  return wrapGroupTiles(t);
}

/**
 * Returns per-tile SVG strings instead of a single composite SVG. Enables
 * per-tile rendering in framework adapters (React, React Native, Vue, Svelte)
 * where nested `<svg>` elements are not supported or where independent
 * per-tile caching/sanitization is desirable.
 */
export function renderGroupTiles(seeds: string[], options: GroupOptions = {}): GroupTiles {
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
  const salt = nextGroupId(options);

  const visibleSeeds = seeds.slice(0, Math.max(0, max - (seeds.length > max ? 1 : 0)));
  const overflow = seeds.length - visibleSeeds.length;
  const tileCount = visibleSeeds.length + (overflow > 0 ? 1 : 0);

  const step = size * (1 - overlap);
  const totalWidth = tileCount > 0 ? step * (tileCount - 1) + size : 0;

  const tiles = visibleSeeds.map((seed, i) => {
    const x = i * step;
    const spec = selectAvatar(seed, options);
    const tileId = stableTileId(seed, i, salt);
    const bgCircle = tileBg !== 'transparent'
      ? `<circle cx="50" cy="50" r="50" fill="${tileBg}" />`
      : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="0" width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible">
      <defs><clipPath id="navii-clip-${tileId}"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clip-path="url(#navii-clip-${tileId})">${bgCircle}${renderAvatarInner(spec, options)}</g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="${ring}" stroke-width="2" />
    </svg>`;
  });

  if (overflow > 0) {
    const x = visibleSeeds.length * step;
    const counter = `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="0" width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible">
      <circle cx="50" cy="50" r="50" fill="${counterFill}" />
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, system-ui, sans-serif" font-weight="600" font-size="34" fill="${counterInk}">+${overflow}</text>
      <circle cx="50" cy="50" r="49" fill="none" stroke="${ring}" stroke-width="2" />
    </svg>`;
    return { tiles, counter, width: totalWidth, height: size };
  }

  return { tiles, width: totalWidth, height: size };
}

function wrapGroupTiles(t: GroupTiles): string {
  const all = t.counter ? [...t.tiles, t.counter] : t.tiles;
  if (all.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" aria-hidden="true"></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.width} ${t.height}" width="${t.width}" height="${t.height}" aria-hidden="true">${all.join('')}</svg>`;
}

let groupCallCounter = 0;

function nextGroupId(options: GroupOptions): string {
  if (options.groupId) return `g:${options.groupId}`;
  return `g:auto:${groupCallCounter++}`;
}

function stableTileId(seed: string, index: number, salt: string): string {
  let h = 5381;
  const s = `${salt}:${index}:${seed}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
