import type { OutfitId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

/**
 * Outfit = chest/neck-area decoration that sits BELOW the face but on top
 * of the body silhouette. Anchored to the bottom-front of the body so it
 * reads as "worn", not "floating".
 *
 * Z-order: rendered AFTER body + face but BEFORE accessories (so a
 * sunflower boutonnière sits on top of the body but a sparkle accessory
 * can still hover above the chest).
 */
export function renderOutfit(id: OutfitId, anchor: FaceAnchor, palette: Palette): string {
  if (id === 'none') return '';

  // Chest anchor: centered horizontally on the body, vertically positioned
  // just below the chin (~70% down from mouth to ground).
  const cx = anchor.cx;
  const cy = anchor.mouthY + (anchor.groundY - anchor.mouthY) * 0.55;
  const ink = palette.ink;
  const accent = palette.accent;

  switch (id) {
    case 'collar':
      // Two short triangles meeting at center — dress shirt collar peek
      return [
        `<path d="M${cx - 9} ${cy} L${cx - 2} ${cy - 4} L${cx - 2} ${cy + 5} Z" fill="${accent}" stroke="${ink}" stroke-width="0.7" />`,
        `<path d="M${cx + 9} ${cy} L${cx + 2} ${cy - 4} L${cx + 2} ${cy + 5} Z" fill="${accent}" stroke="${ink}" stroke-width="0.7" />`,
        // tiny button at center
        `<circle cx="${cx}" cy="${cy + 4}" r="0.9" fill="${ink}" />`,
      ].join('');

    case 'scarf':
      // Wrap with two tails hanging
      return [
        // wrap band
        `<path d="M${cx - 14} ${cy - 2} Q${cx} ${cy + 3} ${cx + 14} ${cy - 2} L${cx + 14} ${cy + 3} Q${cx} ${cy + 8} ${cx - 14} ${cy + 3} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />`,
        // tail 1 (left)
        `<path d="M${cx - 6} ${cy + 5} L${cx - 9} ${cy + 12} L${cx - 4} ${cy + 12} L${cx - 2} ${cy + 5} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.5" />`,
        // tail 2 (slightly right)
        `<path d="M${cx + 1} ${cy + 6} L${cx + 4} ${cy + 13} L${cx - 1} ${cy + 13} L${cx - 2} ${cy + 6} Z" fill="${palette.bodyFrom}" stroke="${ink}" stroke-width="0.5" />`,
      ].join('');

    case 'bowtie':
      // Two triangles meeting at a center knot
      return [
        // left wing
        `<path d="M${cx - 1} ${cy} L${cx - 9} ${cy - 4} L${cx - 9} ${cy + 4} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.7" />`,
        // right wing
        `<path d="M${cx + 1} ${cy} L${cx + 9} ${cy - 4} L${cx + 9} ${cy + 4} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.7" />`,
        // center knot
        `<rect x="${cx - 1.4}" y="${cy - 2.4}" width="2.8" height="4.8" rx="0.8" fill="${palette.bodyFrom}" stroke="${ink}" stroke-width="0.5" />`,
      ].join('');

    case 'sunflower':
      // Sunflower boutonnière pinned to chest (off-center, like a real one)
      {
        const fx = cx - 8;
        const fy = cy + 2;
        const petals: string[] = [];
        // 8 petals around center
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const px = fx + Math.cos(a) * 3.2;
          const py = fy + Math.sin(a) * 3.2;
          petals.push(
            `<ellipse cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" rx="2.4" ry="1.3" fill="#FACC15" stroke="${ink}" stroke-width="0.35" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${px.toFixed(2)} ${py.toFixed(2)})" />`,
          );
        }
        return [
          // stem (tucked behind)
          `<path d="M${fx + 2} ${fy + 2} Q${fx + 4} ${fy + 6} ${fx + 1} ${fy + 10}" stroke="#16A34A" stroke-width="1.1" fill="none" stroke-linecap="round" />`,
          // leaf
          `<path d="M${fx + 3} ${fy + 6} Q${fx + 7} ${fy + 4} ${fx + 6} ${fy + 8} Q${fx + 4} ${fy + 8} ${fx + 3} ${fy + 6} Z" fill="#22C55E" stroke="${ink}" stroke-width="0.35" />`,
          ...petals,
          // center disc
          `<circle cx="${fx}" cy="${fy}" r="2" fill="#92400E" stroke="${ink}" stroke-width="0.4" />`,
          // texture dots on disc
          `<circle cx="${fx - 0.6}" cy="${fy - 0.5}" r="0.4" fill="#451A03" />`,
          `<circle cx="${fx + 0.7}" cy="${fy + 0.3}" r="0.4" fill="#451A03" />`,
          `<circle cx="${fx - 0.4}" cy="${fy + 0.8}" r="0.4" fill="#451A03" />`,
        ].join('');
      }

    case 'necklace':
      // Thin curved chain w/ a small pendant
      return [
        // chain (curve from collarbone left → drop → right)
        `<path d="M${cx - 10} ${cy} Q${cx} ${cy + 8} ${cx + 10} ${cy}" stroke="${accent}" stroke-width="0.8" fill="none" stroke-linecap="round" />`,
        // pendant
        `<circle cx="${cx}" cy="${cy + 7}" r="1.6" fill="${accent}" stroke="${ink}" stroke-width="0.5" />`,
        `<circle cx="${cx}" cy="${cy + 7}" r="0.7" fill="${palette.blush}" />`,
      ].join('');

    case 'tie':
      // Necktie — small knot at neckline + tapered blade hanging below.
      // Dressy / corporate signal. Uses palette.bodyTo as tie color, palette.accent
      // as the shirt collar peek behind it.
      {
        const knotTop = cy - 3;
        const knotBot = cy + 1;
        return [
          // Shirt-collar peek behind the tie (so tie reads as worn over a shirt)
          `<path d="M${cx - 11} ${cy - 2} L${cx - 3} ${knotBot} L${cx + 3} ${knotBot} L${cx + 11} ${cy - 2} L${cx + 6} ${cy + 6} L${cx - 6} ${cy + 6} Z" fill="${accent}" stroke="${ink}" stroke-width="0.55" />`,
          // Knot — small trapezoid centered
          `<path d="M${cx - 3.2} ${knotTop} L${cx + 3.2} ${knotTop} L${cx + 2.4} ${knotBot} L${cx - 2.4} ${knotBot} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.5" />`,
          // Blade — narrower at top, widens, then pointed tip at bottom
          `<path d="M${cx - 2.4} ${knotBot} L${cx + 2.4} ${knotBot} L${cx + 3.4} ${cy + 6} L${cx + 2.8} ${cy + 12} L${cx} ${cy + 15} L${cx - 2.8} ${cy + 12} L${cx - 3.4} ${cy + 6} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.5" />`,
          // Subtle highlight stripe down the blade
          `<path d="M${cx} ${knotBot + 0.5} L${cx} ${cy + 13.5}" stroke="${ink}" stroke-width="0.35" opacity="0.35" />`,
        ].join('');
      }

    case 'patternedCollar':
      return [
        `<path d="M${cx - 15} ${cy - 3} Q${cx} ${cy + 5} ${cx + 15} ${cy - 3} L${cx + 12} ${cy + 5} Q${cx} ${cy + 12} ${cx - 12} ${cy + 5} Z" fill="${accent}" stroke="${ink}" stroke-width="0.6" />`,
        `<rect x="${cx - 10}" y="${cy + 1}" width="4" height="5" fill="${palette.bodyTo}" opacity="0.9" />`,
        `<rect x="${cx - 3}" y="${cy + 3}" width="4" height="5" fill="${palette.ink}" opacity="0.82" />`,
        `<rect x="${cx + 4}" y="${cy + 1}" width="4" height="5" fill="${palette.bodyFrom}" opacity="0.9" />`,
      ].join('');
  }
}
