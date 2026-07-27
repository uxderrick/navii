/// AvatarSpec → SVG string — port of `packages/core/src/render.ts`.
library;

import 'animate.dart';
import 'js_num.dart';
import 'parts/index.dart';
import 'prng.dart';
import 'types.dart';
import 'xml.dart';

/// AvatarSpec → self-contained `<svg>` string.
String renderAvatar(AvatarSpec spec, [AvatarOptions options = const AvatarOptions()]) {
  final size = options.size ?? 96;
  final titleAttrs = options.title != null
      ? ' role="img" aria-label="${escapeXml(options.title!)}"'
      : ' aria-hidden="true"';

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${jn(size)}" height="${jn(size)}"$titleAttrs>',
    if (options.title != null) '<title>${escapeXml(options.title!)}</title>',
    renderAvatarInner(spec, options),
    '</svg>',
  ].join('');
}

/// Inner markup without the outer `<svg>` wrapper (for groups).
String renderAvatarInner(AvatarSpec spec, [AvatarOptions options = const AvatarOptions()]) {
  if (spec.renderMode == 'workspace-glyph') {
    return _renderWorkspaceGlyph(spec, options);
  }

  final animated = options.animated == true;
  final id = _stableId(spec.seed);
  final scopeClass = 'n-$id';
  final gradId = 'navii-grad-$id';
  final hueId = 'navii-hue-$id';

  String? bgOverride;
  final bg = options.background;
  if (bg is BackgroundOverride) {
    bgOverride = bg.color;
  } else if (bg is Map && bg['color'] is String) {
    bgOverride = bg['color'] as String;
  }

  final baseAnchor = anchors[spec.body]!;
  final anchor = baseAnchor.copyWith(
    eyeOffset: baseAnchor.eyeOffset + (spec.eyeGapShift),
  );

  final strokeMul = spec.featureStroke ?? 1;
  final antennaSvg = renderAntenna(spec.antenna, anchor, spec.palette);
  final accessorySvg =
      renderAccessory(spec.accessory, spec.palette, anchor, strokeMul: strokeMul);

  final flat = spec.flat == true;
  final glow = spec.glow == true;
  final glowId = 'navii-glow-$id';
  final bodyMarkup = renderBody(spec.body, spec.palette, gradId, flat: flat);
  final effectiveBodyScale = flat ? 1.0 : spec.bodyScale;
  final bodyTransform = _transformBody(effectiveBodyScale, anchor);
  final bodyFilter =
      spec.hueShift != 0 ? ' filter="url(#$hueId)"' : '';
  final bodyWrapped =
      '<g$bodyTransform$bodyFilter><g class="body">$bodyMarkup</g></g>';

  final glowLayer = glow
      ? '<g$bodyTransform filter="url(#$glowId)" opacity="0.85"><g class="body-glow">${bodyMarkup.replaceAllMapped(RegExp(r'fill="url\(#[^"]+\)"'), (m) => 'fill="${spec.palette.bodyFrom}"')}</g></g>'
      : '';

  final antennaWrapped = antennaSvg.isNotEmpty
      ? '<g${_transformAntenna(spec.antennaTilt, anchor)}><g class="antenna">$antennaSvg</g></g>'
      : '';

  final tileBg = _resolveTileBg(options.tileBg, spec.palette);
  final tileCircle =
      tileBg != null ? '<circle cx="50" cy="50" r="50" fill="$tileBg" />' : '';

  final outfitSvg = renderOutfit(spec.outfit, anchor, spec.palette);

  final packPlate = spec.bgColor != null
      ? '<rect x="0" y="0" width="100" height="100" fill="${spec.bgColor}" />'
      : '';
  final backgroundMarkup = spec.bgColor != null
      ? ''
      : renderBackground(spec.background, spec.palette, bgOverride);

  final accessoryOut = accessorySvg.isNotEmpty && spec.accessory == 'sparkle'
      ? _wrap('sparkle', accessorySvg)
      : accessorySvg;

  final parts = [
    tileCircle,
    packPlate,
    backgroundMarkup,
    glowLayer,
    bodyWrapped,
    outfitSvg,
    renderTopper(spec.topper, anchor, spec.palette),
    _wrap('eyes', renderEyes(spec.eyes, spec.palette, anchor, strokeMul: strokeMul)),
    renderMouth(
      spec.mouth,
      spec.palette,
      anchor,
      curveScale: spec.mouthCurveScale,
      strokeMul: strokeMul,
    ),
    antennaWrapped,
    accessoryOut,
  ].join('');

  final defs = [
    renderBodyDefs(spec.body, spec.palette, gradId, flat: flat),
    if (spec.hueShift != 0)
      '<filter id="$hueId" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="${jn(spec.hueShift)}" /></filter>',
    if (glow)
      '<filter id="$glowId" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>',
  ].join('');

  return [
    '<defs>$defs</defs>',
    if (animated) renderAnimationStyle(spec, scopeClass),
    if (animated) '<g class="$scopeClass">$parts</g>' else parts,
  ].join('');
}

