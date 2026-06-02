import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Accra Gallery — contemporary Ghana-inspired avatar identity system.
 *
 * Visual rules:
 * - Warm ivory gallery surfaces
 * - Gold, red, green, and black accents
 * - Kente-inspired geometry as restrained bands/collars/toppers
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'accra-gallery:gallery-gold', bodyFrom: '#D8A928', bodyTo: '#B88716', accent: '#F6EEDC', ink: '#1D1710', blush: '#D97058' },
  { id: 'accra-gallery:ivory-red',    bodyFrom: '#F6EEDC', bodyTo: '#B93A32', accent: '#D8A928', ink: '#201813', blush: '#D97058' },
  { id: 'accra-gallery:green-gold',   bodyFrom: '#1F6B45', bodyTo: '#12442E', accent: '#D8A928', ink: '#171A13', blush: '#E2A08A' },
  { id: 'accra-gallery:black-star',   bodyFrom: '#F3DEC2', bodyTo: '#D8A928', accent: '#111111', ink: '#111111', blush: '#C75B4D' },
  { id: 'accra-gallery:woven-warm',   bodyFrom: '#C9852A', bodyTo: '#7D2D24', accent: '#1F6B45', ink: '#1C130E', blush: '#D98B70' },
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
