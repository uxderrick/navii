/// Public types for the Navii avatar engine (Dart port of `@usenavii/core`).
///
/// Implementations land in Phases 2–5 — see root [AGENTS.md](../../../AGENTS.md).
library;

/// Color family for an avatar body / accents.
class Palette {
  const Palette({
    required this.id,
    required this.bodyFrom,
    required this.bodyTo,
    required this.accent,
    required this.ink,
    required this.blush,
  });

  final String id;
  final String bodyFrom;
  final String bodyTo;
  final String accent;
  final String ink;
  final String blush;
}

/// Bias seeded picks toward a gender expression.
typedef StyleHint = String; // 'masc' | 'femme' | 'neutral'

/// Expression overlay for eyes + mouth.
typedef MoodId = String; // 'neutral' | 'happy' | 'serious' | 'sleepy' | 'wink'

/// Resolved deterministic description of an avatar (parts + continuous tweaks).
class AvatarSpec {
  const AvatarSpec({
    required this.seed,
    required this.palette,
    required this.body,
    required this.eyes,
    required this.mouth,
    required this.antenna,
    required this.accessory,
    required this.background,
    required this.topper,
    required this.outfit,
    required this.hueShift,
    required this.bodyScale,
    required this.eyeGapShift,
    required this.mouthCurveScale,
    required this.antennaTilt,
    this.flat,
    this.bgColor,
    this.featureStroke,
    this.glow,
    this.renderMode,
  });

  final String seed;
  final Palette palette;
  final String body;
  final String eyes;
  final String mouth;
  final String antenna;
  final String accessory;
  final String background;
  final String topper;
  final String outfit;
  final double hueShift;
  final double bodyScale;
  final double eyeGapShift;
  final double mouthCurveScale;
  final double antennaTilt;
  final bool? flat;
  final String? bgColor;
  final double? featureStroke;
  final bool? glow;
  final String? renderMode;
}

/// Options for [createAvatar] / selection + render.
class AvatarOptions {
  const AvatarOptions({
    this.size,
    this.background,
    this.paletteId,
    this.palette,
    this.packs,
    this.style,
    this.mood,
    this.title,
    this.animated,
    this.tileBg,
  });

  final double? size;

  /// `'none' | 'solid' | 'ring'` or a map-like `{ color }` via [BackgroundOverride].
  final Object? background;
  final String? paletteId;
  final Palette? palette;
  final List<String>? packs;

  /// Engine style hint (`masc` / `femme` / `neutral`). Widgets expose this as `styleHint`.
  final StyleHint? style;
  final MoodId? mood;
  final String? title;
  final bool? animated;
  final String? tileBg;
}

/// Explicit background color override: `{ color: '#fff' }`.
class BackgroundOverride {
  const BackgroundOverride(this.color);
  final String color;
}

/// Options for group stacks (extends avatar options).
class GroupOptions extends AvatarOptions {
  const GroupOptions({
    super.size,
    super.background,
    super.paletteId,
    super.palette,
    super.packs,
    super.style,
    super.mood,
    super.title,
    super.animated,
    super.tileBg,
    this.overlap,
    this.max,
    this.counterFill,
    this.counterInk,
    this.ring,
    this.groupId,
  });

  final double? overlap;
  final int? max;
  final String? counterFill;
  final String? counterInk;
  final String? ring;
  final String? groupId;
}

/// Per-tile SVGs for framework adapters.
class GroupTiles {
  const GroupTiles({
    required this.tiles,
    this.counter,
    required this.width,
    required this.height,
  });

  final List<String> tiles;
  final String? counter;
  final double width;
  final double height;
}

/// Fields accepted by [seed].
class SeedFields {
  const SeedFields({this.id, this.uuid, this.email, this.username});

  final String? id;
  final String? uuid;
  final String? email;
  final String? username;
}

/// Options for seed helpers.
class SeedOptions {
  const SeedOptions({this.normalize});

  final bool? normalize;
}
