import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../core/create_avatar.dart';
import '../core/types.dart';

/// Flutter avatar. Renders the engine SVG via [SvgPicture.string].
///
/// Mirrors `@usenavii/react-native` [Navii]: map props → [AvatarOptions],
/// paint with [flutter_svg]. Animation (`animated`) is accepted but painted
/// statically in v1 — CSS keyframe blocks from the engine do not run inside
/// `flutter_svg`.
class Navii extends StatelessWidget {
  const Navii({
    super.key,
    required this.seed,
    this.size = 96,
    this.paletteId,
    this.palette,
    this.background,
    this.mood,
    this.packs,
    this.styleHint,
    this.title,
    this.alt,
    this.animated = false,
    this.tileBg,
  });

  /// Stable unique identifier per user. Prefer `user.id` → UUID → email.
  final String seed;
  final double size;
  final String? paletteId;
  final Palette? palette;

  /// `'none' | 'solid' | 'ring'` or [BackgroundOverride].
  final Object? background;
  final MoodId? mood;
  final List<String>? packs;

  /// Engine style hint (`masc` / `femme` / `neutral`).
  ///
  /// Named [styleHint] so Flutter's host [Widget] can keep its own layout
  /// `style` / decoration (mirrors RN `styleHint` → engine `style`).
  final StyleHint? styleHint;
  final String? title;
  final String? alt;
  final bool animated;
  final String? tileBg;

  AvatarOptions get _options => AvatarOptions(
        size: size,
        paletteId: paletteId,
        palette: palette,
        background: background,
        mood: mood,
        packs: packs,
        style: styleHint,
        title: title,
        animated: animated,
        tileBg: tileBg,
      );

  /// Accessible label: [alt] wins over [title] (same as RN).
  String? get _label => alt ?? title;

  @override
  Widget build(BuildContext context) {
    final svg = createAvatar(seed, _options);
    final label = _label;
    final picture = SvgPicture.string(
      svg,
      width: size,
      height: size,
      fit: BoxFit.contain,
      excludeFromSemantics: label != null,
    );

    if (label == null) {
      return SizedBox(width: size, height: size, child: picture);
    }

    return Semantics(
      label: label,
      image: true,
      child: SizedBox(width: size, height: size, child: picture),
    );
  }
}
