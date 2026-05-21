import { describe, it, expect } from 'vitest';
import { createRng, cyrb53 } from '../src/prng.js';

describe('cyrb53', () => {
  it('returns the same hash for the same input', () => {
    expect(cyrb53('alice')).toEqual(cyrb53('alice'));
  });

  it('returns different hashes for different inputs', () => {
    expect(cyrb53('alice')).not.toEqual(cyrb53('bob'));
  });

  it('produces 32-bit unsigned halves', () => {
    const [a, b] = cyrb53('user@example.com');
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(2 ** 32);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(2 ** 32);
  });
});

describe('createRng', () => {
  it('is deterministic per seed', () => {
    const a = createRng('seed-x');
    const b = createRng('seed-x');
    const aVals = Array.from({ length: 16 }, () => a.next());
    const bVals = Array.from({ length: 16 }, () => b.next());
    expect(aVals).toEqual(bVals);
  });

  it('differs across seeds', () => {
    const a = createRng('seed-x');
    const b = createRng('seed-y');
    expect(a.next()).not.toEqual(b.next());
  });

  it('produces values in [0, 1)', () => {
    const r = createRng('range-check');
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('pick throws on empty array', () => {
    const r = createRng('x');
    expect(() => r.pick([])).toThrow();
  });
});
