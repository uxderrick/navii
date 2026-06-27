import { describe, it, expect } from 'vitest';
import { createAvatar, selectAvatar, renderGroup } from '../src/index.js';

/**
 * Determinism contract: byte-identical output for a fixed set of seeds.
 *
 * This is the load-bearing test for the public API promise. If a future
 * change shifts a single byte for any of these seeds, this test fails
 * loudly. When that happens:
 *   - If the change is intentional (new variant added to end of an array,
 *     etc.), bump the major version and run `vitest -u` to refresh.
 *   - Otherwise, the change broke the deterministic contract — revert.
 */

const SEED_SET = [
  'alice@example.com',
  'bob',
  'carol',
  'user-1',
  'user-2',
  'user-42',
  'navii',
  'team@navii.com',
  'uuid-550e8400-e29b-41d4-a716-446655440000',
  '0',
  'a',
  'longer-seed-with-dashes-and-numbers-123',
];

describe('determinism contract', () => {
  it('spec snapshots remain stable per seed', () => {
    const specs = SEED_SET.map((seed) => {
      const s = selectAvatar(seed);
      return {
        seed,
        palette: s.palette.id,
        body: s.body,
        eyes: s.eyes,
        mouth: s.mouth,
        antenna: s.antenna,
        accessory: s.accessory,
        background: s.background,
        topper: s.topper,
        hueShift: s.hueShift,
        bodyScale: s.bodyScale,
        eyeGapShift: s.eyeGapShift,
        mouthCurveScale: s.mouthCurveScale,
        antennaTilt: s.antennaTilt,
      };
    });
    expect(specs).toMatchSnapshot();
  });

  it('SVG byte snapshots remain stable per seed', () => {
    const svgs = SEED_SET.map((seed) => ({
      seed,
      bytes: createAvatar(seed, { size: 96 }).length,
      svg: createAvatar(seed, { size: 96 }),
    }));
    expect(svgs).toMatchSnapshot();
  });

  it('animated SVG snapshots remain stable per seed', () => {
    const svgs = SEED_SET.slice(0, 4).map((seed) => ({
      seed,
      svg: createAvatar(seed, { size: 96, animated: true }),
    }));
    expect(svgs).toMatchSnapshot();
  });

  it('group SVG snapshot remains stable', () => {
    const svg = renderGroup(SEED_SET.slice(0, 5), {
      size: 64,
      overlap: 0.3,
    });
    expect(svg).toMatchSnapshot();
  });
});
