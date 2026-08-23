/// Sync SHA-256 (FIPS 180-4) → lowercase hex.
///
/// Faithful port of `packages/core/src/sha256.ts` — used by [seedFromEmail]
/// to match Gravatar's scheme.
library;

final List<int> _k = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

int _rotr(int x, int n) {
  final u = x & 0xFFFFFFFF;
  return ((u >> n) | (u << (32 - n))) & 0xFFFFFFFF;
}

int _u32(int x) => x & 0xFFFFFFFF;

/// UTF-8 encode matching `TextEncoder` / the TS fallback (UTF-16 code units → UTF-8).
List<int> _utf8Encode(String str) {
  final out = <int>[];
  for (var i = 0; i < str.length; i++) {
    var c = str.codeUnitAt(i);
    if (c < 0x80) {
      out.add(c);
    } else if (c < 0x800) {
      out.add(0xc0 | (c >> 6));
      out.add(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.add(0xe0 | (c >> 12));
      out.add(0x80 | ((c >> 6) & 0x3f));
      out.add(0x80 | (c & 0x3f));
    } else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (str.codeUnitAt(i) & 0x3ff));
      out.add(0xf0 | (c >> 18));
      out.add(0x80 | ((c >> 12) & 0x3f));
      out.add(0x80 | ((c >> 6) & 0x3f));
      out.add(0x80 | (c & 0x3f));
    }
  }
  return out;
}

int _getUint32BE(List<int> buf, int offset) {
  return ((buf[offset] & 0xff) << 24) |
      ((buf[offset + 1] & 0xff) << 16) |
      ((buf[offset + 2] & 0xff) << 8) |
      (buf[offset + 3] & 0xff);
}

void _setUint32BE(List<int> buf, int offset, int value) {
  final v = value & 0xFFFFFFFF;
  buf[offset] = (v >> 24) & 0xff;
  buf[offset + 1] = (v >> 16) & 0xff;
  buf[offset + 2] = (v >> 8) & 0xff;
  buf[offset + 3] = v & 0xff;
}

/// SHA-256 of [input] as lowercase hex (64 chars).
String sha256Hex(String input) {
  final msg = _utf8Encode(input);
  final bitLen = msg.length * 8;

  final padLen = ((msg.length + 9 + 63) & ~63) - msg.length;
  final buf = List<int>.filled(msg.length + padLen, 0);
  for (var i = 0; i < msg.length; i++) {
    buf[i] = msg[i];
  }
  buf[msg.length] = 0x80;
  _setUint32BE(buf, buf.length - 4, bitLen);
  _setUint32BE(buf, buf.length - 8, bitLen ~/ 0x100000000);

  final H = <int>[
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19,
  ];
  final W = List<int>.filled(64, 0);

  for (var chunk = 0; chunk < buf.length; chunk += 64) {
    for (var i = 0; i < 16; i++) {
      W[i] = _getUint32BE(buf, chunk + i * 4);
    }
    for (var i = 16; i < 64; i++) {
      final s0 = _rotr(W[i - 15], 7) ^ _rotr(W[i - 15], 18) ^ (W[i - 15] >> 3);
      final s1 = _rotr(W[i - 2], 17) ^ _rotr(W[i - 2], 19) ^ (W[i - 2] >> 10);
      W[i] = _u32(W[i - 16] + s0 + W[i - 7] + s1);
    }
    var a = H[0], b = H[1], c = H[2], d = H[3];
    var e = H[4], f = H[5], g = H[6], h = H[7];
    for (var i = 0; i < 64; i++) {
      final sum1 = _rotr(e, 6) ^ _rotr(e, 11) ^ _rotr(e, 25);
      final ch = (e & f) ^ ((~e) & g);
      final t1 = _u32(h + sum1 + ch + _k[i] + W[i]);
      final sum0 = _rotr(a, 2) ^ _rotr(a, 13) ^ _rotr(a, 22);
      final mj = (a & b) ^ (a & c) ^ (b & c);
      final t2 = _u32(sum0 + mj);
      h = g;
      g = f;
      f = e;
      e = _u32(d + t1);
      d = c;
      c = b;
      b = a;
      a = _u32(t1 + t2);
    }
    H[0] = _u32(H[0] + a);
    H[1] = _u32(H[1] + b);
    H[2] = _u32(H[2] + c);
    H[3] = _u32(H[3] + d);
    H[4] = _u32(H[4] + e);
    H[5] = _u32(H[5] + f);
    H[6] = _u32(H[6] + g);
    H[7] = _u32(H[7] + h);
  }

  final out = StringBuffer();
  for (var i = 0; i < 8; i++) {
    out.write(H[i].toRadixString(16).padLeft(8, '0'));
  }
  return out.toString();
}
