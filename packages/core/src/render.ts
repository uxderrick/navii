import {
  renderAccessory,
  renderAntenna,
  renderBackground,
  renderBody,
  renderBodyDefs,
  renderEyes,
  renderMouth,
  renderTopper,
} from './parts/index.js';
import { ANCHORS } from './parts/anchor.js';
import { renderAnimationStyle } from './animate.js';
import type { AvatarOptions, AvatarSpec } from './types.js';

/**
 * AvatarSpec → SVG string.
 *
 * Output is a self-contained <svg> element. The gradient id is namespaced with
 * a hash of the seed so multiple Navii avatars can coexist on the same page
 * without id collisions. When `options.animated` is true, an inline <style>
 * block is emitted with seeded delays so a grid desyncs naturally.
 */
export function renderAvatar(spec: AvatarSpec, options: AvatarOptions = {}): string {
  const size = options.size ?? 96;
  const animated = options.animated === true;
  const gradId = `navii-grad-${stableId(spec.seed)}`;
  const bgOverride = typeof options.background === 'object' ? options.background.color : undefined;
  const anchor = ANCHORS[spec.body];

  const titleAttrs = options.title
    ? ` role="img" aria-label="${escapeXml(options.title)}"`
    : ' aria-hidden="true"';

  const antennaSvg = renderAntenna(spec.antenna, anchor, spec.palette);
  const accessorySvg = renderAccessory(spec.accessory, spec.palette, anchor);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"${titleAttrs}>`,
    options.title ? `<title>${escapeXml(options.title)}</title>` : '',
    `<defs>${renderBodyDefs(spec.body, spec.palette, gradId)}</defs>`,
    animated ? renderAnimationStyle(spec) : '',
    renderBackground(spec.background, spec.palette, bgOverride),
    wrap('n-body', animated, renderBody(spec.body, spec.palette, gradId)),
    renderTopper(spec.topper, anchor, spec.palette),
    wrap('n-eyes', animated, renderEyes(spec.eyes, spec.palette, anchor)),
    renderMouth(spec.mouth, spec.palette, anchor),
    antennaSvg ? wrap('n-antenna', animated, antennaSvg) : '',
    accessorySvg && spec.accessory === 'sparkle'
      ? wrap('n-sparkle', animated, accessorySvg)
      : accessorySvg,
    `</svg>`,
  ].join('');
}

function wrap(cls: string, animated: boolean, inner: string): string {
  if (!animated || !inner) return inner;
  return `<g class="${cls}">${inner}</g>`;
}

function stableId(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
