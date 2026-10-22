import { createComponent, createMemo, For, mergeProps, Show, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { SVG as SvgRoot, type SvgProps } from '@mhaadi/svg/solid';
import { createAvatar, renderGroup, renderGroupTiles, type AvatarOptions, type GroupOptions, type GroupTiles, type StyleHint } from '@usenavii/core';

interface PresentationProps {
  as?: 'svg' | 'img';
  class?: string;
  style?: string;
  styleHint?: StyleHint;
  sanitize?: boolean;
  alt?: string;
  loading?: JSX.Element;
  fallback?: JSX.Element;
  onSvgLoad?: (markup: string) => void;
  onSvgError?: (error: Error) => void;
}

export interface NaviiProps extends Omit<AvatarOptions, 'style'>, PresentationProps {
  seed: string;
}

export interface NaviiGroupProps extends Omit<GroupOptions, 'style'>, PresentationProps {
  seeds: string[];
}

function svgPresentation(props: PresentationProps, includeStyle = false): Partial<SvgProps> {
  const { class: className, style, loading, fallback, onSvgLoad, onSvgError } = props;
  return {
    sanitize: props.sanitize ?? false,
    ...(includeStyle && className !== undefined ? { class: className } : {}),
    ...(includeStyle && style !== undefined ? { style } : {}),
    ...(loading !== undefined ? { loading } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(onSvgLoad !== undefined ? { onSvgLoad } : {}),
    ...(onSvgError !== undefined ? { onSvgError } : {}),
  };
}

/** Reactive avatar. Read props inside memos so changing a seed updates the SVG. */
export function Navii(props: NaviiProps): JSX.Element {
  const size = () => props.size ?? 96;
  const svg = createMemo(() => {
    const { seed, as, class: className, style, styleHint, sanitize, alt, loading, fallback, onSvgLoad, onSvgError, ...options } = props;
    return createAvatar(seed, { ...options, size: size(), ...(styleHint !== undefined ? { style: styleHint } : {}) });
  });
  return Show({
    get when() { return props.as === 'img'; },
    get children() {
      return createComponent(Dynamic, {
        component: 'img',
        get src() { return `data:image/svg+xml;utf8,${encodeURIComponent(svg())}`; },
        get width() { return size(); },
        get height() { return size(); },
        get class() { return props.class; },
        get style() { return props.style; },
        get alt() { return props.alt ?? props.title ?? ''; },
      });
    },
    get fallback() {
      return createComponent(SvgRoot, mergeProps(() => svgPresentation(props, true), {
        get src() { return svg(); },
        get width() { return size(); },
        get height() { return size(); },
      }, () => props.alt || props.title
        ? { role: 'img' as const, 'aria-label': props.alt ?? props.title ?? '' }
        : { 'aria-hidden': true }));
    },
  });
}

/** Overlapping avatar stack, with an optional overflow counter and image fallback. */
export function NaviiGroup(props: NaviiGroupProps): JSX.Element {
  const size = () => props.size ?? 64;
  const options = createMemo<GroupOptions>(() => {
    const { seeds, as, class: className, style, styleHint, sanitize, alt, loading, fallback, onSvgLoad, onSvgError, ...options } = props;
    return { ...options, size: size(), ...(styleHint !== undefined ? { style: styleHint } : {}) };
  });
  const tiles = createMemo(() => props.seeds.length ? renderGroupTiles(props.seeds, options()) : undefined);
  const label = () => props.alt ?? `Group of ${props.seeds.length} avatars`;
  const step = () => size() * (1 - Math.max(0, Math.min(0.7, props.overlap ?? 0.3)));

  return Show({
    get when() { return tiles(); },
    keyed: true,
    children: (group) => createComponent(Dynamic, {
      get component() { return props.as === 'img' ? 'img' : 'div'; },
      get src() { return props.as === 'img' ? `data:image/svg+xml;utf8,${encodeURIComponent(renderGroup(props.seeds, options()))}` : undefined; },
      get width() { return props.as === 'img' ? group.width : undefined; },
      get height() { return props.as === 'img' ? group.height : undefined; },
      get alt() { return props.as === 'img' ? label() : undefined; },
      get class() { return props.class; },
      get style() {
        return props.as === 'img' ? props.style : `position:relative;width:${group.width}px;height:${group.height}px;${props.style ?? ''}`;
      },
      get role() { return label() ? 'img' : undefined; },
      get 'aria-label'() { return label() || undefined; },
      get children() {
        if (props.as === 'img') return undefined;
        return For({
          each: group.counter ? [...group.tiles, group.counter] : group.tiles,
          children: (tile, index) => createComponent(Dynamic, {
            component: 'div',
            get style() { return `position:absolute;left:${index() * step()}px;top:0;width:${size()}px;height:${size()}px`; },
            get children() {
              return createComponent(SvgRoot, mergeProps(() => svgPresentation(props), {
                src: tile,
                get width() { return size(); },
                get height() { return size(); },
                'aria-hidden': true,
              }));
            },
          }),
        });
      },
    }),
  });
}

export { createAvatar, selectAvatar, renderAvatar, renderGroup, renderGroupTiles, seed, seedFromEmail, normalizeEmail } from '@usenavii/core';
export type { AvatarSpec, AvatarOptions, GroupOptions, GroupTiles, MoodId, Palette, SeedFields, SeedOptions } from '@usenavii/core';
