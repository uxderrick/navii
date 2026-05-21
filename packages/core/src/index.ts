export * from './types.js';
export { createRng, cyrb53 } from './prng.js';
export { selectAvatar } from './select.js';
export { renderAvatar, renderAvatarInner } from './render.js';
export { renderGroup, type GroupOptions } from './group.js';

import { selectAvatar } from './select.js';
import { renderAvatar } from './render.js';
import type { AvatarOptions } from './types.js';

/**
 * Convenience: seed → SVG string in one call. Same seed always produces the
 * same output. Pass options to override size, palette, or background.
 */
export function createAvatar(seed: string, options: AvatarOptions = {}): string {
  if (typeof seed !== 'string' || seed.length === 0) {
    throw new Error('navii: seed must be a non-empty string');
  }
  return renderAvatar(selectAvatar(seed, options), options);
}
