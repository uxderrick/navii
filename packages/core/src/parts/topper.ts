import type { Palette, TopperId } from '../types.js';
import type { FaceAnchor } from './anchor.js';

/**
 * Topper = the layer that sits behind/above the body silhouette: ears, horns,
 * tufts, caps. This is independent from antenna (which is a small spark).
 * Toppers significantly increase identity diversity.
 */
export function renderTopper(id: TopperId, anchor: FaceAnchor, palette: Palette): string {
  if (id === 'none') return '';

  const cx = anchor.topperX;
  const topY = anchor.topperY;
  const ink = palette.ink;

  switch (id) {
    case 'ears':
      // Pointy ears flanking the apex
      return [
        `<path d="M${cx - 16} ${topY + 6} L${cx - 11} ${topY - 5} L${cx - 6} ${topY + 8} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />`,
        `<path d="M${cx + 6} ${topY + 8} L${cx + 11} ${topY - 5} L${cx + 16} ${topY + 6} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />`,
        // inner ear blush
        `<path d="M${cx - 14} ${topY + 4} L${cx - 11} ${topY - 1} L${cx - 8} ${topY + 5} Z" fill="${palette.blush}" opacity="0.65" />`,
        `<path d="M${cx + 8} ${topY + 5} L${cx + 11} ${topY - 1} L${cx + 14} ${topY + 4} Z" fill="${palette.blush}" opacity="0.65" />`,
      ].join('');

    case 'roundEars':
      return [
        `<circle cx="${cx - 13}" cy="${topY + 2}" r="6" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />`,
        `<circle cx="${cx + 13}" cy="${topY + 2}" r="6" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />`,
        `<circle cx="${cx - 13}" cy="${topY + 2}" r="3" fill="${palette.blush}" opacity="0.6" />`,
        `<circle cx="${cx + 13}" cy="${topY + 2}" r="3" fill="${palette.blush}" opacity="0.6" />`,
      ].join('');

    case 'horn':
      // Single short horn off-center
      return [
        `<path d="M${cx - 1} ${topY + 2} Q${cx} ${topY - 6} ${cx + 4} ${topY - 10} Q${cx + 6} ${topY - 4} ${cx + 3} ${topY + 2} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" />`,
      ].join('');

    case 'horns':
      // Two stubby horns
      return [
        `<path d="M${cx - 7} ${topY + 4} Q${cx - 8} ${topY - 4} ${cx - 4} ${topY - 7} Q${cx - 2} ${topY - 1} ${cx - 3} ${topY + 4} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" />`,
        `<path d="M${cx + 3} ${topY + 4} Q${cx + 2} ${topY - 1} ${cx + 4} ${topY - 7} Q${cx + 8} ${topY - 4} ${cx + 7} ${topY + 4} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" />`,
      ].join('');

    case 'tuft':
      // Hair tuft / single curl
      return [
        `<path d="M${cx} ${topY + 2} Q${cx - 2} ${topY - 4} ${cx + 1} ${topY - 8} Q${cx + 6} ${topY - 5} ${cx + 4} ${topY + 1} Z" fill="${ink}" opacity="0.85" />`,
      ].join('');

    case 'cap':
      // Beanie / cap
      return [
        `<path d="M${cx - 16} ${topY + 6} Q${cx - 16} ${topY - 8} ${cx} ${topY - 8} Q${cx + 16} ${topY - 8} ${cx + 16} ${topY + 6} Z" fill="${palette.ink}" opacity="0.92" />`,
        `<rect x="${cx - 16}" y="${topY + 5}" width="32" height="2.5" rx="1" fill="${palette.accent}" opacity="0.85" />`,
        `<circle cx="${cx}" cy="${topY - 9}" r="2.2" fill="${palette.accent}" stroke="${ink}" stroke-width="0.5" />`,
      ].join('');

    case 'leaf':
      // Small leaf sprig — wholesome
      return [
        `<path d="M${cx - 1} ${topY + 2} Q${cx - 6} ${topY - 4} ${cx - 1} ${topY - 8} Q${cx + 3} ${topY - 4} ${cx - 1} ${topY + 2} Z" fill="#22C55E" stroke="${ink}" stroke-width="0.4" opacity="0.95" />`,
        `<path d="M${cx + 1} ${topY + 2} Q${cx + 5} ${topY - 2} ${cx + 6} ${topY - 6}" stroke="#16A34A" stroke-width="1" fill="none" stroke-linecap="round" />`,
      ].join('');

    case 'headband':
      // Sweatband across forehead
      return [
        `<path d="M${cx - 18} ${topY + 8} Q${cx} ${topY + 2} ${cx + 18} ${topY + 8} L${cx + 18} ${topY + 12} Q${cx} ${topY + 6} ${cx - 18} ${topY + 12} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 2}" y="${topY + 4}" width="4" height="4" rx="1" fill="${palette.accent}" stroke="${ink}" stroke-width="0.4" />`,
      ].join('');

    case 'halo':
      // Floating ring above head
      return [
        `<ellipse cx="${cx}" cy="${topY - 6}" rx="11" ry="2.5" fill="none" stroke="#FACC15" stroke-width="2" opacity="0.95" />`,
        `<ellipse cx="${cx}" cy="${topY - 6}" rx="8.5" ry="1.6" fill="none" stroke="#FDE68A" stroke-width="0.6" opacity="0.7" />`,
      ].join('');

    case 'crown':
      // Three-point crown
      return [
        `<path d="M${cx - 11} ${topY + 4} L${cx - 11} ${topY - 4} L${cx - 6} ${topY + 1} L${cx} ${topY - 7} L${cx + 6} ${topY + 1} L${cx + 11} ${topY - 4} L${cx + 11} ${topY + 4} Z" fill="#FACC15" stroke="${ink}" stroke-width="0.7" />`,
        `<circle cx="${cx - 11}" cy="${topY - 4}" r="1.4" fill="#EF4444" stroke="${ink}" stroke-width="0.3" />`,
        `<circle cx="${cx}" cy="${topY - 7}" r="1.6" fill="#EF4444" stroke="${ink}" stroke-width="0.3" />`,
        `<circle cx="${cx + 11}" cy="${topY - 4}" r="1.4" fill="#EF4444" stroke="${ink}" stroke-width="0.3" />`,
      ].join('');

    case 'antlers':
      // Branching antlers
      return [
        `<path d="M${cx - 5} ${topY + 4} L${cx - 6} ${topY - 4} M${cx - 6} ${topY - 4} L${cx - 10} ${topY - 6} M${cx - 6} ${topY - 4} L${cx - 6} ${topY - 9} M${cx - 6} ${topY - 9} L${cx - 8} ${topY - 11} M${cx - 6} ${topY - 9} L${cx - 3} ${topY - 11}" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" fill="none" />`,
        `<path d="M${cx + 5} ${topY + 4} L${cx + 6} ${topY - 4} M${cx + 6} ${topY - 4} L${cx + 10} ${topY - 6} M${cx + 6} ${topY - 4} L${cx + 6} ${topY - 9} M${cx + 6} ${topY - 9} L${cx + 8} ${topY - 11} M${cx + 6} ${topY - 9} L${cx + 3} ${topY - 11}" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" fill="none" />`,
      ].join('');
  }
}
