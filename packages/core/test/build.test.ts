import { describe, it, expect } from 'vitest';
import { build, Navii } from '../src/index.js';

describe('build()', () => {
  it('returns SVG with no args (all defaults)', () => {
    const svg = build();
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('respects palette + body + eyes + mouth choices', () => {
    const svg = build({ palette: 'mint', body: 'tall', eyes: 'star', mouth: 'grin' });
    expect(svg).toContain('#6EE7B7'); // mint bodyFrom
    // mint palette → ink should be in svg too
    expect(svg).toContain('#064E3B');
  });

  it('honors size option from second arg', () => {
    const svg = build({}, { size: 256 });
    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
  });

  it('byte-identical for same spec', () => {
    expect(build({ body: 'tall', eyes: 'star' })).toBe(build({ body: 'tall', eyes: 'star' }));
  });

  it('different specs produce different output', () => {
    const a = build({ body: 'orb', eyes: 'round' });
    const b = build({ body: 'tall', eyes: 'star' });
    expect(a).not.toBe(b);
  });

  it('falls back to first palette on unknown id', () => {
    const svg = build({ palette: 'nonexistent' });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('exposed on Navii namespace', () => {
    expect(Navii.build).toBe(build);
  });
});
