/// Port of packages/core/src/parts/mouth.ts
library;

import '../types.dart';
import 'anchor.dart';

import '../js_num.dart';

String renderMouth(
  String id,
  Palette palette,
  FaceAnchor anchor, {
  double curveScale = 1,
  double strokeMul = 1,
}) {
  final cx = anchor.cx;
  final y = anchor.mouthY;
  final w = anchor.mouthSpan * curveScale;
  final ink = palette.ink;
  final sw = strokeMul;
  final base = 1.8 * sw;

  switch (id) {
    case 'smile':
      return '<path d="M${jn(cx - w)} ${jn(y)} Q${jn(cx)} ${jn(y + 5)} ${jn(cx + w)} ${jn(y)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />';
    case 'grin':
      return '<path d="M${jn(cx - w - 1)} ${jn(y - 2)} Q${jn(cx)} ${jn(y + 7)} ${jn(cx + w + 1)} ${jn(y - 2)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />';
    case 'open':
      return [
        '<path d="M${jn(cx - w - 1)} ${jn(y - 2)} Q${jn(cx)} ${jn(y + 9)} ${jn(cx + w + 1)} ${jn(y - 2)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="${ink}" fill-opacity="0.55" />',
        '<ellipse cx="${jn(cx)}" cy="${jn(y + 3)}" rx="${jn(w * 0.55)}" ry="1.8" fill="#F472B6" opacity="0.75" />',
      ].join('');
    case 'flat':
      return '<path d="M${jn(cx - w + 1)} ${jn(y)} L${jn(cx + w - 1)} ${jn(y)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />';
    case 'smirk':
      return '<path d="M${jn(cx - w)} ${jn(y)} Q${jn(cx)} ${jn(y + 3)} ${jn(cx + w + 1)} ${jn(y - 2)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />';
    case 'awe':
      return '<ellipse cx="${jn(cx)}" cy="${jn(y + 1)}" rx="${jn(w * 0.45)}" ry="3.2" fill="${ink}" opacity="0.85" />';

    case 'tongue':
      return [
        '<path d="M${jn(cx - w)} ${jn(y)} Q${jn(cx)} ${jn(y + 6)} ${jn(cx + w)} ${jn(y)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />',
        '<path d="M${jn(cx - 2)} ${jn(y + 4)} Q${jn(cx)} ${jn(y + 9)} ${jn(cx + 2)} ${jn(y + 4)} Z" fill="#F472B6" stroke="${ink}" stroke-width="${jn(0.6 * sw)}" />',
      ].join('');

    case 'tooth':
      return [
        '<path d="M${jn(cx - w)} ${jn(y)} Q${jn(cx)} ${jn(y + 5)} ${jn(cx + w)} ${jn(y)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />',
        '<rect x="${jn(cx - 1.2)}" y="${jn(y + 0.4)}" width="2.4" height="2.6" rx="0.4" fill="#FFFFFF" stroke="${ink}" stroke-width="${jn(0.4 * sw)}" />',
      ].join('');

    case 'wave':
      // Wavy mouth (silly / playful)
      return '<path d="M${jn(cx - w)} ${jn(y + 1)} Q${jn(cx - w / 2)} ${jn(y - 1.5)} ${jn(cx)} ${jn(y + 1)} Q${jn(cx + w / 2)} ${jn(y + 3.5)} ${jn(cx + w)} ${jn(y + 1)}" stroke="${ink}" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />';

    case 'dot':
      // Tiny dot mouth — radius scales with stroke multiplier
      return '<circle cx="${jn(cx)}" cy="${jn(y + 1)}" r="${jn(1.2 * sw)}" fill="${ink}" />';

    case 'jagged': {
      // Carved-pumpkin grin — zigzag with sharp triangular teeth.
      // Filled silhouette in ink so it reads at small sizes.
      final half = w + 1;
      final top = y - 1;
      final bot = y + 5;
      // 5 alternating peaks across the span
      final step = (half * 2) / 8;
      final x0 = cx - half;
      final points = <String>[];
      points.add('${jn(x0)} ${jn(top)}');
      for (var i = 1; i <= 8; i++) {
        final px = x0 + step * i;
        final py = i % 2 == 1 ? bot : top;
        points.add('${px.toStringAsFixed(2)} ${jn(py)}');
      }
      return '<path d="M${points.join(' L')} L${jn(cx + half)} ${jn(top)} Z" fill="$ink" />';
    }

    case 'fangs': {
      // Small straight-line mouth with two pointy fangs hanging down.
      final half = w - 1;
      return [
        '<path d="M${jn(cx - half)} ${jn(y)} L${jn(cx + half)} ${jn(y)}" stroke="$ink" stroke-width="${jn(base)}" stroke-linecap="round" fill="none" />',
        // Left fang
        '<path d="M${jn(cx - 2.5)} ${jn(y + 0.4)} L${jn(cx - 1.2)} ${jn(y + 4.5)} L${jn(cx - 0.2)} ${jn(y + 0.4)} Z" fill="#FFFFFF" stroke="$ink" stroke-width="${jn(0.5 * sw)}" />',
        // Right fang
        '<path d="M${jn(cx + 0.2)} ${jn(y + 0.4)} L${jn(cx + 1.2)} ${jn(y + 4.5)} L${jn(cx + 2.5)} ${jn(y + 0.4)} Z" fill="#FFFFFF" stroke="$ink" stroke-width="${jn(0.5 * sw)}" />',
      ].join('');
    }
    default:
      return '';
  }
}


