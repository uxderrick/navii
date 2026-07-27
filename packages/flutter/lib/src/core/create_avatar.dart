import 'types.dart';

/// Render a deterministic mascot avatar from a seed.
///
/// Same seed in → same SVG out. Implementation: Phases 3–4 in root AGENTS.md.
String createAvatar(String seed, [AvatarOptions options = const AvatarOptions()]) {
  if (seed.isEmpty) {
    throw ArgumentError('navii: seed must be a non-empty string');
  }
  throw UnimplementedError(
    'createAvatar: Dart core port not implemented yet (see AGENTS.md Phase 3–4)',
  );
}

/// Resolve parts without rendering.
AvatarSpec selectAvatar(String seed, [AvatarOptions options = const AvatarOptions()]) {
  if (seed.isEmpty) {
    throw ArgumentError('navii: seed must be a non-empty string');
  }
  throw UnimplementedError(
    'selectAvatar: Dart core port not implemented yet (see AGENTS.md Phase 3)',
  );
}

/// Spec → full `<svg>` string.
String renderAvatar(AvatarSpec spec, [AvatarOptions options = const AvatarOptions()]) {
  throw UnimplementedError(
    'renderAvatar: Dart core port not implemented yet (see AGENTS.md Phase 4)',
  );
}

/// Composite overlapping stack SVG.
String renderGroup(List<String> seeds, [GroupOptions options = const GroupOptions()]) {
  throw UnimplementedError(
    'renderGroup: Dart core port not implemented yet (see AGENTS.md Phase 5)',
  );
}

/// Per-tile SVGs for Flutter [NaviiGroup].
GroupTiles renderGroupTiles(
  List<String> seeds, [
  GroupOptions options = const GroupOptions(),
]) {
  throw UnimplementedError(
    'renderGroupTiles: Dart core port not implemented yet (see AGENTS.md Phase 5)',
  );
}

/// Random avatar + seed to persist. Implementation: Phase 4+.
({String svg, String seed}) random([AvatarOptions options = const AvatarOptions()]) {
  throw UnimplementedError(
    'random: Dart core port not implemented yet (see AGENTS.md Phase 4)',
  );
}
