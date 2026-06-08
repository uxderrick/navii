import type { Pack } from './types.js';
import type { Palette } from '../types.js';

/**
 * Command Center — premium SaaS system-token avatar identity system.
 *
 * Visual rules:
 * - Abstract identity tokens for users, teams, projects, bots, integrations
 * - Minimal geometric plates with one quiet signal mark and one anchor dot
 * - Calm app-safe colors that work inside real product surfaces
 * - No literal dashboard UI, text labels, or chart-heavy decoration
 */
const palettes: Palette[] = [
  { id: 'command-center:graphite', bodyFrom: '#111827', bodyTo: '#111827', accent: '#CBD5E1', ink: '#F8FAFC', blush: '#8FB7A2' },
  { id: 'command-center:slate', bodyFrom: '#475569', bodyTo: '#111827', accent: '#E2E8F0', ink: '#F8FAFC', blush: '#9FB7C7' },
  { id: 'command-center:cloud', bodyFrom: '#F7F8FA', bodyTo: '#E2E8F0', accent: '#64748B', ink: '#111827', blush: '#B7C3D0' },
  { id: 'command-center:moss', bodyFrom: '#567568', bodyTo: '#263D35', accent: '#DCE7DF', ink: '#F8FAFC', blush: '#8FB7A2' },
  { id: 'command-center:cobalt', bodyFrom: '#3B5B8F', bodyTo: '#17233A', accent: '#DDE7F7', ink: '#F8FAFC', blush: '#9FB7C7' },
  { id: 'command-center:sand', bodyFrom: '#D8C7A3', bodyTo: '#8A7858', accent: '#111827', ink: '#111827', blush: '#B7C3D0' },
];

export const commandCenterPack: Pack = {
  id: 'command-center',
  name: 'Command Center',
  description: 'Minimal SaaS system tokens for users, teams, projects, bots, integrations, and workspaces with calm app-safe marks.',
  emoji: '▦',
  palettes,
  paletteExclusive: true,
  flat: true,
  bgColor: '#F7F8FA',
  renderMode: 'workspace-glyph',
  featureStroke: 1.24,
  picks: {
    body: ['dashboardCard', 'metricTile', 'appWindow', 'alertPill'],
    eyes: ['round', 'oval', 'dot', 'wide', 'sleepy'],
    mouth: ['smile', 'flat', 'smirk', 'dot'],
    antenna: ['none'],
    accessory: ['none', 'statusDot', 'cursorPointer', 'sparklineBadge', 'integrationBadge', 'successCheck'],
    topper: ['browserTabs', 'commandBar', 'notificationChip', 'chartHeader'],
    background: ['solid'],
    outfit: ['dataCollar', 'pipelineBand', 'connectorNecklace'],
  },
  styleHints: {
    masc: {
      outfit: ['dataCollar', 'pipelineBand'],
      accessory: ['none', 'statusDot', 'sparklineBadge'],
      topper: ['browserTabs', 'commandBar'],
    },
    femme: {
      outfit: ['pipelineBand', 'connectorNecklace'],
      accessory: ['cursorPointer', 'integrationBadge', 'successCheck'],
      topper: ['notificationChip', 'chartHeader'],
    },
    neutral: {
      outfit: ['dataCollar', 'pipelineBand', 'connectorNecklace'],
      accessory: ['none', 'statusDot', 'integrationBadge', 'successCheck'],
      topper: ['browserTabs', 'commandBar', 'chartHeader'],
    },
  },
};
