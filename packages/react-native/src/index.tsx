import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SVG as SvgRoot } from '@mhaadi/svg/react-native';
import {
  createAvatar,
  renderGroup,
  renderGroupTiles,
  type AvatarOptions,
  type GroupOptions,
  type GroupTiles,
  type StyleHint,
} from '@usenavii/core';

export interface NaviiProps extends Omit<AvatarOptions, 'style'> {
  seed: string;
  className?: never;
  style?: StyleProp<ViewStyle>;
  styleHint?: StyleHint;
  sanitize?: boolean;
  loading?: React.ReactNode;
  fallback?: React.ReactNode;
  onSvgLoad?: (markup: string) => void;
  onSvgError?: (error: Error) => void;
  alt?: string;
}

/**
 * React Native avatar. Renders the engine output as a `react-native-svg` tree
 * via `@mhaadi/svg/react-native`. Animation (`animated` prop) is not yet
 * supported on React Native — the first frame is rendered statically.
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

  const svgProps = {
    src: svg,
    width: size,
    height: size,
    sanitize,
    ...(loading !== undefined ? { loading } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(onSvgLoad !== undefined ? { onSvgLoad } : {}),
    ...(onSvgError !== undefined ? { onSvgError } : {}),
  };

  return (
    <View
      style={style}
      accessibilityLabel={alt ?? title}
      accessibilityRole={alt || title ? 'image' : undefined}
    >
      <SvgRoot {...svgProps} />
    </View>
  );
}

export interface NaviiGroupProps extends Omit<GroupOptions, 'style'> {
  seeds: string[];
  style?: StyleProp<ViewStyle>;
  styleHint?: StyleHint;
  sanitize?: boolean;
  loading?: React.ReactNode;
  fallback?: React.ReactNode;
  onSvgLoad?: (markup: string) => void;
  onSvgError?: (error: Error) => void;
  alt?: string;
}

/**
 * Overlapping avatar stack for React Native. Renders each tile as an
 * independent `react-native-svg` tree inside a positioned `View`.
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

  const step = size * (1 - Math.max(0, Math.min(0.7, overlap)));
  const all = tiles.counter ? [...tiles.tiles, tiles.counter] : tiles.tiles;

  const tileProps = {
    width: size,
    height: size,
    sanitize,
    ...(loading !== undefined ? { loading } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(onSvgLoad !== undefined ? { onSvgLoad } : {}),
    ...(onSvgError !== undefined ? { onSvgError } : {}),
  };

  return (
    <View
      style={[{ position: 'relative', width: tiles.width, height: tiles.height }, style] as StyleProp<ViewStyle>}
      accessibilityLabel={alt ?? `Group of ${stableSeeds.length} avatars`}
      accessibilityRole="image"
    >
      {all.map((tile, i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: i * step, top: 0, width: size, height: size }}
        >
          <SvgRoot {...tileProps} src={tile} />
        </View>
      ))}
    </View>
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
