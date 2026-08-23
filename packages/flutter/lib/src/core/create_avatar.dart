import 'dart:math';

import 'render.dart';
import 'select.dart';
import 'types.dart';

export 'build.dart' show build, BuildSpec;
export 'group.dart' show renderGroup, renderGroupTiles;
export 'render.dart' show renderAvatar, renderAvatarInner;
export 'select.dart' show selectAvatar;

/// Render a deterministic mascot avatar from a seed.
///
/// Same seed in → same SVG out, byte-identical with `@usenavii/core`.
String createAvatar(String seed, [AvatarOptions options = const AvatarOptions()]) {
  if (seed.isEmpty) {
    throw ArgumentError('navii: seed must be a non-empty string');
  }
  return renderAvatar(selectAvatar(seed, options), options);
}

/// Random avatar + seed to persist.
({String svg, String seed}) random([AvatarOptions options = const AvatarOptions()]) {
  final seed = _randomSeed();
  return (svg: createAvatar(seed, options), seed: seed);
}

String _randomSeed() {
  final secureRandom = Random.secure();
  final bytes = List<int>.generate(16, (_) => secureRandom.nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  final hex = bytes.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join();
  return '${hex.substring(0, 8)}-'
      '${hex.substring(8, 12)}-'
      '${hex.substring(12, 16)}-'
      '${hex.substring(16, 20)}-'
      '${hex.substring(20)}';
}
