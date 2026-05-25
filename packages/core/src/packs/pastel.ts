import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Pastel pack — kawaii / cozy wellness companion aesthetic.
 *
 * Reference: Finch, Me+, Alan Mind. Round chubby bodies, big round eyes
 * with white glints, tiny mouths, blushy cheeks, soft pastel plate
 * background. Reads as a digital plush — friendly, calm, expressive.
 *
 * Visual rules (Office method, kawaii content):
 * - Flat render — no 3D radial gradient; clean illustration finish
 * - Soft cream plate bg (#FBF6F0) — warm neutral that lifts every palette
 * - Bolder featureStroke 1.3 — face features read as bold doodled lines
 * - paletteExclusive — base palettes can't sneak in
 * - Bodies stay round/chubby (orb / dumpling / pebble)
 * - Always blushy cheeks — accessory weighted toward blush
 *
 * Style hints:
 * - masc → softer kawaii (sleepy/dot eyes, no ears/halo)
 * - femme → full kawaii (heart/star eyes, ears+halo, blush always)
 * - neutral → balanced cute
 */
const palettes: Palette[] = [
  // Cotton candy — soft pink, the most kawaii signal
  { id: 'pastel:cotton-candy', bodyFrom: '#FFB4D4', bodyTo: '#FF7AAB', accent: '#FFF0F6', ink: '#5E1C40', blush: '#FFC6DC' },
  // Butter — warm pastel yellow
  { id: 'pastel:butter',       bodyFrom: '#FFE07F', bodyTo: '#E6B12E', accent: '#FFFBE6', ink: '#5C4810', blush: '#FFE5A0' },
  // Mint cream — soft green
  { id: 'pastel:mint-cream',   bodyFrom: '#A8E9C8', bodyTo: '#5BC499', accent: '#EFFEF5', ink: '#194433', blush: '#C2EED4' },
  // Lavender — gentle purple
  { id: 'pastel:lavender',     bodyFrom: '#C8B5F0', bodyTo: '#9275D4', accent: '#F6F0FE', ink: '#321F58', blush: '#D8C6F0' },
  // Peach bloom — warm coral peach
  { id: 'pastel:peach-bloom',  bodyFrom: '#FFC1A0', bodyTo: '#F08F6A', accent: '#FFF1E8', ink: '#6E2F12', blush: '#FFC6AC' },
  // Sky drop — pastel baby blue
  { id: 'pastel:sky-drop',     bodyFrom: '#A8D9F5', bodyTo: '#6BB1E0', accent: '#EFF8FE', ink: '#15324A', blush: '#BCDDF0' },
];

export const pastelPack: Pack = {
  id: 'pastel',
  name: 'Pastel',
  description: 'Kawaii cozy companion. Round chubby bodies, big eyes, blushy cheeks, soft cream plate. Finch-like.',
  emoji: '🌸',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#FBF6F0', // warm cream plate
  featureStroke: 1.3,
  picks: {
    body: ['dumpling', 'orb', 'pebble'],
    // Big expressive eyes — wide/round read as kawaii, sleepy/wink soften it.
    // Drop oval (too anime) + cross (too aggressive) for cohesion.
    eyes: ['round', 'wide', 'sleepy', 'wink', 'heart', 'star'],
    // Tiny mouths — smile/dot/tongue. No grin/awe (too loud).
    mouth: ['smile', 'dot', 'tongue', 'smirk'],
    antenna: ['none', 'classic', 'curl'],
    // Blush weighted heavy — every pastel avatar gets blushy by default
    accessory: ['blush', 'blush', 'blush', 'freckles', 'sparkle', 'none'],
    // Round ears / headband / halo / tuft give character variety
    topper: ['none', 'roundEars', 'ears', 'headband', 'halo', 'tuft'],
    background: ['solid'],
    // Outfit stays minimal — collar gives "shirt" peek
    outfit: ['none', 'collar', 'sunflower', 'necklace'],
  },
  styleHints: {
    // 'masc' → softer kawaii: minimal toppers, dot/sleepy eyes
    masc: {
      eyes: ['round', 'sleepy', 'wink'],
      accessory: ['blush', 'freckles', 'none'],
      topper: ['none', 'tuft', 'cap'],
      outfit: ['none', 'collar'],
    },
    // 'femme' → full kawaii: heart/star eyes, ears+halo, sparkles
    femme: {
      eyes: ['heart', 'star', 'wide'],
      accessory: ['blush', 'sparkle'],
      topper: ['roundEars', 'ears', 'halo', 'headband'],
      outfit: ['none', 'sunflower', 'necklace'],
    },
    // 'neutral' → balanced
    neutral: {
      eyes: ['round', 'wide', 'sleepy'],
      accessory: ['blush', 'freckles'],
      topper: ['none', 'roundEars', 'tuft'],
      outfit: ['none', 'collar'],
    },
  },
};
