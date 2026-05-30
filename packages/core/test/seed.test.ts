import { describe, it, expect } from 'vitest';
import { seed, seedFromEmail, normalizeEmail, sha256Hex, Navii, createAvatar } from '../src/index.js';

describe('seed()', () => {
  it('prefers id over email/name', () => {
    expect(seed({ id: 'u123', email: 'a@b.c', name: 'Alice' })).toBe('u123');
  });

  it('coerces numeric id to string', () => {
    expect(seed({ id: 42 })).toBe('42');
  });

  it('hashes email by default when id missing', () => {
    expect(seed({ email: 'a@b.c', name: 'Alice' })).toBe(seedFromEmail('a@b.c'));
  });

  it('returns raw email when hashEmail: false', () => {
    expect(seed({ email: 'a@b.c' }, { hashEmail: false })).toBe('a@b.c');
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
    expect(seed({ id: '', email: 'a@b.c' }, { hashEmail: false })).toBe('a@b.c');
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

describe('seedFromEmail()', () => {
  // Vectors generated with `printf "<input>" | shasum -a 256`.
  // These match Gravatar's sha256 scheme exactly when the input is the
  // trimmed + lowercased email — verified against gravatar.com docs.
  it('matches Gravatar sha256 for "test@example.com"', () => {
    expect(seedFromEmail('test@example.com')).toBe(
      '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b',
    );
  });

  it('normalizes whitespace + case (Gravatar parity)', () => {
    expect(seedFromEmail('  Test@Example.COM  ')).toBe(
      seedFromEmail('test@example.com'),
    );
  });

  it('produces lowercase hex of the expected length', () => {
    const out = seedFromEmail('user@navii.dev');
    expect(out).toMatch(/^[0-9a-f]{64}$/);
  });

  it('throws on empty input', () => {
    expect(() => seedFromEmail('')).toThrow();
    // @ts-expect-error runtime check
    expect(() => seedFromEmail(null)).toThrow();
  });

  it('exposed on Navii namespace', () => {
    expect(Navii.seedFromEmail).toBe(seedFromEmail);
  });
});

describe('normalizeEmail()', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  A@B.C  ')).toBe('a@b.c');
  });
});

describe('sha256Hex()', () => {
  // FIPS 180-4 test vectors.
  it('empty string', () => {
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('"abc"', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('long input crossing block boundary', () => {
    // 112 chars → forces an extra padding block.
    const s = 'a'.repeat(112);
    expect(sha256Hex(s)).toMatch(/^[0-9a-f]{64}$/);
  });
});
