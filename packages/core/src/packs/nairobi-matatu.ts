import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Nairobi Matatu — premium Nairobi/Kenya avatar identity system.
 *
 * Visual rules:
 * - Route-sticker plates with yellow matatu stripe details
 * - Kenya flag black/red/green/white with restrained shuka blue
 * - Chrome/window dots, route numbers, and high-contrast face details
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'nairobi-matatu:route-black', bodyFrom: '#101820', bodyTo: '#101820', accent: '#F5C51B', ink: '#F8F7EF', blush: '#C8102E' },
  { id: 'nairobi-matatu:kanu-red', bodyFrom: '#C8102E', bodyTo: '#101820', accent: '#F5C51B', ink: '#F8F7EF', blush: '#00843D' },
  { id: 'nairobi-matatu:city-green', bodyFrom: '#00843D', bodyTo: '#101820', accent: '#F5C51B', ink: '#F8F7EF', blush: '#C8102E' },
  { id: 'nairobi-matatu:yellow-stripe', bodyFrom: '#F5C51B', bodyTo: '#101820', accent: '#00843D', ink: '#101820', blush: '#C8102E' },
  { id: 'nairobi-matatu:shuka-blue', bodyFrom: '#1E4EA8', bodyTo: '#101820', accent: '#C8102E', ink: '#F8F7EF', blush: '#F5C51B' },
];

export const nairobiMatatuPack: Pack = {
  id: 'nairobi-matatu',
  name: 'Nairobi Matatu',
  description: 'Nairobi-inspired avatars with matatu route stickers, yellow route stripes, Kenya flag color, and restrained shuka-grid accents.',
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
