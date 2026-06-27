<script lang="ts">
  import { SVG } from '@mhaadi/svg/svelte';
  import { createAvatar, type AvatarOptions, type StyleHint } from '@usenavii/core';

  let {
    seed,
    size = 96,
    as = 'svg',
    paletteId,
    palette,
    background,
    title,
    animated,
    mood,
    packs,
    styleHint,
    sanitize = false,
    alt,
    class: className,
    style,
  }: {
    seed: string;
    size?: number;
    as?: 'svg' | 'img';
    paletteId?: string;
    palette?: AvatarOptions['palette'];
    background?: AvatarOptions['background'];
    title?: string;
    animated?: boolean;
    mood?: AvatarOptions['mood'];
    packs?: readonly string[];
    styleHint?: StyleHint;
    sanitize?: boolean;
    alt?: string;
    class?: string;
    style?: string;
  } = $props();

  const svg = $derived.by(() => {
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
  });

  const hasLabel = $derived(Boolean(alt || title));
  const dataUri = $derived(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
</script>

{#if as === 'img'}
  <img src={dataUri} width={size} height={size} alt={alt ?? title ?? ''} class={className} {style} />
{:else}
  <SVG
    src={svg}
    width={size}
    height={size}
    class={className}
    {style}
    {sanitize}
    role={hasLabel ? 'img' : undefined}
    aria-label={hasLabel ? (alt ?? title) : undefined}
    aria-hidden={hasLabel ? undefined : true}
  />
{/if}
