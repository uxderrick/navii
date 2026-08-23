/// Direct avatar construction — port of `packages/core/src/build.ts`.
library;

import 'parts/palette.dart';
import 'render.dart';
import 'types.dart';

/// Explicit part choices for [build] — no seed / PRNG.
class BuildSpec {
  const BuildSpec({
    this.palette,
    this.body,
    this.eyes,
    this.mouth,
    this.antenna,
    this.accessory,
    this.background,
    this.topper,
    this.outfit,
    this.hueShift,
    this.bodyScale,
    this.eyeGapShift,
    this.mouthCurveScale,
    this.antennaTilt,
  });

  final String? palette;
  final String? body;
  final String? eyes;
  final String? mouth;
  final String? antenna;
  final String? accessory;
  final String? background;
  final String? topper;
  final String? outfit;
  final double? hueShift;
  final double? bodyScale;
  final double? eyeGapShift;
  final double? mouthCurveScale;
  final double? antennaTilt;
}

/// Build an SVG avatar from explicit part choices (no seed).
String build([
  BuildSpec spec = const BuildSpec(),
  AvatarOptions options = const AvatarOptions(),
]) {
  // `options.palette` (Palette object) wins over `spec.palette` (id).
  final palette = options.palette ??
      (spec.palette != null
          ? (paletteById[spec.palette] ?? palettes.first)
          : palettes.first);

  final resolved = AvatarSpec(
    seed: '__build__',
    palette: palette,
    body: spec.body ?? 'orb',
    eyes: spec.eyes ?? 'round',
    mouth: spec.mouth ?? 'smile',
    antenna: spec.antenna ?? 'none',
    accessory: spec.accessory ?? 'none',
    background: spec.background ?? 'none',
    topper: spec.topper ?? 'none',
    outfit: spec.outfit ?? 'none',
    hueShift: spec.hueShift ?? 0,
    bodyScale: spec.bodyScale ?? 1,
    eyeGapShift: spec.eyeGapShift ?? 0,
    mouthCurveScale: spec.mouthCurveScale ?? 1,
    antennaTilt: spec.antennaTilt ?? 0,
  );

  return renderAvatar(resolved, options);
}
