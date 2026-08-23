import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../core/group.dart';
import '../core/types.dart';

/// Overlapping avatar stack for Flutter.
///
/// Mirrors `@usenavii/react-native` [NaviiGroup]: each avatar tile is an
/// independent [SvgPicture.string] inside a positioned [Stack]. The `+N`
/// overflow tile is painted with Flutter widgets — `flutter_svg` ignores
/// SVG `dominant-baseline`, which left engine counter text sitting high.
/// Empty [seeds] yields a zero-size widget (RN returns `null`).
class NaviiGroup extends StatelessWidget {
  const NaviiGroup({
    super.key,
    required this.seeds,
    this.size = 64,
    this.overlap = 0.3,
    this.max,
    this.ring,
    this.tileBg,
    this.counterFill,
    this.counterInk,
    this.paletteId,
    this.palette,
    this.background,
    this.mood,
    this.animated = false,
    this.packs,
    this.styleHint,
    this.alt,
    this.groupId,
  });

  final List<String> seeds;
  final double size;
  final double overlap;
  final int? max;
  final String? ring;
  final String? tileBg;
  final String? counterFill;
  final String? counterInk;
  final String? paletteId;
  final Palette? palette;
  final Object? background;
  final MoodId? mood;
  final bool animated;
  final List<String>? packs;

  /// Engine style hint (`masc` / `femme` / `neutral`).
  final StyleHint? styleHint;
  final String? alt;

  /// Optional clipPath id namespace when multiple groups share the same seeds.
  final String? groupId;

  GroupOptions get _options => GroupOptions(
        size: size,
        overlap: overlap,
        max: max,
        ring: ring,
        tileBg: tileBg,
        counterFill: counterFill,
        counterInk: counterInk,
        paletteId: paletteId,
        palette: palette,
        background: background,
        mood: mood,
        animated: animated,
        packs: packs,
        style: styleHint,
        groupId: groupId,
      );

  @override
  Widget build(BuildContext context) {
    if (seeds.isEmpty) {
      return const SizedBox.shrink();
    }

    final tiles = renderGroupTiles(seeds, _options);
    final clampedOverlap = overlap.clamp(0.0, 0.7);
    final step = size * (1 - clampedOverlap);
    final overflow = _overflowCount(seeds.length, max);
    final label = alt ?? 'Group of ${seeds.length} avatars';

    return Semantics(
      label: label,
      image: true,
      child: SizedBox(
        width: tiles.width,
        height: tiles.height,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            for (var i = 0; i < tiles.tiles.length; i++)
              Positioned(
                left: i * step,
                top: 0,
                width: size,
                height: size,
                child: SvgPicture.string(
                  tiles.tiles[i],
                  width: size,
                  height: size,
                  fit: BoxFit.contain,
                  excludeFromSemantics: true,
                ),
              ),
            if (overflow > 0)
              Positioned(
                left: tiles.tiles.length * step,
                top: 0,
                width: size,
                height: size,
                child: _CounterTile(
                  count: overflow,
                  size: size,
                  fill: counterFill ?? '#E5E7EB',
                  ink: counterInk ?? '#374151',
                  ring: ring ?? '#ffffff',
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Matches engine overflow math in [renderGroupTiles].
int _overflowCount(int seedCount, int? max) {
  final capped = max ?? seedCount;
  final visible =
      (capped - (seedCount > capped ? 1 : 0)).clamp(0, seedCount);
  return seedCount - visible;
}

/// Flutter-native `+N` disc. Keeps engine SVG counter strings for goldens /
/// `renderGroup`, but centers label correctly under `flutter_svg`.
class _CounterTile extends StatelessWidget {
  const _CounterTile({
    required this.count,
    required this.size,
    required this.fill,
    required this.ink,
    required this.ring,
  });

  final int count;
  final double size;
  final String fill;
  final String ink;
  final String ring;

  @override
  Widget build(BuildContext context) {
    // Engine counter uses font-size 34 in a 100×100 viewBox.
    final fontSize = size * 0.34;
    // stroke-width 2 on the ring circle in the same viewBox.
    final stroke = (size * 0.02).clamp(1.0, 3.0);

    return DecoratedBox(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _parseCssHexColor(fill),
        border: Border.all(
          color: _parseCssHexColor(ring),
          width: stroke,
        ),
      ),
      child: Center(
        child: Text(
          '+$count',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: _parseCssHexColor(ink),
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            height: 1.0,
            leadingDistribution: TextLeadingDistribution.even,
          ),
        ),
      ),
    );
  }
}

Color _parseCssHexColor(String raw) {
  var hex = raw.trim();
  if (hex.startsWith('#')) hex = hex.substring(1);

  if (hex.length == 3 || hex.length == 4) {
    hex = hex.split('').map((digit) => '$digit$digit').join();
  }

  final isValidLength = hex.length == 6 || hex.length == 8;
  final isHex = RegExp(r'^[0-9a-fA-F]+$').hasMatch(hex);
  if (!isValidLength || !isHex) {
    throw ArgumentError.value(raw, 'color', 'navii: expected a CSS hex color');
  }

  final argb = hex.length == 6
      ? 'FF$hex'
      : '${hex.substring(6, 8)}${hex.substring(0, 6)}';
  return Color(int.parse(argb, radix: 16));
}
