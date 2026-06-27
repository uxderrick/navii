import * as React from 'react';
import { SVG as SvgRoot } from '@mhaadi/svg/react';
import {
  createAvatar,
  renderGroup,
  renderGroupTiles,
  type AvatarOptions,
  type GroupOptions,
  type GroupTiles,
  type MoodId,
  type Palette,
  type StyleHint,
} from '@usenavii/core';

export interface NaviiProps extends Omit<AvatarOptions, 'style'> {
  seed: string;
  /** Render mode. `'svg'` (default) renders an inline `<svg>` via `@mhaadi/svg`
   *  with full CSS animation support. `'img'` falls back to the original
   *  `<img src="data:image/svg+xml;...">` shape — useful for CDN prefetch,
   *  download attributes, or contexts where an `<img>` is expected. */
  as?: 'svg' | 'img';
  className?: string;
  /** Standard React inline styles applied to the rendered root element. */
  style?: React.CSSProperties;
  /** Engine-level style hint (masc / femme / neutral) — biases seeded picks. */
  styleHint?: StyleHint;
  /** Run better-svg's sanitizer on the engine output. Default `false` — the
   *  engine already XML-escapes every dynamic field and emits no
   *  `<script>`/event handlers. Flip on if composing untrusted SVG into the
   *  same pipeline. */
  sanitize?: boolean;
  /** Rendered while the SVG is being parsed. Forwarded to `@mhaadi/svg`. */
  loading?: React.ReactNode;
  /** Rendered when parsing fails. Forwarded to `@mhaadi/svg`. */
  fallback?: React.ReactNode;
  /** Called once the SVG markup is resolved. Forwarded to `@mhaadi/svg`. */
  onSvgLoad?: (markup: string) => void;
  /** Called when loading or parsing fails. Forwarded to `@mhaadi/svg`. */
  onSvgError?: (error: Error) => void;
  alt?: string;
}

/**
 * Drop-in React avatar. Renders the engine output as an inline `<svg>` via
 * `@mhaadi/svg` so CSS animations and `<title>` accessibility work natively
 * in the DOM. Pass `as="img"` for the data-URI `<img>` shape. Memoized on
 * seed + options.
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
  packs,
  as = 'svg',
  className,
  style,
  styleHint,
  sanitize = false,
  loading,
  fallback,
  onSvgLoad,
  onSvgError,
  alt,
}: NaviiProps): React.ReactElement {
  const svg = React.useMemo(() => {
    const opts: AvatarOptions = { size };
    if (paletteId !== undefined) opts.paletteId = paletteId;
    if (palette !== undefined) opts.palette = palette;
    if (background !== undefined) opts.background = background;
    if (title !== undefined) opts.title = title;
    if (animated !== undefined) opts.animated = animated;
    if (mood !== undefined) opts.mood = mood;
    if (packs !== undefined) opts.packs = packs;
    if (styleHint !== undefined) opts.style = styleHint;
    return createAvatar(seed, opts);
  }, [seed, size, paletteId, palette, background, title, animated, mood, packs, styleHint]);

  if (as === 'img') {
    return (
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        width={size}
        height={size}
        alt={alt ?? title ?? ''}
        className={className}
        style={style}
      />
    );
  }

  const hasLabel = Boolean(alt || title);
  const svgProps = {
    src: svg,
    width: size,
    height: size,
    className,
    style,
    sanitize,
    ...(hasLabel ? { role: 'img' as const, 'aria-label': alt ?? title } : { 'aria-hidden': true }),
    ...(loading !== undefined ? { loading } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(onSvgLoad !== undefined ? { onSvgLoad } : {}),
    ...(onSvgError !== undefined ? { onSvgError } : {}),
  };

  return <SvgRoot {...svgProps} />;
}

export interface NaviiGroupProps extends Omit<GroupOptions, 'style'> {
  seeds: string[];
  /** Render mode. `'svg'` (default) renders each tile as an inline `<svg>`
   *  via `@mhaadi/svg`, positioned absolutely inside a wrapper `<div>`.
   *  `'img'` falls back to the composite data-URI `<img>`. */
  as?: 'svg' | 'img';
  className?: string;
  /** Standard React inline styles applied to the wrapper element. */
  style?: React.CSSProperties;
  /** Engine-level style hint — biases seeded picks per tile. */
  styleHint?: StyleHint;
  /** Run better-svg's sanitizer on each tile. Default `false`. */
  sanitize?: boolean;
  /** Forwarded to `@mhaadi/svg` for each tile. */
  loading?: React.ReactNode;
  /** Forwarded to `@mhaadi/svg` for each tile. */
  fallback?: React.ReactNode;
  /** Forwarded to `@mhaadi/svg` for each tile. */
  onSvgLoad?: (markup: string) => void;
  /** Forwarded to `@mhaadi/svg` for each tile. */
  onSvgError?: (error: Error) => void;
  /** Accessible label for the whole stack. Defaults to "Group of N avatars". */
  alt?: string;
}

