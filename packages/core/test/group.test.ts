import { describe, it, expect } from 'vitest';
import { renderGroup } from '../src/index.js';

describe('renderGroup', () => {
  it('returns SVG with N tiles', () => {
    const svg = renderGroup(['a', 'b', 'c'], { size: 64 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    // 3 nested <svg> tiles
    const tiles = svg.match(/<svg x="/g);
    expect(tiles?.length).toBe(3);
  });

  it('is deterministic for same seeds', () => {
    const a = renderGroup(['alice', 'bob'], { size: 48 });
    const b = renderGroup(['alice', 'bob'], { size: 48 });
    expect(a).toBe(b);
  });

  it('respects max with +N counter tile', () => {
    const svg = renderGroup(['a', 'b', 'c', 'd', 'e', 'f'], { size: 32, max: 4 });
    expect(svg).toContain('+3'); // 4 tiles total: 3 avatars + "+3"
    const tiles = svg.match(/<svg x="/g);
    expect(tiles?.length).toBe(4);
  });

  it('no counter when seeds <= max', () => {
    const svg = renderGroup(['a', 'b'], { size: 32, max: 5 });
    expect(svg).not.toMatch(/\+\d+/);
  });

  it('width scales with overlap', () => {
    const tight = renderGroup(['a', 'b', 'c'], { size: 64, overlap: 0.6 });
    const loose = renderGroup(['a', 'b', 'c'], { size: 64, overlap: 0 });
    const tightW = Number(tight.match(/viewBox="0 0 ([\d.]+)/)?.[1] ?? 0);
    const looseW = Number(loose.match(/viewBox="0 0 ([\d.]+)/)?.[1] ?? 0);
    expect(tightW).toBeLessThan(looseW);
  });

  it('throws on empty seeds', () => {
    expect(() => renderGroup([])).toThrow();
  });

  it('clip-path applied so circular crop is enforced', () => {
    const svg = renderGroup(['a'], { size: 48 });
    expect(svg).toContain('clipPath');
    expect(svg).toContain('clip-path="url(#navii-clip)"');
  });
});
