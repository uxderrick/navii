/// Seed → [AvatarSpec].
///
/// Faithful port of `packages/core/src/select.ts`.
/// PRNG draw order is fixed — append new picks at the end only.
library;

import 'packs/index.dart';
import 'parts/ids.dart';
import 'parts/palette.dart';
import 'prng.dart';
import 'types.dart';

const Map<String, String> _moodEyes = {
  'happy': 'wide',
  'serious': 'squint',
  'sleepy': 'sleepy',
  'wink': 'wink',
};

const Map<String, String> _moodMouth = {
  'happy': 'smile',
  'serious': 'flat',
  'sleepy': 'dot',
  'wink': 'smirk',
};

/// JS `Math.round` (half toward +∞) — differs from Dart [num.round] on negatives.
int _jsRound(double x) => (x + 0.5).floor();

/// JS `Number(x.toFixed(n))`.
double _toFixedNumber(double x, int digits) => double.parse(x.toStringAsFixed(digits));

List<String>? _picksFor(PackPicks? picks, String partKey) {
  if (picks == null) return null;
  switch (partKey) {
    case 'body':
      return picks.body;
    case 'eyes':
      return picks.eyes;
    case 'mouth':
      return picks.mouth;
    case 'antenna':
      return picks.antenna;
    case 'accessory':
      return picks.accessory;
    case 'topper':
      return picks.topper;
    case 'background':
      return picks.background;
    case 'outfit':
      return picks.outfit;
    default:
      return null;
  }
}

List<String>? _styleSubsetFor(StylePartSubset? subset, String partKey) {
  if (subset == null) return null;
  switch (partKey) {
    case 'eyes':
      return subset.eyes;
    case 'mouth':
      return subset.mouth;
    case 'outfit':
      return subset.outfit;
    case 'accessory':
      return subset.accessory;
    case 'topper':
      return subset.topper;
    default:
      return null;
  }
}

List<String> _applyStyleHint(
  List<String> pool,
  List<Pack> packs,
  String hint,
  String partKey,
) {
  for (final pack in packs) {
    final subset = _styleSubsetFor(pack.styleHints?[hint], partKey);
    if (subset != null && subset.isNotEmpty) {
      final narrowed = pool.where(subset.contains).toList();
      if (narrowed.isNotEmpty) return narrowed;
    }
  }
  return pool;
}

List<String> _resolvePartPool(
  List<String> basePool,
  List<Pack> packs,
  String partKey,
) {
  final constraints = <List<String>>[];
  for (final pack in packs) {
    final list = _picksFor(pack.picks, partKey);
    if (list != null && list.isNotEmpty) constraints.add(list);
  }
  if (constraints.isEmpty) return basePool;

  var pool = List<String>.from(constraints.first);
  for (var i = 1; i < constraints.length; i++) {
    pool = pool.where(constraints[i].contains).toList();
  }
  if (pool.isNotEmpty) return pool;

  final seen = <String>{};
  final union = <String>[];
  for (final list in constraints) {
    for (final id in list) {
      if (seen.add(id)) union.add(id);
    }
  }
  return union.isNotEmpty ? union : basePool;
}

