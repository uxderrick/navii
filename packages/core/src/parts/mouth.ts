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
  }
}
