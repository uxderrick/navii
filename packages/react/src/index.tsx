import * as React from 'react';
import { createAvatar, type AvatarOptions, type StyleHint } from '@usenavii/core';

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
  background,
  title,
  animated,
  className,
  style,
  styleHint,
  alt,
}: NaviiProps): React.ReactElement {
  const dataUri = React.useMemo(() => {
    const opts: AvatarOptions = { size };
    if (paletteId !== undefined) opts.paletteId = paletteId;
    if (background !== undefined) opts.background = background;
    if (title !== undefined) opts.title = title;
    if (animated !== undefined) opts.animated = animated;
    if (styleHint !== undefined) opts.style = styleHint;
    const svg = createAvatar(seed, opts);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [seed, size, paletteId, background, title, animated, styleHint]);

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

export { createAvatar, selectAvatar, renderAvatar } from '@usenavii/core';
export type { AvatarSpec, AvatarOptions, Palette } from '@usenavii/core';
