import type { AccessoryId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

export function renderAccessory(
  id: AccessoryId,
  palette: Palette,
  anchor: FaceAnchor,
  opts?: { strokeMul?: number },
): string {
  const sw = opts?.strokeMul ?? 1;
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

    case 'glasses': {
      // Round-frame glasses over both eyes
      const lx = anchor.cx - anchor.eyeOffset;
      const rx = anchor.cx + anchor.eyeOffset;
      const y = anchor.eyeY;
      const r = 6;
      const gw = 1.2 * sw;
      return [
        `<circle cx="${lx}" cy="${y}" r="${r}" fill="none" stroke="${palette.ink}" stroke-width="${gw}" />`,
        `<circle cx="${rx}" cy="${y}" r="${r}" fill="none" stroke="${palette.ink}" stroke-width="${gw}" />`,
        `<line x1="${lx + r}" y1="${y}" x2="${rx - r}" y2="${y}" stroke="${palette.ink}" stroke-width="${gw}" />`,
        // subtle lens fill
        `<circle cx="${lx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.18" />`,
        `<circle cx="${rx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.18" />`,
      ].join('');
    }

    case 'eyepatch': {
      // Patch over right eye, strap across head
      const rx = anchor.cx + anchor.eyeOffset;
      const y = anchor.eyeY;
      return [
        `<ellipse cx="${rx}" cy="${y}" rx="6" ry="5.2" fill="${palette.ink}" />`,
        `<path d="M${rx - 6} ${y - 4} L${anchor.cx - 18} ${anchor.eyeY - 8}" stroke="${palette.ink}" stroke-width="0.9" />`,
        `<path d="M${rx + 6} ${y - 3} L${anchor.cx + 22} ${anchor.eyeY - 6}" stroke="${palette.ink}" stroke-width="0.9" />`,
      ].join('');
    }

    case 'mole': {
      // Small beauty mark below left cheek
      return `<circle cx="${anchor.cx - anchor.cheekOffset * 0.6}" cy="${anchor.cheekY + 2}" r="0.9" fill="${palette.ink}" />`;
    }

    case 'earring': {
      // Pair of small drop earrings — sit at the outer cheek edge, near jawline
      const ex = anchor.cheekOffset + 4;
      const ey = anchor.cheekY + 4;
      const lx = anchor.cx - ex;
      const rx = anchor.cx + ex;
      return [
        // Left earring — small stud + drop
        `<circle cx="${lx}" cy="${ey}" r="${1.1 * sw}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${0.4 * sw}" />`,
        `<ellipse cx="${lx}" cy="${ey + 3.2}" rx="${1.3 * sw}" ry="${2 * sw}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${0.4 * sw}" />`,
        // Right earring
        `<circle cx="${rx}" cy="${ey}" r="${1.1 * sw}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${0.4 * sw}" />`,
        `<ellipse cx="${rx}" cy="${ey + 3.2}" rx="${1.3 * sw}" ry="${2 * sw}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${0.4 * sw}" />`,
      ].join('');
    }

    case 'goldHoop': {
      const ex = anchor.cheekOffset + 4;
      const ey = anchor.cheekY + 4;
      return [
        `<circle cx="${anchor.cx - ex}" cy="${ey}" r="${2.4 * sw}" fill="none" stroke="${palette.accent}" stroke-width="${0.9 * sw}" />`,
        `<circle cx="${anchor.cx + ex}" cy="${ey}" r="${2.4 * sw}" fill="none" stroke="${palette.accent}" stroke-width="${0.9 * sw}" />`,
      ].join('');
    }

    case 'blackStarPin': {
      const x = anchor.cx + 13;
      const y = anchor.cheekY + 11;
      return `<path d="M${x} ${y - 3.6} L${x + 1.1} ${y - 1.1} L${x + 3.8} ${y - 1.1} L${x + 1.6} ${y + 0.6} L${x + 2.4} ${y + 3.2} L${x} ${y + 1.6} L${x - 2.4} ${y + 3.2} L${x - 1.6} ${y + 0.6} L${x - 3.8} ${y - 1.1} L${x - 1.1} ${y - 1.1} Z" fill="${palette.ink}" opacity="0.88" />`;
    }
  }

  function dot(cx: number, cy: number, color: string): string {
    return `<circle cx="${cx}" cy="${cy}" r="0.85" fill="${color}" opacity="0.55" />`;
  }

  function sparkle(cx: number, cy: number, s: number, p: Palette): string {
    return `<path d="M${cx} ${cy - s} L${cx + s * 0.3} ${cy - s * 0.3} L${cx + s} ${cy} L${cx + s * 0.3} ${cy + s * 0.3} L${cx} ${cy + s} L${cx - s * 0.3} ${cy + s * 0.3} L${cx - s} ${cy} L${cx - s * 0.3} ${cy - s * 0.3} Z" fill="${p.accent}" stroke="${p.ink}" stroke-width="0.3" opacity="0.9" />`;
  }
}
