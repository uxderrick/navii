export * from './types.js';
export { createRng, cyrb53 } from './prng.js';
export { selectAvatar } from './select.js';
export { renderAvatar, renderAvatarInner } from './render.js';
export { renderGroup, type GroupOptions } from './group.js';
export { seed, type SeedFields } from './seed.js';
export { build, type BuildSpec } from './build.js';

import { selectAvatar } from './select.js';
import { renderAvatar } from './render.js';
import { renderGroup } from './group.js';
import { seed } from './seed.js';
import { build } from './build.js';
import type { AvatarOptions } from './types.js';

/**
 * Render a deterministic mascot avatar from a seed.
 *
 * Same seed in → same SVG out, byte-identical, forever.
 *
 * @param seed Stable unique identifier per user. Recommended order: `user.id`
 *   → UUID → `user.email`. **Avoid display names** — two users called "Alice"
 *   would get the same avatar. **Never pass `Date.now()`** or any value that
 *   changes between renders; the avatar would change every refresh.
 *   See {@link seed} for a helper that picks the right field automatically.
 *
 * @param options.size      Output size in px. Default 96. Range 16–1024.
 * @param options.paletteId Force a color family (e.g. `'mint'`).
 * @param options.background `'none' | 'solid' | 'ring'` or `{ color }`.
 * @param options.tileBg    Opaque disc behind the avatar. Color or `'auto'`.
 * @param options.title     Accessible label (sets `<title>` + `aria-label`).
 * @param options.animated  Emit idle motion (float, blink, sway, twinkle).
 *
 * @returns Self-contained `<svg>` string. Safe to embed via `<img src="data:image/svg+xml;...">`
 *   or to insert into the DOM directly.
 *
 * @example
 * ```ts
 * const svg = createAvatar(user.id, { size: 96, animated: true });
 * ```
 */
export function createAvatar(seed: string, options: AvatarOptions = {}): string {
  if (typeof seed !== 'string' || seed.length === 0) {
    throw new Error('navii: seed must be a non-empty string');
  }
  return renderAvatar(selectAvatar(seed, options), options);
}

/**
 * Convenience namespace — bundles every public function under one import.
 *
 * @example
 * ```ts
 * import { Navii } from '@usenavii/core';
 *
 * Navii.create(user.id);
 * Navii.seed({ id: user.id, email: user.email });
 * Navii.build({ body: 'tall', eyes: 'star', palette: 'violet' });
 * Navii.group([user1.id, user2.id, user3.id]);
 * ```
 */
export const Navii = {
  create: createAvatar,
  render: renderAvatar,
  select: selectAvatar,
  group: renderGroup,
  seed,
  build,
} as const;
