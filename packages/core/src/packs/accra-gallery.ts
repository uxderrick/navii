import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Accra Gallery — contemporary Ghana-inspired avatar identity system.
 *
 * Visual rules:
 * - Warm ivory gallery surfaces
 * - Near-black, gold, red, green, and bright-gold accents
 * - Kente-inspired geometry as restrained bands/collars/toppers
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'accra-gallery:gallery-gold', bodyFrom: '#F3CF4E', bodyTo: '#B12F28', accent: '#111827', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:green-gold',   bodyFrom: '#2F6A3E', bodyTo: '#F3CF4E', accent: '#111827', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:red-black',    bodyFrom: '#812723', bodyTo: '#111827', accent: '#F3CF4E', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:black-gold',   bodyFrom: '#111827', bodyTo: '#F3CF4E', accent: '#B12F28', ink: '#111827', blush: '#B12F28' },
  { id: 'accra-gallery:woven-gold',   bodyFrom: '#F8D04A', bodyTo: '#2F6A3E', accent: '#B12F28', ink: '#111827', blush: '#B12F28' },
];

export const accraGalleryPack: Pack = {
  id: 'accra-gallery',
  name: 'Accra Gallery',
  description: 'Contemporary Ghana-inspired avatars with refined textile geometry, warm ivory, gold, red, green, and black accents.',
  emoji: '✦',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#F6EEDC',
  featureStroke: 1.18,
  picks: {
    body: ['galleryPlaque', 'softShield', 'wovenTile', 'medallion'],
    eyes: ['round', 'oval', 'dot', 'wide', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'glasses', 'goldHoop', 'blackStarPin'],
    topper: ['none', 'textileBand', 'geometricCap', 'galleryWrap'],
    background: ['solid'],
    outfit: ['none', 'patternedCollar', 'necklace'],
  },
  styleHints: {
    masc: {
      outfit: ['none', 'patternedCollar'],
      accessory: ['none', 'glasses', 'blackStarPin'],
      topper: ['none', 'geometricCap', 'textileBand'],
    },
    femme: {
      outfit: ['none', 'patternedCollar', 'necklace'],
      accessory: ['none', 'goldHoop', 'glasses'],
      topper: ['none', 'galleryWrap', 'textileBand'],
    },
    neutral: {
      outfit: ['none', 'patternedCollar'],
      accessory: ['none', 'glasses', 'blackStarPin'],
      topper: ['none', 'textileBand'],
    },
  },
};
