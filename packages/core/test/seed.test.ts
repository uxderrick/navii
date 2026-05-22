import { describe, it, expect } from 'vitest';
import { seed, Navii, createAvatar } from '../src/index.js';

describe('seed()', () => {
  it('prefers id over email/name', () => {
    expect(seed({ id: 'u123', email: 'a@b.c', name: 'Alice' })).toBe('u123');
  });

  it('coerces numeric id to string', () => {
    expect(seed({ id: 42 })).toBe('42');
  });

  it('falls back to email when id missing', () => {
    expect(seed({ email: 'a@b.c', name: 'Alice' })).toBe('a@b.c');
  });

  it('composes name + createdAt when only name available', () => {
    const ts = 1700000000000;
    expect(seed({ name: 'Alice', createdAt: ts })).toBe(`Alice|${ts}`);
  });

  it('accepts Date for createdAt', () => {
    const d = new Date('2024-01-01T00:00:00Z');
    expect(seed({ name: 'Alice', createdAt: d })).toBe(`Alice|${d.getTime()}`);
  });

  it('accepts ISO string for createdAt', () => {
    expect(seed({ name: 'Alice', createdAt: '2024-01-01T00:00:00Z' })).toMatch(/^Alice\|\d+$/);
  });

  it('returns bare name as last resort', () => {
    expect(seed({ name: 'Alice' })).toBe('Alice');
  });

  it('skips empty strings', () => {
    expect(seed({ id: '', email: 'a@b.c' })).toBe('a@b.c');
  });

  it('throws when nothing usable', () => {
    expect(() => seed({})).toThrow();
    expect(() => seed({ id: null, email: undefined, name: '' })).toThrow();
  });

  it('produces a string that createAvatar accepts', () => {
    const s = seed({ id: 'u-42', email: 'a@b.c' });
    expect(() => createAvatar(s)).not.toThrow();
  });

  it('exposed on Navii namespace', () => {
    expect(Navii.seed).toBe(seed);
  });
});
