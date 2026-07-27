import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../core/create_avatar.dart';
import '../core/types.dart';

/// Flutter avatar. Renders the engine SVG via [SvgPicture.string].
///
/// Animation (`animated`) is accepted but painted statically in v1 — CSS
/// keyframe blocks from the engine do not run inside `flutter_svg`.
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
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.semanticsLabel,
  });

  /// Stable unique identifier per user. Prefer `user.id` → UUID → email.
  final String seed;
  final double size;
  final String? paletteId;
  final Palette? palette;
  final Object? background;
  final MoodId? mood;
  final List<String>? packs;

  /// Engine style hint (`masc` / `femme` / `neutral`). Host layout uses [width]/[height]/[fit].
  final StyleHint? styleHint;
  final String? title;
  final String? alt;
  final bool animated;
  final String? tileBg;
  final double? width;
  final double? height;
  final BoxFit fit;
  final String? semanticsLabel;

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

  @override
  Widget build(BuildContext context) {
    final svg = createAvatar(seed, _options);
    final label = semanticsLabel ?? alt ?? title;
    final picture = SvgPicture.string(
      svg,
      width: width ?? size,
      height: height ?? size,
      fit: fit,
      semanticsLabel: label,
    );
    if (label == null) return picture;
    return Semantics(
      label: label,
      image: true,
      child: picture,
    );
  }
}
