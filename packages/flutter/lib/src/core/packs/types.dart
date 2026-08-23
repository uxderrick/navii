/// Pack type definitions — port of `packages/core/src/packs/types.ts`.
library;

import '../types.dart';

/// Part subset constraints for a pack.
class PackPicks {
  const PackPicks({
    this.body,
    this.eyes,
    this.mouth,
    this.antenna,
    this.accessory,
    this.topper,
    this.background,
    this.outfit,
  });

  final List<String>? body;
  final List<String>? eyes;
  final List<String>? mouth;
  final List<String>? antenna;
  final List<String>? accessory;
  final List<String>? topper;
  final List<String>? background;
  final List<String>? outfit;
}

/// Style-hint part subsets.
class StylePartSubset {
  const StylePartSubset({
    this.eyes,
    this.mouth,
    this.outfit,
    this.accessory,
    this.topper,
  });

  final List<String>? eyes;
  final List<String>? mouth;
  final List<String>? outfit;
  final List<String>? accessory;
  final List<String>? topper;
}

/// Style hint → subset map on a pack.
class PackStyleHints {
  const PackStyleHints({this.masc, this.femme, this.neutral});

  final StylePartSubset? masc;
  final StylePartSubset? femme;
  final StylePartSubset? neutral;

  StylePartSubset? operator [](String hint) {
    switch (hint) {
      case 'masc':
        return masc;
      case 'femme':
        return femme;
      case 'neutral':
        return neutral;
      default:
        return null;
    }
  }
}

/// Themed pack bundle (palettes + picks + render flags).
class Pack {
  const Pack({
    required this.id,
    required this.name,
    required this.description,
    this.emoji,
    this.unlockDate,
    this.palettes,
    this.picks,
    this.flat,
    this.bgColor,
    this.paletteExclusive,
    this.renderMode,
    this.featureStroke,
    this.glow,
    this.styleHints,
  });

  final String id;
  final String name;
  final String description;
  final String? emoji;
  final String? unlockDate;
  final List<Palette>? palettes;
  final PackPicks? picks;
  final bool? flat;
  final String? bgColor;
  final bool? paletteExclusive;
  final String? renderMode;
  final double? featureStroke;
  final bool? glow;
  final PackStyleHints? styleHints;
}

typedef PackRegistry = Map<String, Pack>;
