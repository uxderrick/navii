import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Lagos Danfo — premium Lagos/Nigeria avatar identity system.
 *
 * Visual rules:
 * - Nigerian green-white-green leads the pack identity
 * - Danfo yellow is the Lagos accent on bands, trim, and route details
 * - Black route-line strokes keep the avatars crisp at plugin sizes
 * - Flat editorial rendering with exclusive palettes
 */
const palettes: Palette[] = [
  { id: 'lagos-danfo:green-white', bodyFrom: '#008753', bodyTo: '#F8F7EF', accent: '#F5C51B', ink: '#111827', blush: '#F5C51B' },
  { id: 'lagos-danfo:white-green', bodyFrom: '#F8F7EF', bodyTo: '#008753', accent: '#F5C51B', ink: '#111827', blush: '#008753' },
  { id: 'lagos-danfo:danfo-green', bodyFrom: '#F5C51B', bodyTo: '#008753', accent: '#F8F7EF', ink: '#111827', blush: '#008753' },
  { id: 'lagos-danfo:deep-green', bodyFrom: '#075F3A', bodyTo: '#F8F7EF', accent: '#F5C51B', ink: '#111827', blush: '#F5C51B' },
  { id: 'lagos-danfo:street-black', bodyFrom: '#111827', bodyTo: '#F5C51B', accent: '#008753', ink: '#F8F7EF', blush: '#F5C51B' },
];

export const lagosDanfoPack: Pack = {
  id: 'lagos-danfo',
  name: 'Lagos Danfo',
  description: 'Lagos-inspired avatars with Nigerian green-white-green, danfo yellow accents, bold route-line geometry, and clean city energy.',
  emoji: '▰',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#F8F7EF',
  featureStroke: 1.22,
  picks: {
    body: ['busBadge', 'routePlaque', 'signTile', 'softShield'],
    eyes: ['round', 'oval', 'dot', 'wide', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'glasses', 'yellowGlasses', 'greenPin', 'routeDot'],
    topper: ['danfoRoofStripe', 'naijaBand', 'routeCap'],
    background: ['solid'],
    outfit: ['flagCollar', 'roadStripeCollar', 'yellowTrimNecklace'],
  },
  styleHints: {
    masc: {
      outfit: ['roadStripeCollar', 'flagCollar'],
      accessory: ['none', 'glasses', 'routeDot'],
      topper: ['routeCap', 'danfoRoofStripe'],
    },
    femme: {
      outfit: ['flagCollar', 'yellowTrimNecklace'],
      accessory: ['yellowGlasses', 'greenPin', 'glasses'],
      topper: ['naijaBand', 'danfoRoofStripe'],
    },
    neutral: {
      outfit: ['flagCollar', 'roadStripeCollar'],
      accessory: ['none', 'glasses', 'greenPin'],
      topper: ['naijaBand', 'danfoRoofStripe'],
    },
  },
};