/// Resolve a deterministic [AvatarSpec] from [seed] + [options].
AvatarSpec selectAvatar(String seed, [AvatarOptions options = const AvatarOptions()]) {
  final rng = createRng(seed);
  final enabledPacks = resolvePacks(options.packs);

  final packPalettes = <Palette>[];
  List<Palette>? exclusivePackPalettes;
  for (final pack in enabledPacks) {
    final pals = pack.palettes;
    if (pals != null && pals.isNotEmpty) {
      packPalettes.addAll(pals);
      if (pack.paletteExclusive == true) {
        exclusivePackPalettes ??= [];
        exclusivePackPalettes.addAll(pals);
      }
    }
  }

  final List<Palette> palettePool;
  if (exclusivePackPalettes != null) {
    palettePool = exclusivePackPalettes;
  } else if (packPalettes.isNotEmpty) {
    palettePool = [...palettes, ...packPalettes];
  } else {
    palettePool = List<Palette>.from(palettes);
  }

  Palette? paletteByIdLookup;
  final paletteId = options.paletteId;
  if (paletteId != null) {
    paletteByIdLookup = paletteById[paletteId];
    if (paletteByIdLookup == null) {
      for (final p in packPalettes) {
        if (p.id == paletteId) {
          paletteByIdLookup = p;
          break;
        }
      }
    }
  }
  final paletteOverride = options.palette ?? paletteByIdLookup;
  final Palette palette = paletteOverride ?? rng.pick(palettePool);

  final bodyPool = _resolvePartPool(bodyIds, enabledPacks, 'body');
  final eyesPool = _resolvePartPool(eyeIds, enabledPacks, 'eyes');
  final mouthPool = _resolvePartPool(mouthIds, enabledPacks, 'mouth');
  final antennaPool = _resolvePartPool(antennaIds, enabledPacks, 'antenna');
  var accessoryPool = _resolvePartPool(accessoryIds, enabledPacks, 'accessory');
  final backgroundPool = _resolvePartPool(backgroundIds, enabledPacks, 'background');
  var topperPool = _resolvePartPool(topperIds, enabledPacks, 'topper');

  final styleHint = options.style;
  if (styleHint != null) {
    accessoryPool = _applyStyleHint(accessoryPool, enabledPacks, styleHint, 'accessory');
    topperPool = _applyStyleHint(topperPool, enabledPacks, styleHint, 'topper');
  }

  final body = rng.pick(bodyPool);
  final eyesPicked = rng.pick(eyesPool);
  final mouthPicked = rng.pick(mouthPool);
  final antenna = rng.pick(antennaPool);
  final accessory = rng.pick(accessoryPool);

  final mood = options.mood;
  if (mood != null && mood != 'neutral' && !_moodEyes.containsKey(mood)) {
    throw ArgumentError.value(mood, 'mood', 'navii: unsupported mood');
  }
  final eyes = (mood != null && mood != 'neutral') ? _moodEyes[mood]! : eyesPicked;
  final mouth = (mood != null && mood != 'neutral') ? _moodMouth[mood]! : mouthPicked;

  final String background;
  final bgOpt = options.background;
  if (bgOpt is String) {
    background = bgOpt;
  } else if (bgOpt is BackgroundOverride || bgOpt is Map) {
    background = 'solid';
  } else {
    background = rng.pick(backgroundPool);
  }

  final topperRaw = rng.pick(topperPool);
  final topper = antenna != 'none' && topperRaw != 'none' && topperRaw != 'leaf'
      ? 'none'
      : topperRaw;

  final hueShift = _jsRound(rng.range(-30, 30)).toDouble();
  final bodyScale = _toFixedNumber(rng.range(0.92, 1.08), 3);
  final eyeGapShift = _toFixedNumber(rng.range(-2, 2), 2);
  final mouthCurveScale = _toFixedNumber(rng.range(0.85, 1.15), 3);
  final antennaTilt = _jsRound(rng.range(-8, 8)).toDouble();

  final outfitConstraints = <List<String>>[];
  for (final pack in enabledPacks) {
    final list = pack.picks?.outfit;
    if (list != null && list.isNotEmpty) outfitConstraints.add(list);
  }

  var outfit = 'none';
  if (outfitConstraints.isNotEmpty) {
    var pool = List<String>.from(outfitConstraints.first);
    for (var i = 1; i < outfitConstraints.length; i++) {
      pool = pool.where(outfitConstraints[i].contains).toList();
    }
    if (pool.isEmpty) {
      final seen = <String>{};
      final union = <String>[];
      for (final list in outfitConstraints) {
        for (final id in list) {
          if (seen.add(id)) union.add(id);
        }
      }
      pool = union;
    }
    if (styleHint != null) {
      pool = _applyStyleHint(pool, enabledPacks, styleHint, 'outfit');
    }
    outfit = pool.isNotEmpty ? rng.pick(pool) : 'none';
  }

  bool? flat;
  String? bgColor;
  double? featureStroke;
  bool? glow;
  String? renderMode;
  for (final pack in enabledPacks) {
    if (pack.flat == true) flat = true;
    if (pack.bgColor != null) bgColor = pack.bgColor;
    if (pack.featureStroke != null) featureStroke = pack.featureStroke;
    if (pack.glow == true) glow = true;
    if (pack.renderMode != null) renderMode = pack.renderMode;
  }

  return AvatarSpec(
    seed: seed,
    palette: palette,
    body: body,
    eyes: eyes,
    mouth: mouth,
    antenna: antenna,
    accessory: accessory,
    background: background,
    topper: topper,
    outfit: outfit,
    hueShift: hueShift,
    bodyScale: bodyScale,
    eyeGapShift: eyeGapShift,
    mouthCurveScale: mouthCurveScale,
    antennaTilt: antennaTilt,
    flat: flat,
    bgColor: bgColor,
    featureStroke: featureStroke,
    glow: glow,
    renderMode: renderMode,
  );
}