String _renderWorkspaceGlyph(AvatarSpec spec, AvatarOptions options) {
  final rng = createRng('workspace-glyph:${spec.seed}');
  final tileBg = _resolveTileBg(options.tileBg, spec.palette);
  final plate = tileBg ?? spec.bgColor ?? '#F7F8FA';
  final ink = spec.palette.ink;
  final accent = spec.palette.accent;
  final soft = spec.palette.blush;
  final body = spec.palette.bodyFrom;
  final radius = (rng.range(16, 24) + 0.5).floor();
  final dotX = double.parse(rng.range(63, 70).toStringAsFixed(1));
  final dotY = double.parse(rng.range(31, 38).toStringAsFixed(1));
  final mark = rng.next() < 0.5
      ? '<circle cx="${jn(dotX)}" cy="${jn(dotY)}" r="3" fill="$soft" opacity="0.82" />'
      : '<rect x="${jn(double.parse((dotX - 7).toStringAsFixed(1)))}" y="${jn(double.parse((dotY - 1.5).toStringAsFixed(1)))}" width="12" height="3" rx="1.5" fill="$accent" opacity="0.76" />';

  return [
    '<g data-navii-render="workspace-glyph">',
    '<rect x="0" y="0" width="100" height="100" fill="$plate" />',
    '<rect x="18" y="18" width="64" height="64" rx="${jn(radius)}" fill="$body" stroke="$accent" stroke-width="1" opacity="0.96" />',
    mark,
    '<circle cx="50" cy="50" r="${jn(double.parse(rng.range(2.4, 3.4).toStringAsFixed(1)))}" fill="$ink" opacity="0.82" />',
    '</g>',
  ].join('');
}

String? _resolveTileBg(String? raw, Palette palette) {
  if (raw == null) return null;
  if (raw == 'auto') return escapeXml(palette.accent);
  return escapeXml(raw);
}

String _transformBody(double scale, FaceAnchor anchor) {
  if ((scale - 1).abs() < 0.001) return '';
  return ' transform="translate(${jn(anchor.cx)} ${jn(anchor.groundY)}) scale(${jn(scale)}) translate(${jn(-anchor.cx)} ${jn(-anchor.groundY)})"';
}

String _transformAntenna(double deg, FaceAnchor anchor) {
  if (deg == 0) return '';
  return ' transform="rotate(${jn(deg)} ${jn(anchor.topperX)} ${jn(anchor.topperY + 2)})"';
}

String _wrap(String cls, String inner) {
  if (inner.isEmpty) return inner;
  return '<g class="$cls">$inner</g>';
}

String _stableId(String seed) {
  var h = 5381;
  for (var i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.codeUnitAt(i)).toSigned(32);
  }
  return (h & 0xFFFFFFFF).toRadixString(36);
}
