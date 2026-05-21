import { describe, it, expect } from 'vitest';
import { createAvatar, selectAvatar } from '../src/index.js';

describe('continuous params', () => {
  it('AvatarSpec includes all continuous fields', () => {
    const s = selectAvatar('alice');
    expect(typeof s.hueShift).toBe('number');
    expect(typeof s.bodyScale).toBe('number');
    expect(typeof s.eyeGapShift).toBe('number');
    expect(typeof s.mouthCurveScale).toBe('number');
    expect(typeof s.antennaTilt).toBe('number');
  });

  it('continuous values stay within design ranges', () => {
    for (let i = 0; i < 200; i++) {
      const s = selectAvatar(`u-${i}`);
      expect(s.hueShift).toBeGreaterThanOrEqual(-30);
      expect(s.hueShift).toBeLessThanOrEqual(30);
      expect(s.bodyScale).toBeGreaterThanOrEqual(0.92);
      expect(s.bodyScale).toBeLessThanOrEqual(1.08);
      expect(s.eyeGapShift).toBeGreaterThanOrEqual(-2);
      expect(s.eyeGapShift).toBeLessThanOrEqual(2);
      expect(s.mouthCurveScale).toBeGreaterThanOrEqual(0.85);
      expect(s.mouthCurveScale).toBeLessThanOrEqual(1.15);
      expect(s.antennaTilt).toBeGreaterThanOrEqual(-8);
      expect(s.antennaTilt).toBeLessThanOrEqual(8);
    }
  });

  it('continuous values are deterministic per seed', () => {
    const a = selectAvatar('charlie');
    const b = selectAvatar('charlie');
    expect(a.hueShift).toBe(b.hueShift);
    expect(a.bodyScale).toBe(b.bodyScale);
    expect(a.eyeGapShift).toBe(b.eyeGapShift);
    expect(a.mouthCurveScale).toBe(b.mouthCurveScale);
    expect(a.antennaTilt).toBe(b.antennaTilt);
  });

  it('hue filter is emitted when hueShift is non-zero', () => {
    // Pick a seed known to have non-zero hue (almost every seed does — Math.round on a uniform range).
    const svg = createAvatar('alice');
    const spec = selectAvatar('alice');
    if (spec.hueShift !== 0) {
      expect(svg).toContain('feColorMatrix');
      expect(svg).toContain(`hueRotate`);
    } else {
      expect(svg).not.toContain('feColorMatrix');
    }
  });

  it('SVG byte-identical for same seed', () => {
    expect(createAvatar('dave')).toBe(createAvatar('dave'));
  });

  it('different seeds produce different bodyScale most of the time', () => {
    const scales = new Set<number>();
    for (let i = 0; i < 50; i++) scales.add(selectAvatar(`scale-${i}`).bodyScale);
    expect(scales.size).toBeGreaterThan(40);
  });
});
