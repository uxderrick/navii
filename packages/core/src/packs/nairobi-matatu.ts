import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Nairobi Matatu — premium Nairobi/Kenya avatar identity system.
 *
 * Visual rules:
 * - Dark route-poster plates with electric matatu color
 * - Shuka-inspired checks as restrained bands/collars
 * - Neon route marks, sticker geometry, and high-contrast face details
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'nairobi-matatu:night-green', bodyFrom: '#101820', bodyTo: '#12D977', accent: '#F8F7EF', ink: '#F8F7EF', blush: '#FF2D55' },
  { id: 'nairobi-matatu:route-red', bodyFrom: '#C1121F', bodyTo: '#101820', accent: '#2F80ED', ink: '#F8F7EF', blush: '#FFD23F' },
  { id: 'nairobi-matatu:electric-blue', bodyFrom: '#2F80ED', bodyTo: '#101820', accent: '#FFD23F', ink: '#F8F7EF', blush: '#12D977' },
  { id: 'nairobi-matatu:shuka-check', bodyFrom: '#D72638', bodyTo: '#101820', accent: '#F8F7EF', ink: '#F8F7EF', blush: '#2F80ED' },
  { id: 'nairobi-matatu:safari-neon', bodyFrom: '#F2E8CF', bodyTo: '#0B6E4F', accent: '#FF2D55', ink: '#101820', blush: '#FFD23F' },
];

export const nairobiMatatuPack: Pack = {
  id: 'nairobi-matatu',
  name: 'Nairobi Matatu',
  description: 'Nairobi-inspired avatars with matatu route graphics, dark plates, neon color, and restrained shuka-grid accents.',
  emoji: '▣',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#101820',
  featureStroke: 1.28,
  picks: {
    body: ['matatuBadge', 'routeSticker', 'cityPlaque', 'angledSignTile'],
    eyes: ['round', 'oval', 'wide', 'dot', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'brightGlasses', 'routeDot', 'kenyaPin', 'matatuMark'],
    topper: ['neonRouteBand', 'shukaGridBand', 'stickerCap'],
    background: ['solid'],
    outfit: ['shukaCheckCollar', 'neonTrimCollar', 'routeStripeNecklace'],
  },
  styleHints: {
    masc: {
      outfit: ['neonTrimCollar', 'shukaCheckCollar'],
      accessory: ['none', 'routeDot', 'matatuMark'],
      topper: ['neonRouteBand', 'stickerCap'],
    },
    femme: {
      outfit: ['shukaCheckCollar', 'routeStripeNecklace'],
      accessory: ['brightGlasses', 'kenyaPin'],
      topper: ['shukaGridBand', 'stickerCap'],
    },
    neutral: {
      outfit: ['shukaCheckCollar', 'neonTrimCollar'],
      accessory: ['none', 'brightGlasses', 'kenyaPin'],
      topper: ['neonRouteBand', 'shukaGridBand'],
    },
  },
};
