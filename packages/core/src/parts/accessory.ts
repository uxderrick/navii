import type { AccessoryId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

export function renderAccessory(
  id: AccessoryId,
  palette: Palette,
  anchor: FaceAnchor,
  opts?: { strokeMul?: number },
): string {
  const sw = opts?.strokeMul ?? 1;
  const routeYellow = '#F5C51B';
  const kenyaGreen = '#00843D';
  const kenyaRed = '#C8102E';
  const matatuBlack = '#101820';
  const paperWhite = '#F8F7EF';
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

    case 'yellowGlasses': {
      const lx = anchor.cx - anchor.eyeOffset;
      const rx = anchor.cx + anchor.eyeOffset;
      const y = anchor.eyeY;
      const r = 6;
      const gw = 1.3 * sw;
      return [
        `<circle cx="${lx}" cy="${y}" r="${r}" fill="none" stroke="#F5C51B" stroke-width="${gw}" />`,
        `<circle cx="${rx}" cy="${y}" r="${r}" fill="none" stroke="#F5C51B" stroke-width="${gw}" />`,
        `<line x1="${lx + r}" y1="${y}" x2="${rx - r}" y2="${y}" stroke="#F5C51B" stroke-width="${gw}" />`,
        `<circle cx="${lx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
        `<circle cx="${rx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
      ].join('');
    }

    case 'greenPin': {
      const x = anchor.cx + 13;
      const y = anchor.cheekY + 10;
      return [
        `<circle cx="${x}" cy="${y}" r="${3.2 * sw}" fill="#008753" stroke="${palette.ink}" stroke-width="${0.45 * sw}" />`,
        `<rect x="${x - 1}" y="${y - 3}" width="2" height="6" fill="#F8F7EF" opacity="0.96" />`,
      ].join('');
    }

    case 'routeDot': {
      const x = anchor.cx - 13;
      const y = anchor.cheekY + 10;
      return [
        `<circle cx="${x}" cy="${y}" r="${3.3 * sw}" fill="#F5C51B" stroke="${palette.ink}" stroke-width="${0.5 * sw}" />`,
        `<circle cx="${x}" cy="${y}" r="${1.1 * sw}" fill="#111827" opacity="0.9" />`,
      ].join('');
    }

    case 'brightGlasses': {
      const lx = anchor.cx - anchor.eyeOffset;
      const rx = anchor.cx + anchor.eyeOffset;
      const y = anchor.eyeY;
      const r = 6;
      const gw = 1.35 * sw;
      return [
        `<circle cx="${lx}" cy="${y}" r="${r}" fill="none" stroke="${paperWhite}" stroke-width="${gw}" />`,
        `<circle cx="${rx}" cy="${y}" r="${r}" fill="none" stroke="${routeYellow}" stroke-width="${gw}" />`,
        `<line x1="${lx + r}" y1="${y}" x2="${rx - r}" y2="${y}" stroke="${kenyaGreen}" stroke-width="${gw}" />`,
        `<circle cx="${lx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
        `<circle cx="${rx}" cy="${y}" r="${r - 1}" fill="#FFFFFF" opacity="0.16" />`,
        `<path d="M${lx - 2} ${y - 8} L${lx + 2} ${y - 8}" stroke="${kenyaRed}" stroke-width="${0.9 * sw}" stroke-linecap="round" />`,
      ].join('');
    }

    case 'kenyaPin': {
      const x = anchor.cx + 13;
      const y = anchor.cheekY + 10;
      return [
        `<circle cx="${x}" cy="${y}" r="${3.4 * sw}" fill="${matatuBlack}" stroke="${palette.ink}" stroke-width="${0.45 * sw}" />`,
        `<rect x="${x - 2.6}" y="${y - 1.8}" width="5.2" height="1.2" fill="${kenyaRed}" opacity="0.98" />`,
        `<rect x="${x - 2.6}" y="${y + 0.4}" width="5.2" height="1.2" fill="${kenyaGreen}" opacity="0.98" />`,
        `<rect x="${x - 2.6}" y="${y - 0.4}" width="5.2" height="0.8" fill="${paperWhite}" opacity="0.98" />`,
      ].join('');
    }

    case 'matatuMark': {
      const x = anchor.cx - 13;
      const y = anchor.cheekY + 10;
      return [
        `<rect x="${x - 5}" y="${y - 4}" width="10" height="7" rx="1.2" fill="${routeYellow}" stroke="${palette.ink}" stroke-width="${0.45 * sw}" />`,
        `<text x="${x}" y="${y + 1.1}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="5" font-weight="800" fill="${matatuBlack}">46</text>`,
        `<circle cx="${x - 4.2}" cy="${y + 4.1}" r="${0.8 * sw}" fill="${kenyaGreen}" />`,
        `<circle cx="${x + 4.2}" cy="${y + 4.1}" r="${0.8 * sw}" fill="${kenyaRed}" />`,
      ].join('');
    }
  }

  function dot(cx: number, cy: number, color: string): string {
    return `<circle cx="${cx}" cy="${cy}" r="0.85" fill="${color}" opacity="0.55" />`;
  }

  function sparkle(cx: number, cy: number, s: number, p: Palette): string {
    return `<path d="M${cx} ${cy - s} L${cx + s * 0.3} ${cy - s * 0.3} L${cx + s} ${cy} L${cx + s * 0.3} ${cy + s * 0.3} L${cx} ${cy + s} L${cx - s * 0.3} ${cy + s * 0.3} L${cx - s} ${cy} L${cx - s * 0.3} ${cy - s * 0.3} Z" fill="${p.accent}" stroke="${p.ink}" stroke-width="0.3" opacity="0.9" />`;
  }
}
