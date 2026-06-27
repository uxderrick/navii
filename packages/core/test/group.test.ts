import { describe, it, expect } from 'vitest';
import { renderGroup, renderGroupTiles } from '../src/index.js';

describe('renderGroup', () => {
  it('returns SVG with N tiles', () => {
    const svg = renderGroup(['a', 'b', 'c'], { size: 64 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
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
    expect(svg).toContain('+3');
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
    expect(svg).toMatch(/clip-path="url\(#navii-clip-[a-z0-9]+\)"/);
  });

  it('escapes custom colors before writing them to SVG attributes', () => {
    const svg = renderGroup(['a', 'b', 'c'], {
      size: 48,
      max: 2,
      ring: '#fff" stroke-width="99',
      tileBg: '#000" opacity="0',
      counterFill: '#eee" onload="alert(1)',
      counterInk: '#111" onclick="alert(1)',
    });

    expect(svg).toContain('stroke="#fff&quot; stroke-width=&quot;99"');
    expect(svg).toContain('fill="#000&quot; opacity=&quot;0"');
    expect(svg).toContain('fill="#eee&quot; onload=&quot;alert(1)"');
    expect(svg).toContain('fill="#111&quot; onclick=&quot;alert(1)"');
    expect(svg).not.toContain('stroke="#fff" stroke-width="99"');
    expect(svg).not.toContain('fill="#000" opacity="0"');
    expect(svg).not.toContain('fill="#eee" onload="alert(1)"');
    expect(svg).not.toContain('fill="#111" onclick="alert(1)"');
  });
});

describe('renderGroupTiles', () => {
  it('returns per-tile SVG strings with width and height', () => {
    const result = renderGroupTiles(['a', 'b', 'c'], { size: 64 });
    expect(result.tiles).toHaveLength(3);
    expect(result.counter).toBeUndefined();
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBe(64);
    for (const tile of result.tiles) {
      expect(tile.startsWith('<svg')).toBe(true);
      expect(tile.endsWith('</svg>')).toBe(true);
    }
  });

  it('is deterministic for same seeds', () => {
    const a = renderGroupTiles(['alice', 'bob'], { size: 48 });
    const b = renderGroupTiles(['alice', 'bob'], { size: 48 });
    expect(a).toEqual(b);
  });

  it('produces per-tile unique clipPath ids', () => {
    const { tiles } = renderGroupTiles(['a', 'b', 'c'], { size: 64 });
    const ids = tiles.flatMap((t) => [...t.matchAll(/id="navii-clip-([a-z0-9]+)"/g)].map((m) => m[1]));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('emits a +N counter tile when overflow', () => {
    const { tiles, counter } = renderGroupTiles(['a', 'b', 'c', 'd', 'e'], { size: 32, max: 3 });
    expect(tiles).toHaveLength(2);
    expect(counter).toBeDefined();
    expect(counter).toContain('+3');
  });

  it('omits counter tile when no overflow', () => {
    const { tiles, counter } = renderGroupTiles(['a', 'b'], { size: 32, max: 3 });
    expect(tiles).toHaveLength(2);
    expect(counter).toBeUndefined();
  });

  it('throws on empty seeds', () => {
    expect(() => renderGroupTiles([])).toThrow();
  });

  it('width matches composite renderGroup width', () => {
    const seeds = ['x', 'y', 'z'];
    const opts = { size: 48, overlap: 0.3 };
    const tiles = renderGroupTiles(seeds, opts);
    const composite = renderGroup(seeds, opts);
    const compositeW = Number(composite.match(/viewBox="0 0 ([\d.]+)/)?.[1] ?? 0);
    expect(tiles.width).toBe(compositeW);
  });
});