import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Office Bright — vivid sibling of the muted Office pack.
 *
 * Same structure as `office` (flat squircle, pure white plate, ID-photo
 * composition, necktie/necklace outfit pool, bolder feature strokes) — only
 * the palettes differ. Saturated brand-style colors for teams that want their
 * avatars to POP off a dashboard.
 *
 * Use cases: marketing tools, design SaaS, product team pages where playful
 * energy still belongs (vs muted Office for finance/legal/enterprise).
 */
const palettes: Palette[] = [
  // Cobalt — vibrant deep blue
  { id: 'office-bright:cobalt',  bodyFrom: '#4F8DFF', bodyTo: '#1E40AF', accent: '#FFFFFF', ink: '#0A1638', blush: '#7BA7FF' },
  // Emerald — vivid green
  { id: 'office-bright:emerald', bodyFrom: '#3CCB85', bodyTo: '#047857', accent: '#FFFFFF', ink: '#062418', blush: '#76DAA8' },
  // Fuchsia — hot magenta-pink
  { id: 'office-bright:fuchsia', bodyFrom: '#F0529C', bodyTo: '#BE185D', accent: '#FFFFFF', ink: '#3A0820', blush: '#F58FBC' },
  // Amber — vivid orange-yellow
  { id: 'office-bright:amber',   bodyFrom: '#FFB347', bodyTo: '#C2700B', accent: '#FFFFFF', ink: '#3B1F03', blush: '#FFC97A' },
  // Violet — saturated purple
  { id: 'office-bright:violet',  bodyFrom: '#9F7AEA', bodyTo: '#6D28D9', accent: '#FFFFFF', ink: '#1A0A3A', blush: '#BFA0F0' },
];

export const officeBrightPack: Pack = {
  id: 'office-bright',
  name: 'Office Bright',
  description: 'Vivid corporate variant of Office. Saturated brand-style palettes, same flat ID-badge composition.',
  emoji: '🎨',
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
    accessory: ['none', 'glasses', 'mole', 'freckles', 'earring', 'earring'],
    topper: ['none'],
    background: ['solid'],
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
