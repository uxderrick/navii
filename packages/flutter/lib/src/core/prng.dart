/// Seed → stable PRNG stream.
///
/// Faithful port of `packages/core/src/prng.ts`.
/// cyrb53 hashes a string seed into two 32-bit halves; sfc32 turns those into
/// a stateful uniform-distribution generator. Same seed → same stream.
library;

/// JS `Math.imul` — 32-bit signed multiply.
int _imul(int a, int b) => (a * b).toSigned(32);

/// JS `>>>` on a 32-bit value.
int _urshift(int x, int n) => (x & 0xFFFFFFFF) >> n;

/// JS `| 0` — force signed 32-bit.
int _i32(int x) => x.toSigned(32);

/// JS `>>> 0` — force unsigned 32-bit as non-negative int.
int _u32(int x) => x & 0xFFFFFFFF;

/// Hash [input] into two unsigned 32-bit halves. Optional [salt] matches TS.
List<int> cyrb53(String input, [int salt = 0]) {
  var h1 = _i32(0xdeadbeef ^ salt);
  var h2 = _i32(0x41c6ce57 ^ salt);
  for (var i = 0; i < input.length; i++) {
    final ch = input.codeUnitAt(i);
    h1 = _imul(h1 ^ ch, 2654435761);
    h2 = _imul(h2 ^ ch, 1597334677);
  }
  h1 = _imul(h1 ^ _urshift(h1, 16), 2246822507);
  h1 ^= _imul(h2 ^ _urshift(h2, 13), 3266489909);
  h2 = _imul(h2 ^ _urshift(h2, 16), 2246822507);
  h2 ^= _imul(h1 ^ _urshift(h1, 13), 3266489909);
  return [_u32(h1), _u32(h2)];
}

/// Deterministic PRNG seeded from a string.
///
/// Method names differ slightly from TS (`int` → [nextInt], `bool` → [nextBool])
/// because those are reserved in Dart; stream values match `@usenavii/core`.
abstract class Rng {
  /// Uniform float in `[0, 1)`.
  double next();

  /// Uniform int in `[0, maxExclusive)` — TS `rng.int(maxExclusive)`.
  int nextInt(int maxExclusive);

  /// Pick one element — TS `rng.pick(arr)`.
  T pick<T>(List<T> arr);

  /// Bernoulli trial — TS `rng.bool(probabilityTrue)`.
  bool nextBool([double probabilityTrue = 0.5]);

  /// Uniform float in `[min, max)` — TS `rng.range(min, max)`.
  double range(double min, double max);
}

/// Create an [Rng] whose stream matches `@usenavii/core` `createRng(seed)`.
Rng createRng(String seed) {
  final ab = cyrb53(seed, 0);
  final cd = cyrb53(seed, 1);

  var s0 = ab[0];
  var s1 = ab[1];
  var s2 = cd[0];
  var s3 = cd[1];

  double sfc32() {
    s0 = _i32(s0);
    s1 = _i32(s1);
    s2 = _i32(s2);
    s3 = _i32(s3);
    // JS: const t = ((s0 + s1) | 0) + s3 | 0;
    final t = _i32(_i32(s0 + s1) + s3);
    s3 = _i32(s3 + 1);
    s0 = s1 ^ _urshift(s1, 9);
    s1 = _i32(s2 + _i32(s2 << 3));
    s2 = _i32(_i32(s2 << 21) | _urshift(s2, 11));
    s2 = _i32(s2 + t);
    return _u32(t) / 4294967296.0;
  }

  return _Sfc32Rng(sfc32);
}

class _Sfc32Rng implements Rng {
  _Sfc32Rng(this._sfc32);
  final double Function() _sfc32;

  @override
  double next() => _sfc32();

  @override
  int nextInt(int maxExclusive) => (_sfc32() * maxExclusive).floor();

  @override
  T pick<T>(List<T> arr) {
    if (arr.isEmpty) {
      throw StateError('cannot pick from empty array');
    }
    return arr[(_sfc32() * arr.length).floor()];
  }

  @override
  bool nextBool([double probabilityTrue = 0.5]) => _sfc32() < probabilityTrue;

  @override
  double range(double min, double max) => min + _sfc32() * (max - min);
}
