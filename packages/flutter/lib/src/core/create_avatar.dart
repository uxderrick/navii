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
  // Match core: prefer UUID-like entropy via DateTime + hash fallback.
  final a = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
  final b = (DateTime.now().millisecondsSinceEpoch ^ 0x9e3779b9).toRadixString(36);
  return '$a$b';
}