/**
 * Overlapping avatar stack. Renders each tile as an independent inline `<svg>`
 * via `@mhaadi/svg`, positioned absolutely inside a wrapper `<div>` so each
 * tile can be cached/sanitized/animated independently. Pass `as="img"` for the
 * composite data-URI `<img>` shape. Same per-tile determinism as `<Navii>`:
 * identical seed + options → identical pixel output.
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
  packs,
  as = 'svg',
  className,
  style,
  styleHint,
  sanitize = false,
  loading,
  fallback,
  onSvgLoad,
  onSvgError,
  alt,
}: NaviiGroupProps): React.ReactElement | null {
  const stableSeeds = React.useMemo(() => seeds, [seeds.join('\0')]);

  const groupOpts = React.useMemo<GroupOptions>(() => {
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
    if (packs !== undefined) opts.packs = packs;
    if (styleHint !== undefined) opts.style = styleHint;
    return opts;
  }, [size, overlap, max, ring, tileBg, counterFill, counterInk, paletteId, palette, background, mood, animated, packs, styleHint]);

  const tiles = React.useMemo<GroupTiles | null>(() => {
    if (stableSeeds.length === 0) return null;
    return renderGroupTiles(stableSeeds, groupOpts);
  }, [stableSeeds, groupOpts]);

  if (!tiles) return null;

  if (as === 'img') {
    return (
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(renderGroup(stableSeeds, groupOpts))}`}
        width={tiles.width}
        height={tiles.height}
        alt={alt ?? `Group of ${stableSeeds.length} avatars`}
        className={className}
        style={style}
      />
    );
  }

  const step = size * (1 - Math.max(0, Math.min(0.7, overlap)));
  const all = tiles.counter ? [...tiles.tiles, tiles.counter] : tiles.tiles;
  const label = alt ?? (alt === undefined ? `Group of ${stableSeeds.length} avatars` : undefined);

  const tileProps = {
    src: '',
    width: size,
    height: size,
    sanitize,
    ...(loading !== undefined ? { loading } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(onSvgLoad !== undefined ? { onSvgLoad } : {}),
    ...(onSvgError !== undefined ? { onSvgError } : {}),
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', width: tiles.width, height: tiles.height, ...style }}
      {...(label ? { role: 'img', 'aria-label': label } : {})}
    >
      {all.map((tile, i) => (
        <div
          key={i}
          style={{ position: 'absolute', left: i * step, top: 0, width: size, height: size }}
        >
          <SvgRoot {...tileProps} src={tile} />
        </div>
      ))}
    </div>
  );
}

export {
  createAvatar,
  selectAvatar,
  renderAvatar,
  renderGroup,
  renderGroupTiles,
  seed,
  seedFromEmail,
  normalizeEmail,
} from '@usenavii/core';
export type {
  AvatarSpec,
  AvatarOptions,
  GroupOptions,
  GroupTiles,
  MoodId,
  Palette,
  SeedFields,
  SeedOptions,
} from '@usenavii/core';
