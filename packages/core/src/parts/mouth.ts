import type { MouthStyleId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

export function renderMouth(id: MouthStyleId, palette: Palette, anchor: FaceAnchor, curveScale = 1): string {
  const cx = anchor.cx;
  const y = anchor.mouthY;
  const w = anchor.mouthSpan * curveScale;
  const ink = palette.ink;

  switch (id) {
    case 'smile':
      return `<path d="M${cx - w} ${y} Q${cx} ${y + 5} ${cx + w} ${y}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
    case 'grin':
      return `<path d="M${cx - w - 1} ${y - 2} Q${cx} ${y + 7} ${cx + w + 1} ${y - 2}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
    case 'open':
      return [
        `<path d="M${cx - w - 1} ${y - 2} Q${cx} ${y + 9} ${cx + w + 1} ${y - 2}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="${ink}" fill-opacity="0.55" />`,
        `<ellipse cx="${cx}" cy="${y + 3}" rx="${w * 0.55}" ry="1.8" fill="#F472B6" opacity="0.75" />`,
      ].join('');
    case 'flat':
      return `<path d="M${cx - w + 1} ${y} L${cx + w - 1} ${y}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
    case 'smirk':
      return `<path d="M${cx - w} ${y} Q${cx} ${y + 3} ${cx + w + 1} ${y - 2}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`;
    case 'awe':
      return `<ellipse cx="${cx}" cy="${y + 1}" rx="${w * 0.45}" ry="3.2" fill="${ink}" opacity="0.85" />`;

    case 'tongue':
      return [
        `<path d="M${cx - w} ${y} Q${cx} ${y + 6} ${cx + w} ${y}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`,
        `<path d="M${cx - 2} ${y + 4} Q${cx} ${y + 9} ${cx + 2} ${y + 4} Z" fill="#F472B6" stroke="${ink}" stroke-width="0.6" />`,
      ].join('');

    case 'tooth':
      return [
        `<path d="M${cx - w} ${y} Q${cx} ${y + 5} ${cx + w} ${y}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`,
        `<rect x="${cx - 1.2}" y="${y + 0.4}" width="2.4" height="2.6" rx="0.4" fill="#FFFFFF" stroke="${ink}" stroke-width="0.4" />`,
      ].join('');

    case 'wave':
      // Wavy mouth (silly / playful)
      return `<path d="M${cx - w} ${y + 1} Q${cx - w / 2} ${y - 1.5} ${cx} ${y + 1} Q${cx + w / 2} ${y + 3.5} ${cx + w} ${y + 1}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" />`;

    case 'dot':
      // Tiny dot mouth (cute, minimalist)
      return `<circle cx="${cx}" cy="${y + 1}" r="1.2" fill="${ink}" />`;
  }
}
