/**
 * Built-in pack registry.
 *
 * Each pack is its own file so future SVG part data + palette tweaks can be
 * authored in isolation. Adding a new pack = drop a file here + import +
 * export it from this module.
 *
 * Packs ship empty for Day 1 of the pack infrastructure work — palettes +
 * parts are added in follow-up commits. The registry exists so the wiring
 * (selectAvatar, plugin tabs, license gating) can be tested end-to-end
 * before any premium art lands.
 */

import type { Pack, PackRegistry } from './types.js';
import { accraGalleryPack } from './accra-gallery.js';
import { lagosDanfoPack } from './lagos-danfo.js';
import { officePack } from './office.js';
import { officeBrightPack } from './office-bright.js';
import { halloweenPack } from './halloween.js';
import { pastelPack } from './pastel.js';
import { neonPack } from './neon.js';
import { monoPack } from './mono.js';
import { earthPack } from './earth.js';

export type { Pack, PackRegistry } from './types.js';

export const BUILT_IN_PACKS: Pack[] = [
  accraGalleryPack,
  lagosDanfoPack,
  officePack,
  officeBrightPack,
  halloweenPack,
  pastelPack,
  neonPack,
  monoPack,
  earthPack,
];

export const PACK_REGISTRY: PackRegistry = Object.fromEntries(
  BUILT_IN_PACKS.map((p) => [p.id, p]),
);

/** Resolve a list of pack ids to Pack objects, skipping unknown ids. */
export function resolvePacks(ids: readonly string[] | undefined): Pack[] {
  if (!ids || ids.length === 0) return [];
  const seen = new Set<string>();
  const result: Pack[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const pack = PACK_REGISTRY[id];
    if (pack) {
      seen.add(id);
      result.push(pack);
    }
  }
  return result;
}
