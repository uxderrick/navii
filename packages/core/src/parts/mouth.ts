import type { MouthStyleId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

export function renderMouth(
  id: MouthStyleId,
  palette: Palette,
  anchor: FaceAnchor,
  curveScale = 1,
  opts?: { strokeMul?: number },
): string {
  const cx = anchor.cx;
  const y = anchor.mouthY;
  const w = anchor.mouthSpan * curveScale;
  const ink = palette.ink;
  const sw = opts?.strokeMul ?? 1;
  const base = 1.8 * sw;

  switch (id) {
    case 'smile':
      return `<path d="M${cx - w} ${y} Q${cx} ${y + 5} ${cx + w} ${y}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`;
    case 'grin':
      return `<path d="M${cx - w - 1} ${y - 2} Q${cx} ${y + 7} ${cx + w + 1} ${y - 2}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`;
    case 'open':
      return [
        `<path d="M${cx - w - 1} ${y - 2} Q${cx} ${y + 9} ${cx + w + 1} ${y - 2}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="${ink}" fill-opacity="0.55" />`,
        `<ellipse cx="${cx}" cy="${y + 3}" rx="${w * 0.55}" ry="1.8" fill="#F472B6" opacity="0.75" />`,
      ].join('');
    case 'flat':
      return `<path d="M${cx - w + 1} ${y} L${cx + w - 1} ${y}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`;
    case 'smirk':
      return `<path d="M${cx - w} ${y} Q${cx} ${y + 3} ${cx + w + 1} ${y - 2}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`;
    case 'awe':
      return `<ellipse cx="${cx}" cy="${y + 1}" rx="${w * 0.45}" ry="3.2" fill="${ink}" opacity="0.85" />`;

    case 'tongue':
      return [
        `<path d="M${cx - w} ${y} Q${cx} ${y + 6} ${cx + w} ${y}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`,
        `<path d="M${cx - 2} ${y + 4} Q${cx} ${y + 9} ${cx + 2} ${y + 4} Z" fill="#F472B6" stroke="${ink}" stroke-width="${0.6 * sw}" />`,
      ].join('');

    case 'tooth':
      return [
        `<path d="M${cx - w} ${y} Q${cx} ${y + 5} ${cx + w} ${y}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`,
        `<rect x="${cx - 1.2}" y="${y + 0.4}" width="2.4" height="2.6" rx="0.4" fill="#FFFFFF" stroke="${ink}" stroke-width="${0.4 * sw}" />`,
      ].join('');

    case 'wave':
      // Wavy mouth (silly / playful)
      return `<path d="M${cx - w} ${y + 1} Q${cx - w / 2} ${y - 1.5} ${cx} ${y + 1} Q${cx + w / 2} ${y + 3.5} ${cx + w} ${y + 1}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`;

    case 'dot':
      // Tiny dot mouth — radius scales with stroke multiplier
      return `<circle cx="${cx}" cy="${y + 1}" r="${1.2 * sw}" fill="${ink}" />`;

    case 'jagged': {
      // Carved-pumpkin grin — zigzag with sharp triangular teeth.
      // Filled silhouette in ink so it reads at small sizes.
      const half = w + 1;
      const top = y - 1;
      const bot = y + 5;
      // 5 alternating peaks across the span
      const step = (half * 2) / 8;
      const x0 = cx - half;
      const points: string[] = [];
      points.push(`${x0} ${top}`);
      for (let i = 1; i <= 8; i++) {
        const px = x0 + step * i;
        const py = i % 2 === 1 ? bot : top;
        points.push(`${px.toFixed(2)} ${py}`);
      }
      return `<path d="M${points.join(' L')} L${cx + half} ${top} Z" fill="${ink}" />`;
    }

    case 'fangs': {
      // Small straight-line mouth with two pointy fangs hanging down.
      const half = w - 1;
      return [
        `<path d="M${cx - half} ${y} L${cx + half} ${y}" stroke="${ink}" stroke-width="${base}" stroke-linecap="round" fill="none" />`,
        // Left fang
        `<path d="M${cx - 2.5} ${y + 0.4} L${cx - 1.2} ${y + 4.5} L${cx - 0.2} ${y + 0.4} Z" fill="#FFFFFF" stroke="${ink}" stroke-width="${0.5 * sw}" />`,
        // Right fang
        `<path d="M${cx + 0.2} ${y + 0.4} L${cx + 1.2} ${y + 4.5} L${cx + 2.5} ${y + 0.4} Z" fill="#FFFFFF" stroke="${ink}" stroke-width="${0.5 * sw}" />`,
      ].join('');
    }
  }
}
