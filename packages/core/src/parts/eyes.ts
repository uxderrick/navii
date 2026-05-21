import type { EyeStyleId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

/**
 * Eyes consume the FaceAnchor: position, gap, and vertical scale all flex
 * with the body silhouette. Style id determines shape only.
 */
export function renderEyes(id: EyeStyleId, palette: Palette, anchor: FaceAnchor): string {
  const lx = anchor.cx - anchor.eyeOffset;
  const rx = anchor.cx + anchor.eyeOffset;
  const y = anchor.eyeY;
  const s = anchor.eyeScale;
  const ink = palette.ink;

  switch (id) {
    case 'round':
      return [
        sclera(lx, y, 4 * s, 4.5 * s),
        sclera(rx, y, 4 * s, 4.5 * s),
        pupil(lx, y, 2.2 * s, ink),
        pupil(rx, y, 2.2 * s, ink),
        glint(lx + 1, y - 1),
        glint(rx + 1, y - 1),
      ].join('');

    case 'wide':
      return [
        sclera(lx, y, 5 * s, 5.5 * s),
        sclera(rx, y, 5 * s, 5.5 * s),
        pupil(lx, y + 0.5, 3 * s, ink),
        pupil(rx, y + 0.5, 3 * s, ink),
        glint(lx + 1.2, y - 0.5),
        glint(rx + 1.2, y - 0.5),
      ].join('');

    case 'squint':
      return [
        arc(lx - 4.5, y, lx, y - 3.5, lx + 4.5, y, ink, 1.8),
        arc(rx - 4.5, y, rx, y - 3.5, rx + 4.5, y, ink, 1.8),
      ].join('');

    case 'wink':
      return [
        sclera(lx, y, 4 * s, 4.5 * s),
        pupil(lx, y, 2.2 * s, ink),
        glint(lx + 1, y - 1),
        arc(rx - 4, y, rx, y - 3.5, rx + 4, y, ink, 1.8),
      ].join('');

    case 'sleepy':
      return [
        // Heavier upper lid — half-closed
        `<path d="M${lx - 4} ${y - 0.5} Q${lx} ${y + 2} ${lx + 4} ${y - 0.5}" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" fill="none" />`,
        `<path d="M${rx - 4} ${y - 0.5} Q${rx} ${y + 2} ${rx + 4} ${y - 0.5}" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" fill="none" />`,
        // tiny visible pupils
        `<circle cx="${lx}" cy="${y + 0.5}" r="0.9" fill="${ink}" />`,
        `<circle cx="${rx}" cy="${y + 0.5}" r="0.9" fill="${ink}" />`,
      ].join('');

    case 'star':
      return [starEye(lx, y, ink), starEye(rx, y, ink)].join('');
  }
}

function sclera(cx: number, cy: number, rx: number, ry: number): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF" />`;
}

function pupil(cx: number, cy: number, r: number, color: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
}

function glint(cx: number, cy: number): string {
  return `<circle cx="${cx}" cy="${cy}" r="0.8" fill="#FFFFFF" />`;
}

function arc(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, stroke: string, width: number): string {
  return `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" fill="none" />`;
}

function starEye(cx: number, cy: number, color: string): string {
  const s = 3;
  return `<path d="M${cx} ${cy - s} L${cx + s * 0.35} ${cy - s * 0.35} L${cx + s} ${cy} L${cx + s * 0.35} ${cy + s * 0.35} L${cx} ${cy + s} L${cx - s * 0.35} ${cy + s * 0.35} L${cx - s} ${cy} L${cx - s * 0.35} ${cy - s * 0.35} Z" fill="${color}" />`;
}
