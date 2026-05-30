import * as React from 'react';
import {
  createAvatar,
  renderGroup,
  type AvatarOptions,
  type GroupOptions,
  type MoodId,
  type Palette,
  type StyleHint,
} from '@usenavii/core';

export interface NaviiProps extends Omit<AvatarOptions, 'style'> {
  seed: string;
  className?: string;
  /** Standard React inline styles applied to the rendered `<img>`. */
  style?: React.CSSProperties;
  /** Engine-level style hint (masc / femme / neutral) — biases seeded picks. */
  styleHint?: StyleHint;
  alt?: string;
}



/**
 * Drop-in React avatar. Renders the engine output as a data-URI SVG image so
 * the SVG markup is treated as opaque by the browser (no inline scripting
 * surface). Memoized on seed + options.
 */
export function Navii({
  seed,
  size = 96,
  paletteId,
  palette,
  background,
  title,
  animated,
  mood,
  className,
  style,
  styleHint,
  alt,
}: NaviiProps): React.ReactElement {
  const dataUri = React.useMemo(() => {
    const opts: AvatarOptions = { size };
    if (paletteId !== undefined) opts.paletteId = paletteId;
    if (palette !== undefined) opts.palette = palette;
    if (background !== undefined) opts.background = background;
    if (title !== undefined) opts.title = title;
    if (animated !== undefined) opts.animated = animated;
    if (mood !== undefined) opts.mood = mood;
    if (styleHint !== undefined) opts.style = styleHint;
    const svg = createAvatar(seed, opts);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [seed, size, paletteId, palette, background, title, animated, mood, styleHint]);

  return (
    <img
      src={dataUri}
      width={size}
      height={size}
      alt={alt ?? title ?? ''}
      className={className}
      style={style}
    />
  );
}

export interface NaviiGroupProps extends Omit<GroupOptions, 'style'> {
  seeds: string[];
  className?: string;
  /** Standard React inline styles applied to the rendered `<img>`. */
  style?: React.CSSProperties;
  /** Engine-level style hint — biases seeded picks per tile. */
  styleHint?: StyleHint;
  /** Accessible label for the whole stack. Defaults to "Group of N avatars". */
  alt?: string;
}

/**
 * Overlapping avatar stack — wraps core's `renderGroup()` as a data-URI image.
 * Same per-tile determinism as `<Navii>`: identical seed + options → identical
 * pixel output. Width is computed from `size`, `overlap`, and `max` so the
 * `<img>` element gets correct intrinsic dimensions for layout.
 */
export function NaviiGroup({
  seeds,
  size = 64,
  overlap = 0.3,
  max,
  ring,
  tileBg,
  counterFill,
  counterInk,
  paletteId,
  palette,
  background,
  mood,
  animated,
  className,
  style,
  styleHint,
  alt,
}: NaviiGroupProps): React.ReactElement | null {
  const stableSeeds = React.useMemo(() => seeds, [seeds.join('')]);

  const dataUri = React.useMemo(() => {
    if (stableSeeds.length === 0) return '';
    const opts: GroupOptions = { size, overlap };
    if (max !== undefined) opts.max = max;
    if (ring !== undefined) opts.ring = ring;
    if (tileBg !== undefined) opts.tileBg = tileBg;
    if (counterFill !== undefined) opts.counterFill = counterFill;
    if (counterInk !== undefined) opts.counterInk = counterInk;
    if (paletteId !== undefined) opts.paletteId = paletteId;
    if (palette !== undefined) opts.palette = palette;
    if (background !== undefined) opts.background = background;
    if (mood !== undefined) opts.mood = mood;
    if (animated !== undefined) opts.animated = animated;
    if (styleHint !== undefined) opts.style = styleHint;
    const svg = renderGroup(stableSeeds, opts);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [stableSeeds, size, overlap, max, ring, tileBg, counterFill, counterInk, paletteId, palette, background, mood, animated, styleHint]);

  // Width mirrors core's renderGroup math so the <img> has correct intrinsic
  // dimensions. If a counter tile is shown (seeds.length > max), it counts as
  // one of the visible tiles.
  const { width, height } = React.useMemo(() => {
    if (stableSeeds.length === 0) return { width: 0, height: 0 };
    const cap = max ?? stableSeeds.length;
    const overflow = stableSeeds.length > cap;
    const visible = Math.max(0, cap - (overflow ? 1 : 0));
    const tileCount = visible + (overflow ? 1 : 0);
    const step = size * (1 - Math.max(0, Math.min(0.7, overlap)));
    const w = tileCount > 0 ? step * (tileCount - 1) + size : 0;
    return { width: w, height: size };
  }, [stableSeeds, size, overlap, max]);

  if (stableSeeds.length === 0) return null;

  return (
    <img
      src={dataUri}
      width={width}
      height={height}
      alt={alt ?? `Group of ${stableSeeds.length} avatars`}
      className={className}
      style={style}
    />
  );
}

export {
  createAvatar,
  selectAvatar,
  renderAvatar,
  renderGroup,
  seed,
  seedFromEmail,
  normalizeEmail,
} from '@usenavii/core';
export type {
  AvatarSpec,
  AvatarOptions,
  GroupOptions,
  MoodId,
  Palette,
  SeedFields,
  SeedOptions,
} from '@usenavii/core';
