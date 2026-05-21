import type { Palette } from '../types.js';

/**
 * Palette set seeded from the Comms360 "Pulse" mascot DNA, extended to provide
 * enough hue variety for identity-level differentiation across many users.
 *
 * `bodyFrom`/`bodyTo` feed the radial gradient. `ink` is the line/face color
 * (dark complement of the body). `accent` is used for antenna sparks and other
 * highlights. `blush` is the cheek tint.
 */
export const PALETTES: readonly Palette[] = [
  { id: 'indigo',    bodyFrom: '#818CF8', bodyTo: '#6366F1', accent: '#FFFFFF', ink: '#1E1B4B', blush: '#F9A8D4' },
  { id: 'mint',      bodyFrom: '#6EE7B7', bodyTo: '#34D399', accent: '#ECFDF5', ink: '#064E3B', blush: '#FBCFE8' },
  { id: 'amber',     bodyFrom: '#FCD34D', bodyTo: '#F59E0B', accent: '#FFF7ED', ink: '#78350F', blush: '#FB7185' },
  { id: 'sky',       bodyFrom: '#93C5FD', bodyTo: '#3B82F6', accent: '#FFFFFF', ink: '#1E3A8A', blush: '#F9A8D4' },
  { id: 'violet',    bodyFrom: '#C084FC', bodyTo: '#A855F7', accent: '#FAE8FF', ink: '#4C1D95', blush: '#F472B6' },
  { id: 'cyan',      bodyFrom: '#67E8F9', bodyTo: '#06B6D4', accent: '#ECFEFF', ink: '#164E63', blush: '#F9A8D4' },
  { id: 'rose',      bodyFrom: '#FDA4AF', bodyTo: '#F43F5E', accent: '#FFE4E6', ink: '#881337', blush: '#FECDD3' },
  { id: 'lime',      bodyFrom: '#BEF264', bodyTo: '#84CC16', accent: '#F7FEE7', ink: '#365314', blush: '#FCA5A5' },
  { id: 'peach',     bodyFrom: '#FDBA74', bodyTo: '#F97316', accent: '#FFF7ED', ink: '#7C2D12', blush: '#FECACA' },
  { id: 'teal',      bodyFrom: '#5EEAD4', bodyTo: '#14B8A6', accent: '#F0FDFA', ink: '#134E4A', blush: '#FBCFE8' },
  { id: 'sand',      bodyFrom: '#FDE68A', bodyTo: '#EAB308', accent: '#FEFCE8', ink: '#713F12', blush: '#FCA5A5' },
  { id: 'plum',      bodyFrom: '#D8B4FE', bodyTo: '#9333EA', accent: '#F5F3FF', ink: '#3B0764', blush: '#F0ABFC' },
  { id: 'coral',     bodyFrom: '#FCA5A5', bodyTo: '#EF4444', accent: '#FEF2F2', ink: '#7F1D1D', blush: '#FECACA' },
  { id: 'forest',    bodyFrom: '#86EFAC', bodyTo: '#16A34A', accent: '#F0FDF4', ink: '#14532D', blush: '#FBCFE8' },
  { id: 'slate',     bodyFrom: '#CBD5E1', bodyTo: '#64748B', accent: '#F8FAFC', ink: '#0F172A', blush: '#FBCFE8' },
  { id: 'fuchsia',   bodyFrom: '#F0ABFC', bodyTo: '#D946EF', accent: '#FDF4FF', ink: '#701A75', blush: '#FBCFE8' },
  // v0.4 additions — broader brand fit
  { id: 'terracotta', bodyFrom: '#FBBF9C', bodyTo: '#C2410C', accent: '#FFF7ED', ink: '#7C2D12', blush: '#FECACA' },
  { id: 'navy',       bodyFrom: '#93C5FD', bodyTo: '#1E3A8A', accent: '#EFF6FF', ink: '#172554', blush: '#FBCFE8' },
  { id: 'lavender',   bodyFrom: '#DDD6FE', bodyTo: '#7C3AED', accent: '#F5F3FF', ink: '#3B0764', blush: '#F5D0FE' },
  { id: 'charcoal',   bodyFrom: '#9CA3AF', bodyTo: '#374151', accent: '#F9FAFB', ink: '#030712', blush: '#FBCFE8' },
  { id: 'butter',     bodyFrom: '#FEF9C3', bodyTo: '#FACC15', accent: '#FEFCE8', ink: '#713F12', blush: '#FCA5A5' },
  { id: 'aqua',       bodyFrom: '#A5F3FC', bodyTo: '#0891B2', accent: '#ECFEFF', ink: '#083344', blush: '#FBCFE8' },
];

export const PALETTE_BY_ID: Record<string, Palette> = Object.fromEntries(
  PALETTES.map((p) => [p.id, p]),
);
