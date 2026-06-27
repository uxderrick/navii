import { describe, it, expect } from 'vitest';
import { renderGroup, renderGroupTiles, Navii } from '../src/index.js';

const stripClipIds = (svg: string): string => svg.replace(/navii-clip-[a-z0-9]+/g, 'navii-clip-X');

describe('renderGroup', () => {
  it('returns SVG with N tiles', () => {
    const svg = renderGroup(['a', 'b', 'c'], { size: 64 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    const tiles = svg.match(/<svg [^>]* x="/g);
    expect(tiles?.length).toBe(3);
  });

  it('is visually deterministic for same seeds (clip ids vary, shapes match)', () => {
    const a = renderGroup(['alice', 'bob'], { size: 48 });
    const b = renderGroup(['alice', 'bob'], { size: 48 });
    expect(stripClipIds(a)).toBe(stripClipIds(b));
  });

  it('produces different clip ids across calls with same seeds', () => {
    const a = renderGroup(['alice', 'bob'], { size: 48 });
    const b = renderGroup(['alice', 'bob'], { size: 48 });
    const idA = a.match(/navii-clip-([a-z0-9]+)/)?.[1];
    const idB = b.match(/navii-clip-([a-z0-9]+)/)?.[1];
    expect(idA).not.toBe(idB);
  });

  it('respects max with +N counter tile', () => {
    const svg = renderGroup(['a', 'b', 'c', 'd', 'e', 'f'], { size: 32, max: 4 });
    expect(svg).toContain('+3');
    const tiles = svg.match(/<svg [^>]* x="/g);
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

  it('is visually deterministic for same seeds (clip ids vary, shapes match)', () => {
    const a = renderGroupTiles(['alice', 'bob'], { size: 48 });
    const b = renderGroupTiles(['alice', 'bob'], { size: 48 });
    const stripTiles = (t: typeof a) => ({
      ...t,
      tiles: t.tiles.map(stripClipIds),
      counter: t.counter ? stripClipIds(t.counter) : undefined,
    });
    expect(stripTiles(a)).toEqual(stripTiles(b));
  });

  it('produces different clip ids across calls with same seeds', () => {
    const a = renderGroupTiles(['alice', 'bob'], { size: 48 });
    const b = renderGroupTiles(['alice', 'bob'], { size: 48 });
    const idA = a.tiles[0]?.match(/navii-clip-([a-z0-9]+)/)?.[1];
    const idB = b.tiles[0]?.match(/navii-clip-([a-z0-9]+)/)?.[1];
    expect(idA).not.toBe(idB);
  });

  it('produces per-tile unique clipPath ids', () => {
    const { tiles } = renderGroupTiles(['a', 'b', 'c'], { size: 64 });
    const ids = tiles.flatMap((t) => [...t.matchAll(/id="navii-clip-([a-z0-9]+)"/g)].map((m) => m[1]));
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('produces different clipPath ids with groupId', () => {
    const a = renderGroupTiles(['a', 'b'], { groupId: 'group-a' });
    const b = renderGroupTiles(['a', 'b'], { groupId: 'group-b' });
    const idsA = a.tiles.flatMap((t) => [...t.matchAll(/id="navii-clip-([a-z0-9]+)"/g)].map((m) => m[1]));
    const idsB = b.tiles.flatMap((t) => [...t.matchAll(/id="navii-clip-([a-z0-9]+)"/g)].map((m) => m[1]));
    expect(idsA).not.toEqual(idsB);
  });

  it('includes xmlns on standalone tile SVGs', () => {
    const { tiles } = renderGroupTiles(['a'], { size: 48 });
    expect(tiles[0]).toContain('xmlns="http://www.w3.org/2000/svg"');
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

  it('renders counter-only output when max is 0', () => {
    const { tiles, counter } = renderGroupTiles(['a', 'b', 'c'], { size: 32, max: 0 });
    expect(tiles).toHaveLength(0);
    expect(counter).toBeDefined();
    expect(counter).toContain('+3');
  });

  it('composite renderGroup includes counter when max is 0', () => {
    const svg = renderGroup(['a', 'b', 'c'], { size: 32, max: 0 });
    expect(svg).toContain('+3');
    expect(svg).not.toContain('viewBox="0 0 0 0"');
  });

  it('Navii namespace exposes groupTiles and renderGroupTiles', () => {
    expect(typeof Navii.groupTiles).toBe('function');
    expect(typeof Navii.renderGroupTiles).toBe('function');
  });
});