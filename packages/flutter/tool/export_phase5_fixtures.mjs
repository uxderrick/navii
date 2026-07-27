/**
 * Generate Phase 5 golden fixtures from @usenavii/core for Flutter parity tests.
 * Run from repo root: node packages/flutter/tool/export_phase5_fixtures.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  build,
  renderGroup,
  renderGroupTiles,
  createAvatar,
  BUILT_IN_PACKS,
  PACK_REGISTRY,
  resolvePacks,
} from '../../core/dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../test/fixtures');

const SEED_SET = [
  'alice@example.com',
  'bob',
  'carol',
  '550e8400-e29b-41d4-a716-446655440000',
  'user_42',
];

const groupCases = [
  {
    id: 'three-default',
    seeds: ['a', 'b', 'c'],
    options: { size: 64 },
  },
  {
    id: 'alice-bob-48',
    seeds: ['alice', 'bob'],
    options: { size: 48 },
  },
  {
    id: 'groupId-a',
    seeds: ['alice', 'bob'],
    options: { groupId: 'group-a' },
  },
  {
    id: 'max-overflow',
    seeds: ['a', 'b', 'c', 'd', 'e', 'f'],
    options: { size: 32, max: 4 },
  },
  {
    id: 'overlap-tight',
    seeds: ['a', 'b', 'c'],
    options: { size: 64, overlap: 0.6 },
  },
  {
    id: 'overlap-loose',
    seeds: ['a', 'b', 'c'],
    options: { size: 64, overlap: 0 },
  },
  {
    id: 'max-zero',
    seeds: ['a', 'b', 'c'],
    options: { size: 32, max: 0 },
  },
  {
    id: 'snapshot-five',
    seeds: SEED_SET.slice(0, 5),
    options: { size: 64, overlap: 0.3 },
  },
  {
    id: 'tileBg-transparent',
    seeds: ['x', 'y'],
    options: { size: 40, tileBg: 'transparent', ring: '#111111' },
  },
  {
    id: 'with-mood-packs',
    seeds: ['alice', 'bob', 'carol'],
    options: { size: 48, mood: 'happy', packs: ['office'], overlap: 0.3 },
  },
];

const groupFixtures = groupCases.map((c) => {
  const tiles = renderGroupTiles(c.seeds, c.options);
  return {
    id: c.id,
    seeds: c.seeds,
    options: c.options,
    svg: renderGroup(c.seeds, c.options),
    tiles: tiles.tiles,
    counter: tiles.counter ?? null,
    width: tiles.width,
    height: tiles.height,
  };
});

const buildCases = [
  { id: 'defaults', spec: {}, options: {} },
  {
    id: 'mint-tall-star-grin',
    spec: { palette: 'mint', body: 'tall', eyes: 'star', mouth: 'grin' },
    options: {},
  },
  { id: 'size-256', spec: {}, options: { size: 256 } },
  {
    id: 'tall-star',
    spec: { body: 'tall', eyes: 'star' },
    options: {},
  },
  {
    id: 'orb-round',
    spec: { body: 'orb', eyes: 'round' },
    options: {},
  },
  {
    id: 'unknown-palette',
    spec: { palette: 'nonexistent' },
    options: {},
  },
  {
    id: 'curated-hero',
    spec: {
      body: 'tall',
      eyes: 'star',
      mouth: 'grin',
      palette: 'violet',
      topper: 'crown',
      antenna: 'bobble',
      accessory: 'bow',
      hueShift: 12,
      bodyScale: 1.05,
    },
    options: { size: 192, animated: true },
  },
];

const buildFixtures = buildCases.map((c) => ({
  id: c.id,
  spec: c.spec,
  options: c.options,
  svg: build(c.spec, c.options),
}));

const packCases = [
  { id: 'baseline', seed: 'alice', options: {} },
  { id: 'packs-empty', seed: 'alice', options: { packs: [] } },
  { id: 'packs-unknown', seed: 'alice', options: { packs: ['does-not-exist'] } },
  { id: 'office', seed: 'alice', options: { packs: ['office'] } },
  {
    id: 'office-navy',
    seed: 'alice',
    options: { packs: ['office'], paletteId: 'office:navy' },
  },
  { id: 'halloween', seed: 'bob', options: { packs: ['halloween'] } },
  { id: 'neon', seed: 'carol', options: { packs: ['neon'], size: 96 } },
  {
    id: 'lagos-danfo',
    seed: 'user_42',
    options: { packs: ['lagos-danfo'] },
  },
];

const packFixtures = packCases.map((c) => ({
  id: c.id,
  seed: c.seed,
  options: c.options,
  svg: createAvatar(c.seed, c.options),
}));

const packsMeta = {
  builtInIds: BUILT_IN_PACKS.map((p) => p.id).sort(),
  resolveSample: resolvePacks([
    'office',
    'office',
    'does-not-exist',
    'halloween',
  ]).map((p) => p.id),
  registryKeys: Object.keys(PACK_REGISTRY).sort(),
};

writeFileSync(
  join(fixturesDir, 'group_ts.json'),
  JSON.stringify(groupFixtures, null, 2) + '\n',
);
writeFileSync(
  join(fixturesDir, 'build_ts.json'),
  JSON.stringify(buildFixtures, null, 2) + '\n',
);
writeFileSync(
  join(fixturesDir, 'packs_svg_ts.json'),
  JSON.stringify(packFixtures, null, 2) + '\n',
);
writeFileSync(
  join(fixturesDir, 'packs_meta_ts.json'),
  JSON.stringify(packsMeta, null, 2) + '\n',
);

console.log(
  `Wrote ${groupFixtures.length} group, ${buildFixtures.length} build, ${packFixtures.length} pack fixtures`,
);
