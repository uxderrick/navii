import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Halloween pack — full themed treatment.
 *
 * Visual rules (Office method, Halloween content):
 * - Pack-only bodies: pumpkin, ghost, skullHead
 * - Pack-only mouths: jagged (carved-pumpkin grin), fangs
 * - Pack-only toppers: witchHat, pumpkinStem, ghostSheet
 * - Flat render — no 3D gradient, editorial illustration look
 * - Dark night-sky plate bg — replaces seeded ring/solid
 * - Bolder feature strokes (1.4× for graphic impact)
 * - Palette exclusive — no off-theme leak
 *
 * Style hints:
 * - classic → pumpkin body + triangle/dot eyes + jagged mouth + stem topper
 * - creepy  → skullHead body + cross/dot eyes + fangs mouth + horns/antlers
 * - cute    → ghost body + dot/sleepy eyes + dot mouth + sheet/none topper
 */
const palettes: Palette[] = [
  // Vivid pumpkin orange — high saturation against dark plate
  { id: 'halloween:pumpkin', bodyFrom: '#FF8C2A', bodyTo: '#D85A00', accent: '#FFE9C4', ink: '#1A0700', blush: '#FFA76A' },
  // Electric witch purple
  { id: 'halloween:witch',   bodyFrom: '#B266FF', bodyTo: '#6A1FB8', accent: '#F0D9FF', ink: '#0E031F', blush: '#D6A0FF' },
  // Acid slime — radioactive Halloween green
  { id: 'halloween:slime',   bodyFrom: '#B3F23A', bodyTo: '#5E9F00', accent: '#E8FFB8', ink: '#091300', blush: '#D8FF7C' },
  // Blood crimson — deep saturated red
  { id: 'halloween:blood',   bodyFrom: '#E83248', bodyTo: '#8E0014', accent: '#FFD6DA', ink: '#1F0004', blush: '#FF8A98' },
  // Bone — pale warm white, ghost-like
  { id: 'halloween:bone',    bodyFrom: '#F5EEDB', bodyTo: '#C8B89A', accent: '#FFFEF5', ink: '#1A1612', blush: '#E8D9B8' },
];

export const halloweenPack: Pack = {
  id: 'halloween',
  name: 'Halloween',
  description: 'Spooky themed pack. Pumpkin/ghost/skull bodies, jagged grins, witch hats, dark night plate.',
  emoji: '🎃',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#0E0A1A', // deep night-purple
  featureStroke: 1.4,
  picks: {
    body: ['pumpkin', 'ghost', 'skullHead'],
    eyes: ['cross', 'dot', 'sleepy', 'wide'],
    mouth: ['jagged', 'fangs', 'flat', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'sparkle', 'eyepatch', 'mole'],
    topper: ['none', 'witchHat', 'pumpkinStem', 'ghostSheet', 'horns', 'antlers'],
    background: ['solid'],
    outfit: ['none', 'collar', 'scarf'],
  },
  styleHints: {
    // 'masc' → creepy / skeletal vibe
    masc: {
      outfit: ['none', 'collar'],
      accessory: ['none', 'eyepatch'],
      topper: ['horns', 'antlers', 'witchHat'],
    },
    // 'femme' → witchy / sparkly vibe
    femme: {
      outfit: ['none', 'scarf'],
      accessory: ['sparkle', 'mole'],
      topper: ['witchHat', 'ghostSheet', 'pumpkinStem'],
    },
    // 'neutral' → balanced classic Halloween — pumpkin or none topper
    neutral: {
      outfit: ['none'],
      accessory: ['none', 'sparkle'],
      topper: ['none', 'witchHat', 'pumpkinStem'],
    },
  },
};
