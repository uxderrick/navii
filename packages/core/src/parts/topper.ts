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

    case 'bob': {
      // Chin-length bob — hair frames forehead + temples. Reads as a hair
      // silhouette on top of the head. Works for full-bleed (Office) and
      // standard bodies — anchored to topperY + extends down to face area.
      const eyeY = anchor.eyeY;
      const tt = topY - 4;            // top of hair
      const bt = eyeY + 6;             // hair drops to mid-cheek level
      return [
        // Main hair cap — slightly asymmetric for soft look
        `<path d="M${cx - 24} ${bt} Q${cx - 26} ${eyeY - 4} ${cx - 22} ${tt + 4} Q${cx - 14} ${tt - 2} ${cx} ${tt - 3} Q${cx + 14} ${tt - 2} ${cx + 22} ${tt + 4} Q${cx + 26} ${eyeY - 4} ${cx + 24} ${bt} Q${cx + 18} ${eyeY + 2} ${cx + 14} ${eyeY - 2} Q${cx} ${eyeY - 8} ${cx - 14} ${eyeY - 2} Q${cx - 18} ${eyeY + 2} ${cx - 24} ${bt} Z" fill="${ink}" opacity="0.92" />`,
        // Subtle highlight strand
        `<path d="M${cx - 14} ${tt + 4} Q${cx - 6} ${tt + 2} ${cx + 2} ${tt + 6}" stroke="${palette.accent}" stroke-width="0.6" fill="none" opacity="0.25" />`,
      ].join('');
    }

    case 'bun': {
      // Top knot bun — small disc above the head, with a soft hair base
      // hugging the crown.
      const baseY = topY + 4;
      const bunY = topY - 8;
      return [
        // Hair base on crown
        `<path d="M${cx - 16} ${baseY} Q${cx} ${topY - 4} ${cx + 16} ${baseY} Q${cx + 12} ${baseY - 4} ${cx} ${baseY - 6} Q${cx - 12} ${baseY - 4} ${cx - 16} ${baseY} Z" fill="${ink}" opacity="0.92" />`,
        // Bun disc
        `<ellipse cx="${cx}" cy="${bunY}" rx="6" ry="5" fill="${ink}" opacity="0.95" />`,
        // Bun wrap detail
        `<ellipse cx="${cx}" cy="${bunY - 0.5}" rx="3.5" ry="2.5" fill="none" stroke="${palette.accent}" stroke-width="0.4" opacity="0.4" />`,
      ].join('');
    }

    case 'witchHat': {
      // Tall pointed witch hat — cone + brim + band w/ buckle. Sits on apex,
      // tilts slightly for stylized silhouette.
      const tipY = topY - 26;
      const baseY = topY + 2;
      return [
        // Cone — slight curve, tilts right
        `<path d="M${cx - 14} ${baseY} Q${cx - 4} ${baseY - 10} ${cx + 4} ${tipY} Q${cx + 2} ${baseY - 4} ${cx + 14} ${baseY} Z" fill="${ink}" opacity="0.96" />`,
        // Brim — wide flat oval w/ slight curve
        `<ellipse cx="${cx}" cy="${baseY + 2}" rx="22" ry="3.4" fill="${ink}" opacity="0.96" />`,
        // Band across cone base
        `<rect x="${cx - 14}" y="${baseY - 4}" width="28" height="3" fill="${palette.accent}" opacity="0.85" />`,
        // Buckle
        `<rect x="${cx - 2}" y="${baseY - 4}" width="4" height="3" fill="${palette.bodyFrom}" stroke="${ink}" stroke-width="0.4" />`,
        // Star/moon sparkle near tip
        `<circle cx="${cx + 2}" cy="${tipY + 6}" r="0.9" fill="${palette.accent}" opacity="0.9" />`,
      ].join('');
    }

    case 'pumpkinStem': {
      // Curled green stem + small leaf — sits on top of a pumpkin body.
      return [
        // Main stem — slightly curved
        `<path d="M${cx - 2} ${topY + 4} Q${cx} ${topY - 2} ${cx + 1} ${topY - 8} L${cx + 3} ${topY - 8} Q${cx + 4} ${topY} ${cx + 2} ${topY + 4} Z" fill="#3F6F2C" stroke="${ink}" stroke-width="0.5" />`,
        // Leaf curling off
        `<path d="M${cx + 3} ${topY - 4} Q${cx + 9} ${topY - 8} ${cx + 12} ${topY - 4} Q${cx + 8} ${topY - 2} ${cx + 3} ${topY - 2} Z" fill="#4A8035" stroke="${ink}" stroke-width="0.4" />`,
        // Vein on leaf
        `<path d="M${cx + 5} ${topY - 3} L${cx + 11} ${topY - 5}" stroke="#2D5020" stroke-width="0.4" />`,
      ].join('');
    }

    case 'ghostSheet': {
      // Drapey sheet "hood" — extra fabric over the head, suggesting a draped
      // ghost. Two soft fold lines for texture.
      return [
        // Sheet cap — wider than body, hangs lower at sides
        `<path d="M${cx - 22} ${topY + 8} Q${cx - 26} ${topY - 4} ${cx - 14} ${topY - 10} Q${cx} ${topY - 14} ${cx + 14} ${topY - 10} Q${cx + 26} ${topY - 4} ${cx + 22} ${topY + 8} Q${cx + 12} ${topY + 4} ${cx} ${topY + 6} Q${cx - 12} ${topY + 4} ${cx - 22} ${topY + 8} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" opacity="0.9" />`,
        // Fold shadows
        `<path d="M${cx - 12} ${topY - 6} Q${cx - 10} ${topY - 2} ${cx - 14} ${topY + 4}" stroke="${ink}" stroke-width="0.45" fill="none" opacity="0.35" />`,
        `<path d="M${cx + 12} ${topY - 6} Q${cx + 10} ${topY - 2} ${cx + 14} ${topY + 4}" stroke="${ink}" stroke-width="0.45" fill="none" opacity="0.35" />`,
      ].join('');
    }

    case 'ponytail': {
      // Sleek pulled-back hair + side ponytail. Reads as hair (not a helmet)
      // by keeping the forehead hairline tight + giving the tail an obvious
      // tied-off base ring and a long tapered strand.
      const eyeY = anchor.eyeY;
      const fh = eyeY - 7;             // forehead hairline
      const crownY = topY;              // top of head
      const baseX = cx + 18;            // ponytail tie x
      const baseY = crownY + 6;         // ponytail tie y
      return [
        // Sleek hair cap — narrower than bob, hugs the crown, soft hairline.
        `<path d="M${cx - 22} ${fh} Q${cx - 24} ${crownY - 2} ${cx - 12} ${crownY - 4} L${cx + 14} ${crownY - 4} Q${cx + 24} ${crownY} ${cx + 22} ${fh} Q${cx + 10} ${fh - 1} ${cx} ${fh + 2} Q${cx - 10} ${fh - 1} ${cx - 22} ${fh} Z" fill="${ink}" opacity="0.94" />`,
        // Subtle highlight sweeping back toward the tie
        `<path d="M${cx - 12} ${crownY - 2} Q${cx} ${crownY - 3} ${baseX - 2} ${baseY - 2}" stroke="${palette.accent}" stroke-width="0.5" fill="none" opacity="0.3" />`,
        // Ponytail tie — small ring where the hair gathers
        `<ellipse cx="${baseX}" cy="${baseY}" rx="3" ry="2.4" fill="${ink}" opacity="0.95" />`,
        `<ellipse cx="${baseX}" cy="${baseY}" rx="1.4" ry="1.1" fill="${palette.accent}" opacity="0.32" />`,
        // Tail — long tapered strand curving down and slightly out
        `<path d="M${baseX - 1} ${baseY + 2} Q${baseX + 5} ${baseY + 10} ${baseX + 8} ${baseY + 20} Q${baseX + 9} ${baseY + 28} ${baseX + 4} ${baseY + 30} Q${baseX + 1} ${baseY + 22} ${baseX - 3} ${baseY + 12} Z" fill="${ink}" opacity="0.92" />`,
        // Inner highlight following the tail's flow direction
        `<path d="M${baseX + 2} ${baseY + 6} Q${baseX + 5} ${baseY + 16} ${baseX + 6} ${baseY + 24}" stroke="${palette.accent}" stroke-width="0.5" fill="none" opacity="0.25" />`,
      ].join('');
    }
  }
}
