import { describe, it, expect } from 'vitest';
import { Navii, random, createAvatar } from '../src/index.js';

describe('random()', () => {
  it('returns { svg, seed }', () => {
    const out = random();
    expect(typeof out.svg).toBe('string');
    expect(typeof out.seed).toBe('string');
    expect(out.svg.startsWith('<svg')).toBe(true);
    expect(out.seed.length).toBeGreaterThan(0);
  });

  it('produces a different seed each call', () => {
    const seeds = new Set<string>();
    for (let i = 0; i < 25; i++) seeds.add(random().seed);
    expect(seeds.size).toBe(25);
  });

  it('returned svg matches createAvatar(seed)', () => {
    const { svg, seed } = random({ size: 128 });
    expect(svg).toBe(createAvatar(seed, { size: 128 }));
  });

  it('honors options (size, paletteId, animated)', () => {
    const { svg } = random({ size: 256, paletteId: 'mint', animated: true });
    expect(svg).toContain('width="256"');
    expect(svg).toContain('@keyframes');
  });

  it('Navii.random is the same function', () => {
    expect(Navii.random).toBe(random);
  });
});
