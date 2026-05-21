import type { AccessoryId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

export function renderAccessory(id: AccessoryId, palette: Palette, anchor: FaceAnchor): string {
  switch (id) {
    case 'none':
      return '';
    case 'blush': {
      const lx = anchor.cx - anchor.cheekOffset;
      const rx = anchor.cx + anchor.cheekOffset;
      const y = anchor.cheekY;
      return [
        `<ellipse cx="${lx}" cy="${y}" rx="3.6" ry="2.2" fill="${palette.blush}" opacity="0.5" />`,
        `<ellipse cx="${rx}" cy="${y}" rx="3.6" ry="2.2" fill="${palette.blush}" opacity="0.5" />`,
      ].join('');
    }
    case 'freckles': {
      const lx = anchor.cx - 8;
      const rx = anchor.cx + 8;
      const y = anchor.cheekY;
      return [
        dot(lx, y, palette.ink),
        dot(lx + 3, y + 1.5, palette.ink),
        dot(rx, y, palette.ink),
        dot(rx - 3, y + 1.5, palette.ink),
      ].join('');
    }
    case 'sparkle':
      return [
        sparkle(76, anchor.eyeY - 18, 3, palette),
        sparkle(24, anchor.eyeY - 16, 2.5, palette),
        sparkle(82, anchor.cheekY + 2, 2, palette),
      ].join('');
  }

  function dot(cx: number, cy: number, color: string): string {
    return `<circle cx="${cx}" cy="${cy}" r="0.85" fill="${color}" opacity="0.55" />`;
  }

  function sparkle(cx: number, cy: number, s: number, p: Palette): string {
    return `<path d="M${cx} ${cy - s} L${cx + s * 0.3} ${cy - s * 0.3} L${cx + s} ${cy} L${cx + s * 0.3} ${cy + s * 0.3} L${cx} ${cy + s} L${cx - s * 0.3} ${cy + s * 0.3} L${cx - s} ${cy} L${cx - s * 0.3} ${cy - s * 0.3} Z" fill="${p.accent}" stroke="${p.ink}" stroke-width="0.3" opacity="0.9" />`;
  }
}
