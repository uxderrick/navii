/// Public types for the Navii avatar engine (Dart port of `@usenavii/core`).
///

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

  Map<String, dynamic> toJson() => {
        'id': id,
        'bodyFrom': bodyFrom,
        'bodyTo': bodyTo,
        'accent': accent,
        'ink': ink,
        'blush': blush,
      };

  factory Palette.fromJson(Map<String, dynamic> json) => Palette(
        id: json['id'] as String,
        bodyFrom: json['bodyFrom'] as String,
        bodyTo: json['bodyTo'] as String,
        accent: json['accent'] as String,
        ink: json['ink'] as String,
        blush: json['blush'] as String,
      );

  @override
  bool operator ==(Object other) =>
      other is Palette &&
      other.id == id &&
      other.bodyFrom == bodyFrom &&
      other.bodyTo == bodyTo &&
      other.accent == accent &&
      other.ink == ink &&
      other.blush == blush;

  @override
  int get hashCode => Object.hash(id, bodyFrom, bodyTo, accent, ink, blush);
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

  /// JSON shape matching `@usenavii/core` `selectAvatar` output (omit nulls).
  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'seed': seed,
      'palette': palette.toJson(),
      'body': body,
      'eyes': eyes,
      'mouth': mouth,
      'antenna': antenna,
      'accessory': accessory,
      'background': background,
      'topper': topper,
      'outfit': outfit,
      'hueShift': hueShift == hueShift.truncateToDouble() ? hueShift.toInt() : hueShift,
      'bodyScale': bodyScale,
      'eyeGapShift': eyeGapShift,
      'mouthCurveScale': mouthCurveScale,
      'antennaTilt':
          antennaTilt == antennaTilt.truncateToDouble() ? antennaTilt.toInt() : antennaTilt,
    };
    if (flat != null) map['flat'] = flat;
    if (bgColor != null) map['bgColor'] = bgColor;
    if (featureStroke != null) map['featureStroke'] = featureStroke;
    if (glow != null) map['glow'] = glow;
    if (renderMode != null) map['renderMode'] = renderMode;
    return map;
  }
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
