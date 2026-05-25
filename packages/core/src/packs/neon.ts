import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Neon pack — cyberpunk / esports / synthwave aesthetic.
 *
 * Reference: Stadium Live, Opal crystal glow, cyberpunk UI. Bright neon
 * bodies floating on a near-black plate with a soft outer glow halo —
 * reads as illuminated signage / gaming PFP.
 *
 * Visual rules:
 * - Flat render — no 3D gloss; clean illustration
 * - Near-black plate (#0A0A14) — body brightness pops against it
 * - Glow halo behind body — palette-tinted, soft Gaussian blur
 * - Bold featureStroke 1.5 — sharp face lines on the bright body
 * - paletteExclusive — keep base muted palettes out
 * - Sharp body silhouettes (tall, wisp, taro)
 * - Intense expressions (star, wide, cross, grin, tooth)
 * - Edgy toppers (horn, horns, antlers, spike antenna)
 *
 * Style hints:
 * - masc → aggressive (cross eyes, horns, spike antenna, eyepatch)
 * - femme → glamour (star eyes, sparkle, halo, tuft)
 * - neutral → balanced edgy
 */
const palettes: Palette[] = [
  // Hot pink — synthwave signature
  { id: 'neon:pink',   bodyFrom: '#FF6FD8', bodyTo: '#D6168C', accent: '#FFE5F5', ink: '#1F0214', blush: '#FFB3DD' },
  // Acid lime — radioactive green
  { id: 'neon:lime',   bodyFrom: '#D9FF3D', bodyTo: '#5FB800', accent: '#F5FFD0', ink: '#0F1500', blush: '#E5FF8A' },
  // Electric cyan — Tron blue
  { id: 'neon:cyan',   bodyFrom: '#4DEFFF', bodyTo: '#0099C9', accent: '#D6FBFF', ink: '#00141C', blush: '#A5EEFA' },
  // Sodium — bright street-lamp yellow-orange
  { id: 'neon:sodium', bodyFrom: '#FFEC4D', bodyTo: '#E59700', accent: '#FFFADB', ink: '#221400', blush: '#FFE082' },
  // Magenta violet — saturated purple
  { id: 'neon:violet', bodyFrom: '#C66DFF', bodyTo: '#6B14D6', accent: '#EFDDFF', ink: '#0F0024', blush: '#D8B0FF' },
  // Plasma orange-red — fiery
  { id: 'neon:plasma', bodyFrom: '#FF6A3D', bodyTo: '#C42500', accent: '#FFD9CC', ink: '#1F0500', blush: '#FFA98A' },
];

export const neonPack: Pack = {
  id: 'neon',
  name: 'Neon',
  description: 'Cyberpunk gaming PFP. Vivid neon bodies on a dark plate with soft glow halo. Sharp + intense.',
  emoji: '⚡',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#0A0A14', // deep night plate
  featureStroke: 1.5,
  glow: true,
  picks: {
    body: ['tall', 'wisp', 'taro'],
    eyes: ['star', 'wide', 'cross', 'dot'],
    mouth: ['grin', 'awe', 'tooth', 'smirk'],
    antenna: ['spike', 'double', 'none'],
    accessory: ['sparkle', 'glasses', 'eyepatch', 'none'],
    topper: ['none', 'antlers', 'horn', 'horns', 'tuft', 'cap'],
    background: ['solid'],
    outfit: ['none', 'scarf', 'necklace'],
  },
  styleHints: {
    // 'masc' → aggressive: cross eyes, horns, spike antenna, eyepatch
    masc: {
      accessory: ['eyepatch', 'glasses', 'none'],
      topper: ['horns', 'horn', 'antlers'],
      outfit: ['none'],
    },
    // 'femme' → glamour: sparkle, halo, soft tuft
    femme: {
      accessory: ['sparkle', 'glasses'],
      topper: ['tuft', 'halo'],
      outfit: ['necklace', 'scarf', 'none'],
    },
    // 'neutral' → balanced edgy
    neutral: {
      accessory: ['glasses', 'sparkle', 'none'],
      topper: ['none', 'cap', 'tuft'],
      outfit: ['none'],
    },
  },
};
