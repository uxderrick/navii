import {
  renderAccessory,
  renderAntenna,
  renderBackground,
  renderBody,
  renderBodyDefs,
  renderEyes,
  renderMouth,
  renderTopper,
  renderOutfit,
} from './parts/index.js';
import { ANCHORS, type FaceAnchor } from './parts/anchor.js';
import { renderAnimationStyle } from './animate.js';
import { escapeXml } from './xml.js';
import { createRng } from './prng.js';
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
  if (spec.renderMode === 'workspace-glyph') {
    return renderWorkspaceGlyph(spec, options);
  }

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

  const strokeMul = spec.featureStroke ?? 1;
  const antennaSvg = renderAntenna(spec.antenna, anchor, spec.palette);
  const accessorySvg = renderAccessory(spec.accessory, spec.palette, anchor, { strokeMul });

  const flat = spec.flat === true;
  const glow = spec.glow === true;
  const glowId = `navii-glow-${id}`;
  const bodyMarkup = renderBody(spec.body, spec.palette, gradId, { flat });
  // Flat-mode bodies (e.g. full-bleed Office squircle) ignore the seeded
  // bodyScale so they don't clip out of the viewport or pull in from edges.
  const effectiveBodyScale = flat ? 1 : (spec.bodyScale ?? 1);
  const bodyTransform = transformBody(effectiveBodyScale, anchor);
  const bodyFilter = spec.hueShift && spec.hueShift !== 0 ? ` filter="url(#${hueId})"` : '';
  const bodyWrapped = `<g${bodyTransform}${bodyFilter}><g class="body">${bodyMarkup}</g></g>`;

  // Glow layer — duplicate body path, blurred + brightened, painted BEHIND the
  // sharp body. Creates the cyberpunk halo for Neon. Uses palette.bodyFrom as
  // the glow color so it picks up each palette's signature hue.
  const glowLayer = glow
    ? `<g${bodyTransform} filter="url(#${glowId})" opacity="0.85"><g class="body-glow">${bodyMarkup.replace(/fill="url\(#[^"]+\)"/g, `fill="${spec.palette.bodyFrom}"`)}</g></g>`
    : '';

  const antennaWrapped = antennaSvg
    ? `<g${transformAntenna(spec.antennaTilt ?? 0, anchor)}><g class="antenna">${antennaSvg}</g></g>`
    : '';

  const tileBg = resolveTileBg(options.tileBg, spec.palette);
  const tileCircle = tileBg ? `<circle cx="50" cy="50" r="50" fill="${tileBg}" />` : '';

  const outfitSvg = renderOutfit(spec.outfit ?? 'none', anchor, spec.palette);

  // Pack-level opaque plate overrides the seeded background entirely. Used by
  // Office to force a pure-white ID-badge backdrop regardless of seed.
  const packPlate = spec.bgColor
    ? `<rect x="0" y="0" width="100" height="100" fill="${spec.bgColor}" />`
    : '';
  const backgroundMarkup = spec.bgColor
    ? '' // pack plate replaces the seeded background
    : renderBackground(spec.background, spec.palette, bgOverride);

  const parts = [
    tileCircle,
    packPlate,
    backgroundMarkup,
    glowLayer,
    bodyWrapped,
    // outfit sits on the body but below the face, so face features stay readable
    outfitSvg,
    renderTopper(spec.topper, anchor, spec.palette),
    wrap('eyes', renderEyes(spec.eyes, spec.palette, anchor, { strokeMul })),
    renderMouth(spec.mouth, spec.palette, anchor, spec.mouthCurveScale ?? 1, { strokeMul }),
    antennaWrapped,
    accessorySvg && spec.accessory === 'sparkle'
      ? wrap('sparkle', accessorySvg)
      : accessorySvg,
  ].join('');

  const defs = [
    renderBodyDefs(spec.body, spec.palette, gradId, { flat }),
    spec.hueShift && spec.hueShift !== 0
      ? `<filter id="${hueId}" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="${spec.hueShift}" /></filter>`
      : '',
    glow
      ? `<filter id="${glowId}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>`
      : '',
  ].join('');

  return [
    `<defs>${defs}</defs>`,
    animated ? renderAnimationStyle(spec, scopeClass) : '',
    animated ? `<g class="${scopeClass}">${parts}</g>` : parts,
  ].join('');
}

function renderWorkspaceGlyph(spec: AvatarSpec, options: AvatarOptions = {}): string {
  const rng = createRng(`workspace-glyph:${spec.seed}`);
  const tileBg = resolveTileBg(options.tileBg, spec.palette);
  const plate = tileBg ?? spec.bgColor ?? '#F7F8FA';
  const ink = spec.palette.ink;
  const accent = spec.palette.accent;
  const soft = spec.palette.blush;
  const body = spec.palette.bodyFrom;
  const radius = Math.round(rng.range(16, 24));
  const dot = {
    x: Number(rng.range(63, 70).toFixed(1)),
    y: Number(rng.range(31, 38).toFixed(1)),
  };
  const mark = rng.next() < 0.5
    ? `<circle cx="${dot.x}" cy="${dot.y}" r="3" fill="${soft}" opacity="0.82" />`
    : `<rect x="${Number((dot.x - 7).toFixed(1))}" y="${Number((dot.y - 1.5).toFixed(1))}" width="12" height="3" rx="1.5" fill="${accent}" opacity="0.76" />`;

  return [
    `<g data-navii-render="workspace-glyph">`,
    `<rect x="0" y="0" width="100" height="100" fill="${plate}" />`,
    `<rect x="18" y="18" width="64" height="64" rx="${radius}" fill="${body}" stroke="${accent}" stroke-width="1" opacity="0.96" />`,
    mark,
    `<circle cx="50" cy="50" r="${Number(rng.range(2.4, 3.4).toFixed(1))}" fill="${ink}" opacity="0.82" />`,
    `</g>`,
  ].join('');
}

function resolveTileBg(raw: string | undefined, palette: { accent: string; bodyFrom: string }): string | undefined {
  if (!raw) return undefined;
  if (raw === 'auto') return escapeXml(palette.accent);
  return escapeXml(raw);
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
