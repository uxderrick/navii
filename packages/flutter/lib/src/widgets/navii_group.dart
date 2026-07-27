import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../core/create_avatar.dart';
import '../core/types.dart';

/// Overlapping avatar stack. Each tile is an independent [SvgPicture.string].
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
  final StyleHint? styleHint;
  final String? alt;
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
    final all = [
      ...tiles.tiles,
      if (tiles.counter != null) tiles.counter!,
    ];

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
            for (var i = 0; i < all.length; i++)
              Positioned(
                left: i * step,
                top: 0,
                width: size,
                height: size,
                child: SvgPicture.string(
                  all[i],
                  width: size,
                  height: size,
                  fit: BoxFit.contain,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
