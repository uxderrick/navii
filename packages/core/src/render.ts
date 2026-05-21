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
import { ANCHORS, type FaceAnchor } from './parts/anchor.js';
import { renderAnimationStyle } from './animate.js';
import type { AvatarOptions, AvatarSpec } from './types.js';

/**
 * AvatarSpec → SVG string.
 *
 * Output is a self-contained <svg> element. Gradient + filter ids are
 * namespaced with a hash of the seed so multiple Navii avatars can coexist
 * on the same page without id collisions. When `options.animated` is true,
 * an inline <style> block is emitted with seeded delays so a grid desyncs
 * naturally.
 *
 * Continuous params (hueShift, bodyScale, eyeGapShift, mouthCurveScale,
 * antennaTilt) are applied here so each avatar reads as an individual,
 * not a stamped-out combination of discrete picks.
 *
 * For composing multiple avatars into one SVG (groups), use `renderAvatarInner`
 * which omits the outer <svg> wrapper.
 */
export function renderAvatar(spec: AvatarSpec, options: AvatarOptions = {}): string {
  const size = options.size ?? 96;
  const titleAttrs = options.title
    ? ` role="img" aria-label="${escapeXml(options.title)}"`
    : ' aria-hidden="true"';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"${titleAttrs}>`,
    options.title ? `<title>${escapeXml(options.title)}</title>` : '',
    renderAvatarInner(spec, options),
    `</svg>`,
  ].join('');
}

export function renderAvatarInner(spec: AvatarSpec, options: AvatarOptions = {}): string {
  const animated = options.animated === true;
  const id = stableId(spec.seed);
  const scopeClass = `n-${id}`;
  const gradId = `navii-grad-${id}`;
  const hueId = `navii-hue-${id}`;
  const bgOverride = typeof options.background === 'object' ? options.background.color : undefined;

  const baseAnchor = ANCHORS[spec.body];
  const anchor: FaceAnchor = {
    ...baseAnchor,
    eyeOffset: baseAnchor.eyeOffset + (spec.eyeGapShift ?? 0),
  };

  const antennaSvg = renderAntenna(spec.antenna, anchor, spec.palette);
  const accessorySvg = renderAccessory(spec.accessory, spec.palette, anchor);

  const bodyMarkup = renderBody(spec.body, spec.palette, gradId);
  const bodyTransform = transformBody(spec.bodyScale ?? 1, anchor);
  const bodyFilter = spec.hueShift && spec.hueShift !== 0 ? ` filter="url(#${hueId})"` : '';
  const bodyWrapped = `<g${bodyTransform}${bodyFilter}><g class="body">${bodyMarkup}</g></g>`;

  const antennaWrapped = antennaSvg
    ? `<g${transformAntenna(spec.antennaTilt ?? 0, anchor)}><g class="antenna">${antennaSvg}</g></g>`
    : '';

  const parts = [
    renderBackground(spec.background, spec.palette, bgOverride),
    bodyWrapped,
    renderTopper(spec.topper, anchor, spec.palette),
    wrap('eyes', renderEyes(spec.eyes, spec.palette, anchor)),
    renderMouth(spec.mouth, spec.palette, anchor, spec.mouthCurveScale ?? 1),
    antennaWrapped,
    accessorySvg && spec.accessory === 'sparkle'
      ? wrap('sparkle', accessorySvg)
      : accessorySvg,
  ].join('');

  const defs = [
    renderBodyDefs(spec.body, spec.palette, gradId),
    spec.hueShift && spec.hueShift !== 0
      ? `<filter id="${hueId}" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="${spec.hueShift}" /></filter>`
      : '',
  ].join('');

  return [
    `<defs>${defs}</defs>`,
    animated ? renderAnimationStyle(spec, scopeClass) : '',
    animated ? `<g class="${scopeClass}">${parts}</g>` : parts,
  ].join('');
}

function transformBody(scale: number, anchor: FaceAnchor): string {
  if (Math.abs(scale - 1) < 0.001) return '';
  // Scale around the body's ground point so the figure doesn't drift up/down.
  return ` transform="translate(${anchor.cx} ${anchor.groundY}) scale(${scale}) translate(${-anchor.cx} ${-anchor.groundY})"`;
}

function transformAntenna(deg: number, anchor: FaceAnchor): string {
  if (deg === 0) return '';
  return ` transform="rotate(${deg} ${anchor.topperX} ${anchor.topperY + 2})"`;
}

function wrap(cls: string, inner: string): string {
  if (!inner) return inner;
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
