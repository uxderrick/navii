/// Overlapping avatar stacks — port of `packages/core/src/group.ts`.
library;

import 'js_num.dart';
import 'render.dart';
import 'select.dart';
import 'types.dart';
import 'xml.dart';

/// Renders N seeded avatars in a horizontal overlapping stack, with an optional
/// "+N" counter tile when [GroupOptions.max] is exceeded.
String renderGroup(
  List<String> seeds, [
  GroupOptions options = const GroupOptions(),
]) {
  final t = renderGroupTiles(seeds, options);
  return _wrapGroupTiles(t);
}

/// Returns per-tile SVG strings instead of a single composite SVG.
///
/// Enables per-tile rendering in Flutter [NaviiGroup] where nested `<svg>`
/// elements are not used.
GroupTiles renderGroupTiles(
  List<String> seeds, [
  GroupOptions options = const GroupOptions(),
]) {
  if (seeds.isEmpty) {
    throw ArgumentError('navii: renderGroup requires at least one seed');
  }
  final size = options.size ?? 64;
  final overlap = _clamp(options.overlap ?? 0.3, 0, 0.7);
  final max = options.max ?? seeds.length;
  final ring = escapeXml(options.ring ?? '#ffffff');
  final tileBg = escapeXml(options.tileBg ?? '#ffffff');
  final counterFill = escapeXml(options.counterFill ?? '#E5E7EB');
  final counterInk = escapeXml(options.counterInk ?? '#374151');
  final salt = _groupSalt(seeds, options);

  final visibleCount =
      (max - (seeds.length > max ? 1 : 0)).clamp(0, seeds.length);
  final visibleSeeds = seeds.sublist(0, visibleCount);
  final overflow = seeds.length - visibleSeeds.length;
  final tileCount = visibleSeeds.length + (overflow > 0 ? 1 : 0);

  final step = size * (1 - overlap);
  final totalWidth =
      tileCount > 0 ? step * (tileCount - 1) + size : 0.0;

  final tiles = <String>[];
  for (var i = 0; i < visibleSeeds.length; i++) {
    final seed = visibleSeeds[i];
    final x = i * step;
    final spec = selectAvatar(seed, options);
    final tileId = _stableTileId(seed, i, salt);
    final bgCircle = tileBg != 'transparent'
        ? '<circle cx="50" cy="50" r="50" fill="$tileBg" />'
        : '';
    tiles.add(
      '<svg xmlns="http://www.w3.org/2000/svg" x="${jn(x)}" y="0" width="${jn(size)}" height="${jn(size)}" viewBox="0 0 100 100" overflow="visible">\n'
      '      <defs><clipPath id="navii-clip-$tileId"><circle cx="50" cy="50" r="50" /></clipPath></defs>\n'
      '      <g clip-path="url(#navii-clip-$tileId)">$bgCircle${renderAvatarInner(spec, options)}</g>\n'
      '      <circle cx="50" cy="50" r="49" fill="none" stroke="$ring" stroke-width="2" />\n'
      '    </svg>',
    );
  }

  if (overflow > 0) {
    final x = visibleSeeds.length * step;
    final counter =
        '<svg xmlns="http://www.w3.org/2000/svg" x="${jn(x)}" y="0" width="${jn(size)}" height="${jn(size)}" viewBox="0 0 100 100" overflow="visible">\n'
        '      <circle cx="50" cy="50" r="50" fill="$counterFill" />\n'
        '      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, system-ui, sans-serif" font-weight="600" font-size="34" fill="$counterInk">+$overflow</text>\n'
        '      <circle cx="50" cy="50" r="49" fill="none" stroke="$ring" stroke-width="2" />\n'
        '    </svg>';
    return GroupTiles(
      tiles: tiles,
      counter: counter,
      width: totalWidth,
      height: size,
    );
  }

  return GroupTiles(
    tiles: tiles,
    width: totalWidth,
    height: size,
  );
}

String _wrapGroupTiles(GroupTiles t) {
  final all = t.counter != null ? [...t.tiles, t.counter!] : t.tiles;
  if (all.isEmpty) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" aria-hidden="true"></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${jn(t.width)} ${jn(t.height)}" width="${jn(t.width)}" height="${jn(t.height)}" aria-hidden="true">${all.join('')}</svg>';
}

String _groupSalt(List<String> seeds, GroupOptions options) {
  final groupId = options.groupId;
  if (groupId != null) return 'g:$groupId';
  var h = 5381;
  for (var i = 0; i < seeds.length; i++) {
    final s = seeds[i];
    for (var j = 0; j < s.length; j++) {
      h = ((h << 5) + h + s.codeUnitAt(j)).toSigned(32);
    }
    h = ((h << 5) + h + 0x1f).toSigned(32);
  }
  return 'g:${(h & 0xFFFFFFFF).toRadixString(36)}';
}

String _stableTileId(String seed, int index, String salt) {
  var h = 5381;
  final s = '$salt:$index:$seed';
  for (var i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.codeUnitAt(i)).toSigned(32);
  }
  return (h & 0xFFFFFFFF).toRadixString(36);
}

double _clamp(double n, double lo, double hi) {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}
