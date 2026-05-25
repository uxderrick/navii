import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Earth pack — wellness / meditation / nature companion aesthetic.
 *
 * Reference: Headspace (warm orange blob, sleepy eyes), Calm (warm cream
 * gradients), Open, Alan Mind, Ten Percent Happier. Soft round bodies in
 * earthy tones, sleepy meditative faces, leaf/halo toppers, warm cream
 * plate. Reads as calm digital companion, not corporate or playful.
 *
 * Visual rules:
 * - Flat render — no 3D gloss
 * - Warm cream plate (#FBF6EE) — neutral that lifts earth tones
 * - Moderate featureStroke 1.2 — visible but soft
 * - paletteExclusive — base palettes can't intrude
 * - Round soft bodies (orb, dumpling, pebble)
 * - Sleepy/dot eyes — meditative, eyes-closed default
 * - Smile/flat/dot mouths — calm, no loud expressions
 * - Leaf, halo, headband toppers — organic + zen
 * - Blush weighted heavy — warm health glow
 *
 * Style hints:
 * - masc → minimal earth: dot eyes, no topper, no accessory
 * - femme → wellness teacher: sleepy + leaf/halo + blush + sparkle
 * - neutral → balanced calm
 */
const palettes: Palette[] = [
  // Sage — calm soft green
  { id: 'earth:sage',       bodyFrom: '#A8C49A', bodyTo: '#6D8E60', accent: '#F2F7EA', ink: '#1F2E18', blush: '#C8D7B4' },
  // Clay — terracotta warmth
  { id: 'earth:clay',       bodyFrom: '#D49072', bodyTo: '#9C4F2E', accent: '#FBEBDD', ink: '#3D1A0B', blush: '#E5BCA5' },
  // Sand — warm beige
  { id: 'earth:sand',       bodyFrom: '#E1CC9F', bodyTo: '#A88B5A', accent: '#FFF5E0', ink: '#4A3818', blush: '#EBD8B0' },
  // Moss — deeper forest green
  { id: 'earth:moss',       bodyFrom: '#82A570', bodyTo: '#3F6038', accent: '#EAF4DC', ink: '#0D1F08', blush: '#B9D2A1' },
  // Terracotta — fiery clay, more saturated
  { id: 'earth:terracotta', bodyFrom: '#D87555', bodyTo: '#A53F22', accent: '#FFE5D8', ink: '#380F02', blush: '#EBA188' },
  // Mushroom — warm dusty mauve-brown
  { id: 'earth:mushroom',   bodyFrom: '#B59B8A', bodyTo: '#7D6353', accent: '#F4ECE3', ink: '#2C1C13', blush: '#C6B0A0' },
];

export const earthPack: Pack = {
  id: 'earth',
  name: 'Earth',
  description: 'Wellness companion. Warm earthy palettes, soft round body, sleepy meditative face, leaf + halo toppers.',
  emoji: '🌿',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#FBF6EE', // warm cream plate
  featureStroke: 1.2,
  picks: {
    body: ['orb', 'dumpling', 'pebble'],
    eyes: ['sleepy', 'sleepy', 'dot'],
    mouth: ['smile', 'dot', 'flat'],
    antenna: ['none'],
    accessory: ['blush', 'blush', 'freckles', 'mole', 'sparkle', 'none'],
    topper: ['none', 'leaf', 'halo', 'headband', 'tuft'],
    background: ['solid'],
    outfit: ['none', 'collar', 'scarf', 'necklace'],
  },
  styleHints: {
    // 'masc' → minimal earth: dot eyes, no topper, no accessory
    masc: {
      accessory: ['none', 'freckles', 'mole'],
      topper: ['none', 'tuft'],
      outfit: ['none', 'collar'],
    },
    // 'femme' → wellness teacher: sleepy + leaf/halo + blush + sparkle
    femme: {
      accessory: ['blush', 'sparkle'],
      topper: ['leaf', 'halo', 'headband'],
      outfit: ['none', 'scarf', 'necklace'],
    },
    // 'neutral' → balanced calm
    neutral: {
      accessory: ['blush', 'freckles'],
      topper: ['none', 'leaf', 'tuft'],
      outfit: ['none', 'collar'],
    },
  },
};
