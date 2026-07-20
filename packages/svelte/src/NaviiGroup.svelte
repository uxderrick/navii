<script lang="ts">
  import SVG from '@mhaadi/svg/svelte';
  import { renderGroup, renderGroupTiles, type GroupOptions, type StyleHint } from '@usenavii/core';

  let {
    seeds,
    size = 64,
    overlap = 0.3,
    max,
    ring,
    tileBg,
    counterFill,
    counterInk,
    as = 'svg',
    paletteId,
    palette,
    background,
    mood,
    animated,
    packs,
    styleHint,
    sanitize = false,
    alt,
    class: className,
    style,
  }: {
    seeds: string[];
    size?: number;
    overlap?: number;
    max?: number;
    ring?: string;
    tileBg?: string;
    counterFill?: string;
    counterInk?: string;
    as?: 'svg' | 'img';
    paletteId?: string;
    palette?: GroupOptions['palette'];
    background?: GroupOptions['background'];
    mood?: GroupOptions['mood'];
    animated?: boolean;
    packs?: readonly string[];
    styleHint?: StyleHint;
    sanitize?: boolean;
    alt?: string;
    class?: string;
    style?: string;
  } = $props();

  const groupOpts = $derived.by((): GroupOptions => {
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
  });

  const tiles = $derived.by(() => {
    if (seeds.length === 0) return null;
    return renderGroupTiles(seeds, groupOpts);
  });

  const step = $derived(size * (1 - Math.max(0, Math.min(0.7, overlap))));
  const allTiles = $derived(tiles ? (tiles.counter ? [...tiles.tiles, tiles.counter] : tiles.tiles) : []);
  const label = $derived(alt ?? `Group of ${seeds.length} avatars`);
  const dataUri = $derived(tiles ? `data:image/svg+xml;utf8,${encodeURIComponent(renderGroup(seeds, groupOpts))}` : '');
</script>

{#if tiles === null}
  <!-- empty seeds -->
{:else if as === 'img'}
  <img src={dataUri} width={tiles.width} height={tiles.height} alt={label} class={className} {style} />
{:else}
  <div
    class={className}
    style={`position: relative; width: ${tiles.width}px; height: ${tiles.height}px;${style ? ` ${style}` : ''}`}
    role={label ? 'img' : undefined}
    aria-label={label}
  >
    {#each allTiles as tile, i}
      <div style={`position: absolute; left: ${i * step}px; top: 0; width: ${size}px; height: ${size}px;`}>
        <SVG src={tile} width={size} height={size} {sanitize} />
      </div>
    {/each}
  </div>
{/if}
