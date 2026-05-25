import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Office pack — corporate ID-badge aesthetic.
 *
 * Visual rules:
 * - FLAT render (no radial gradient, no sheen, no ground shadow)
 * - Pure WHITE plate background — replaces seeded background entirely
 * - Squircle body only (rounded square, ID-card silhouette)
 * - Muted dusty palettes — desaturated corporate tones (no playful brights)
 * - Necktie outfit always — corporate signature
 * - Conservative face: neutral mouth, simple eyes, no antenna
 * - Exclusive palette pool — seeded picks never leak into off-theme base colors
 */
const palettes: Palette[] = [
  // Near-grayscale with cool blue undertone
  { id: 'office:graphite', bodyFrom: '#989BA2', bodyTo: '#696D72', accent: '#FFFFFF', ink: '#1A1C1F', blush: '#A09D99' },
  // Warm stone — barely tinted neutral
  { id: 'office:stone',    bodyFrom: '#A5A29D', bodyTo: '#74726F', accent: '#FFFFFF', ink: '#1C1B19', blush: '#A8A5A0' },
  // Muted sage — barely-green grey
  { id: 'office:sage',     bodyFrom: '#9EA299', bodyTo: '#6F726B', accent: '#FFFFFF', ink: '#1B1D19', blush: '#A3A099' },
  // Taupe — desaturated warm grey
  { id: 'office:taupe',    bodyFrom: '#ACA098', bodyTo: '#78716C', accent: '#FFFFFF', ink: '#1E1B18', blush: '#AFA59C' },
  // Cool slate — neutral grey with hint of blue
  { id: 'office:slate',    bodyFrom: '#9DA2AA', bodyTo: '#6C7077', accent: '#FFFFFF', ink: '#1A1C20', blush: '#A0A2A6' },
];

export const officePack: Pack = {
  id: 'office',
  name: 'Office',
  description: 'Corporate ID-badge. Flat, muted, square silhouette. Mix of professional outfits + hairstyles.',
  emoji: '💼',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#FFFFFF',
  featureStroke: 1.35,
  picks: {
    body: ['squircle'],
    eyes: ['dot', 'sleepy', 'squint'],
    mouth: ['flat', 'dot'],
    antenna: ['none'],
    // Gender + style variety comes from accessory + outfit mix, NOT hair toppers
    // (hair rendered as solid silhouettes reads as helmets at small sizes).
    accessory: ['none', 'glasses', 'mole', 'freckles', 'earring', 'earring'],
    topper: ['none'],
    background: ['solid'],
    // Outfit mix — tie reads masc, necklace/bowtie/collar neutral-or-femme. No scarf (too bulky).
    outfit: ['tie', 'necklace', 'collar', 'bowtie'],
  },
  styleHints: {
    masc: {
      outfit: ['tie', 'bowtie'],
      accessory: ['none', 'glasses', 'mole', 'freckles'],
    },
    femme: {
      outfit: ['necklace'],
      accessory: ['earring', 'glasses', 'mole'],
    },
    neutral: {
      outfit: ['collar', 'bowtie', 'necklace'],
      accessory: ['none', 'glasses', 'freckles'],
    },
  },
};
