import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Mono pack — editorial / minimalist / Twitter-PFP aesthetic.
 *
 * Reference: Timepage silhouette, Character AI dark, IFTTT minimal,
 * Mindvalley. Strip away decoration: a clean grayscale orb on a warm
 * near-white plate, with the lightest possible face. Reads as editorial
 * design system / serious portfolio / "designer Twitter" avatar.
 *
 * Visual rules:
 * - Flat render (no 3D gloss)
 * - Warm near-white plate (#FAFAF8) for soft editorial feel
 * - THIN featureStroke (0.85) — delicate face lines, not bold
 * - paletteExclusive — keep colored base palettes out
 * - Single body shape (orb) — pure silhouette
 * - No antenna / topper / accessory by default — minimal
 * - Dot eyes only, flat/dot mouth — the lightest face possible
 *
 * Style hints:
 * - masc → bare (just dots, no decoration)
 * - femme → mole or freckles (one subtle accent)
 * - neutral → glasses option
 */
const palettes: Palette[] = [
  // Obsidian — near-black body, WHITE face features for contrast
  { id: 'mono:obsidian', bodyFrom: '#2A2A2A', bodyTo: '#0A0A0A', accent: '#FAFAFA', ink: '#F2F2F2', blush: '#5A5A5A' },
  // Graphite — dark warm grey body, light face
  { id: 'mono:graphite', bodyFrom: '#4A4A4A', bodyTo: '#222222', accent: '#F4F4F4', ink: '#EBEBEB', blush: '#7A7A7A' },
  // Slate — mid-grey body, dark face (good contrast either way; going dark for editorial)
  { id: 'mono:slate',    bodyFrom: '#8E8E8E', bodyTo: '#5A5A5A', accent: '#F8F8F8', ink: '#0A0A0A', blush: '#A8A8A8' },
  // Silver — mid-light grey, dark face
  { id: 'mono:silver',   bodyFrom: '#B8B8B8', bodyTo: '#888888', accent: '#FCFCFC', ink: '#1A1A1A', blush: '#D0D0D0' },
  // Fog — palest grey, dark face
  { id: 'mono:fog',      bodyFrom: '#E0E0E0', bodyTo: '#B0B0B0', accent: '#FFFFFF', ink: '#2A2A2A', blush: '#EDEDED' },
  // Ash — warm sand-grey, dark face with brown hint
  { id: 'mono:ash',      bodyFrom: '#A39A8E', bodyTo: '#6A6055', accent: '#F8F4EF', ink: '#1A1612', blush: '#B8AFA5' },
];

export const monoPack: Pack = {
  id: 'mono',
  name: 'Mono',
  description: 'Editorial minimal. Clean grayscale silhouette on warm white plate, thin lines, no decoration.',
  emoji: '🖤',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#FAFAF8',     // warm near-white plate
  featureStroke: 1.15,    // subtle but visible (vs Office 1.35, Neon 1.5)
  picks: {
    body: ['squircle'],
    eyes: ['dot'],
    mouth: ['flat', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'none', 'mole', 'glasses', 'freckles'],
    topper: ['none'],
    background: ['solid'],
    outfit: ['none'],
  },
  styleHints: {
    // 'masc' → bare silhouette, nothing
    masc: {
      accessory: ['none'],
      outfit: ['none'],
      topper: ['none'],
    },
    // 'femme' → one subtle accent (mole or freckles)
    femme: {
      accessory: ['mole', 'freckles'],
      outfit: ['none'],
      topper: ['none'],
    },
    // 'neutral' → glasses option
    neutral: {
      accessory: ['none', 'glasses'],
      outfit: ['none'],
      topper: ['none'],
    },
  },
};
