/**
 * Seed → stable PRNG stream.
 *
 * cyrb53 hashes a string seed into two 32-bit halves; sfc32 turns those into
 * a stateful uniform-distribution generator. Same seed → same stream → same avatar.
 */

export function cyrb53(input: string, salt = 0): [number, number] {
  let h1 = 0xdeadbeef ^ salt;
  let h2 = 0x41c6ce57 ^ salt;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h1 >>> 0, h2 >>> 0];
}

export interface Rng {
  next(): number;
  int(maxExclusive: number): number;
  pick<T>(arr: readonly T[]): T;
  bool(probabilityTrue?: number): boolean;
  range(min: number, max: number): number;
}

export function createRng(seed: string): Rng {
  const [a, b] = cyrb53(seed, 0);
  const [c, d] = cyrb53(seed, 1);

  let s0 = a >>> 0;
  let s1 = b >>> 0;
  let s2 = c >>> 0;
  let s3 = d >>> 0;

  function sfc32(): number {
    s0 |= 0; s1 |= 0; s2 |= 0; s3 |= 0;
    const t = ((s0 + s1) | 0) + s3 | 0;
    s3 = (s3 + 1) | 0;
    s0 = s1 ^ (s1 >>> 9);
    s1 = (s2 + (s2 << 3)) | 0;
    s2 = (s2 << 21) | (s2 >>> 11);
    s2 = (s2 + t) | 0;
    return (t >>> 0) / 4294967296;
  }

  const rng: Rng = {
    next: sfc32,
    int(maxExclusive) {
      return Math.floor(sfc32() * maxExclusive);
    },
    pick(arr) {
      if (arr.length === 0) throw new Error('cannot pick from empty array');
      return arr[Math.floor(sfc32() * arr.length)] as (typeof arr)[number];
    },
    bool(probabilityTrue = 0.5) {
      return sfc32() < probabilityTrue;
    },
    range(min, max) {
      return min + sfc32() * (max - min);
    },
  };

  return rng;
}
