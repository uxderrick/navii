import { defineComponent, h, computed, type PropType } from 'vue';
import { SVG as SvgRoot } from '@mhaadi/svg/vue';
import {
  createAvatar,
  renderGroup,
  renderGroupTiles,
  type AvatarOptions,
  type GroupOptions,
  type GroupTiles,
  type StyleHint,
} from '@usenavii/core';

export const Navii = defineComponent({
  name: 'Navii',
  props: {
    seed: { type: String, required: true },
    size: { type: Number, default: 96 },
    as: { type: String as PropType<'svg' | 'img'>, default: 'svg' },
    paletteId: { type: String, default: undefined },
    palette: { type: Object as PropType<AvatarOptions['palette']>, default: undefined },
    background: { type: [String, Object] as PropType<AvatarOptions['background']>, default: undefined },
    title: { type: String, default: undefined },
    animated: { type: Boolean, default: undefined },
    mood: { type: String as PropType<AvatarOptions['mood']>, default: undefined },
    packs: { type: Array as PropType<readonly string[]>, default: undefined },
    styleHint: { type: String as PropType<StyleHint>, default: undefined },
    sanitize: { type: Boolean, default: false },
    alt: { type: String, default: undefined },
    class: { type: String, default: undefined },
    style: { type: [String, Object] as PropType<string | Record<string, string | number>>, default: undefined },
  },
  setup(props) {
    const svg = computed(() => {
      const opts: AvatarOptions = { size: props.size };
      if (props.paletteId !== undefined) opts.paletteId = props.paletteId;
      if (props.palette !== undefined) opts.palette = props.palette;
      if (props.background !== undefined) opts.background = props.background;
      if (props.title !== undefined) opts.title = props.title;
      if (props.animated !== undefined) opts.animated = props.animated;
      if (props.mood !== undefined) opts.mood = props.mood;
      if (props.packs !== undefined) opts.packs = props.packs;
      if (props.styleHint !== undefined) opts.style = props.styleHint;
      return createAvatar(props.seed, opts);
    });

    return () => {
      if (props.as === 'img') {
        return h('img', {
          src: `data:image/svg+xml;utf8,${encodeURIComponent(svg.value)}`,
          width: props.size,
          height: props.size,
          alt: props.alt ?? props.title ?? '',
          class: props.class,
          style: props.style,
        });
      }

      const hasLabel = Boolean(props.alt || props.title);
      const svgProps: Record<string, unknown> = {
        src: svg.value,
        width: props.size,
        height: props.size,
        class: props.class,
        style: props.style,
        sanitize: props.sanitize,
      };
      if (hasLabel) {
        svgProps.role = 'img';
        svgProps['aria-label'] = props.alt ?? props.title;
      } else {
        svgProps['aria-hidden'] = true;
      }

      return h(SvgRoot, svgProps);
    };
  },
});

export const NaviiGroup = defineComponent({
  name: 'NaviiGroup',
  props: {
    seeds: { type: Array as PropType<string[]>, required: true },
    size: { type: Number, default: 64 },
    overlap: { type: Number, default: 0.3 },
    max: { type: Number, default: undefined },
    ring: { type: String, default: undefined },
    tileBg: { type: String, default: undefined },
    counterFill: { type: String, default: undefined },
    counterInk: { type: String, default: undefined },
    as: { type: String as PropType<'svg' | 'img'>, default: 'svg' },
    paletteId: { type: String, default: undefined },
    palette: { type: Object as PropType<AvatarOptions['palette']>, default: undefined },
    background: { type: [String, Object] as PropType<AvatarOptions['background']>, default: undefined },
    mood: { type: String as PropType<AvatarOptions['mood']>, default: undefined },
    animated: { type: Boolean, default: undefined },
    packs: { type: Array as PropType<readonly string[]>, default: undefined },
    styleHint: { type: String as PropType<StyleHint>, default: undefined },
    sanitize: { type: Boolean, default: false },
    alt: { type: String, default: undefined },
    class: { type: String, default: undefined },
    style: { type: [String, Object] as PropType<string | Record<string, string | number>>, default: undefined },
  },
  setup(props) {
    const groupOpts = computed<GroupOptions>(() => {
      const opts: GroupOptions = { size: props.size, overlap: props.overlap };
      if (props.max !== undefined) opts.max = props.max;
      if (props.ring !== undefined) opts.ring = props.ring;
      if (props.tileBg !== undefined) opts.tileBg = props.tileBg;
      if (props.counterFill !== undefined) opts.counterFill = props.counterFill;
      if (props.counterInk !== undefined) opts.counterInk = props.counterInk;
      if (props.paletteId !== undefined) opts.paletteId = props.paletteId;
      if (props.palette !== undefined) opts.palette = props.palette;
      if (props.background !== undefined) opts.background = props.background;
      if (props.mood !== undefined) opts.mood = props.mood;
      if (props.animated !== undefined) opts.animated = props.animated;
      if (props.packs !== undefined) opts.packs = props.packs;
      if (props.styleHint !== undefined) opts.style = props.styleHint;
      return opts;
    });

    const tiles = computed<GroupTiles | null>(() => {
      if (props.seeds.length === 0) return null;
      return renderGroupTiles(props.seeds, groupOpts.value);
    });

    return () => {
      const t = tiles.value;
      if (!t) return null;

      if (props.as === 'img') {
        return h('img', {
          src: `data:image/svg+xml;utf8,${encodeURIComponent(renderGroup(props.seeds, groupOpts.value))}`,
          width: t.width,
          height: t.height,
          alt: props.alt ?? `Group of ${props.seeds.length} avatars`,
          class: props.class,
          style: props.style,
        });
      }

      const step = props.size * (1 - Math.max(0, Math.min(0.7, props.overlap)));
      const all = t.counter ? [...t.tiles, t.counter] : t.tiles;
      const label = props.alt ?? `Group of ${props.seeds.length} avatars`;

      const baseStyle = { position: 'relative', width: t.width, height: t.height };
      const wrapperStyle = typeof props.style === 'string'
        ? `${Object.entries(baseStyle).map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${v}`).join(';')};${props.style}`
        : { ...baseStyle, ...(typeof props.style === 'object' ? props.style : {}) };
      const wrapperProps: Record<string, unknown> = {
        class: props.class,
        style: wrapperStyle,
      };
      if (label) {
        wrapperProps.role = 'img';
        wrapperProps['aria-label'] = label;
      }

      const tileProps: Record<string, unknown> = {
        width: props.size,
        height: props.size,
        sanitize: props.sanitize,
      };

      return h(
        'div',
        wrapperProps,
        all.map((tile, i) =>
          h(
            'div',
            { style: { position: 'absolute', left: `${i * step}px`, top: '0', width: `${props.size}px`, height: `${props.size}px` } },
            h(SvgRoot, { ...tileProps, src: tile }),
          ),
        ),
      );
    };
  },
});

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
