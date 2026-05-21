import { describe, it, expect } from 'vitest';
import { createAvatar, selectAvatar, renderAvatar } from '../src/index.js';

describe('selectAvatar', () => {
  it('is deterministic — same seed → same spec', () => {
    const a = selectAvatar('alice');
    const b = selectAvatar('alice');
    expect(a).toEqual(b);
  });

  it('different seeds typically produce different specs', () => {
    const a = selectAvatar('alice');
    const b = selectAvatar('bob');
    const equalParts =
      a.palette.id === b.palette.id &&
      a.body === b.body &&
      a.eyes === b.eyes &&
      a.mouth === b.mouth &&
      a.antenna === b.antenna &&
      a.accessory === b.accessory &&
      a.background === b.background;
    expect(equalParts).toBe(false);
  });

  it('honors paletteId override', () => {
    const spec = selectAvatar('any', { paletteId: 'mint' });
    expect(spec.palette.id).toBe('mint');
  });

  it('honors background override (string)', () => {
    const spec = selectAvatar('any', { background: 'ring' });
    expect(spec.background).toBe('ring');
  });

  it('includes topper field', () => {
    const spec = selectAvatar('alice');
    expect(spec.topper).toBeDefined();
    expect(typeof spec.topper).toBe('string');
  });

  it('suppresses topper when antenna present (except leaf)', () => {
    // Check across many seeds: any spec with non-none antenna and non-leaf
    // topper should never coexist.
    let conflicts = 0;
    for (let i = 0; i < 200; i++) {
      const s = selectAvatar(`u-${i}`);
      const blocking = s.topper !== 'none' && s.topper !== 'leaf';
      if (s.antenna !== 'none' && blocking) conflicts++;
    }
    expect(conflicts).toBe(0);
  });
});

describe('createAvatar', () => {
  it('returns an SVG string', () => {
    const svg = createAvatar('alice');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('embeds the seed-derived gradient id', () => {
    const svg = createAvatar('hello');
    expect(svg).toMatch(/navii-grad-[a-z0-9]+/);
  });

  it('is byte-identical for the same seed', () => {
    expect(createAvatar('alice')).toBe(createAvatar('alice'));
  });

  it('throws on empty seed', () => {
    expect(() => createAvatar('')).toThrow();
  });

  it('applies size option', () => {
    const svg = createAvatar('alice', { size: 256 });
    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
  });

  it('emits accessible title when provided', () => {
    const svg = createAvatar('alice', { title: 'Alice Smith' });
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="Alice Smith"');
    expect(svg).toContain('<title>Alice Smith</title>');
  });

  it('escapes special characters in title', () => {
    const svg = createAvatar('a', { title: 'A & <B>' });
    expect(svg).toContain('A &amp; &lt;B&gt;');
  });
});

describe('renderAvatar', () => {
  it('produces stable output for a stable spec', () => {
    const spec = selectAvatar('charlie');
    expect(renderAvatar(spec)).toBe(renderAvatar(spec));
  });

  it('spread across many seeds — gradient ids vary', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const svg = createAvatar(`user-${i}`);
      const m = svg.match(/navii-grad-([a-z0-9]+)/);
      if (m && m[1]) ids.add(m[1]);
    }
    expect(ids.size).toBeGreaterThan(30);
  });
});
