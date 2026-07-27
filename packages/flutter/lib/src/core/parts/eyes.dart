/// Port of packages/core/src/parts/eyes.ts
library;

import '../types.dart';
import 'anchor.dart';

import '../js_num.dart';

String renderEyes(
  String id,
  Palette palette,
  FaceAnchor anchor, {
  double strokeMul = 1,
}) {
  final lx = anchor.cx - anchor.eyeOffset;
  final rx = anchor.cx + anchor.eyeOffset;
  final y = anchor.eyeY;
  final s = anchor.eyeScale;
  final ink = palette.ink;
  final sw = strokeMul;

  switch (id) {
    case 'round':
      return [
        _sclera(lx, y, 4 * s, 4.5 * s),
        _sclera(rx, y, 4 * s, 4.5 * s),
        _pupil(lx, y, 2.2 * s, ink),
        _pupil(rx, y, 2.2 * s, ink),
        _glint(lx + 1, y - 1),
        _glint(rx + 1, y - 1),
      ].join('');

    case 'wide':
      return [
        _sclera(lx, y, 5 * s, 5.5 * s),
        _sclera(rx, y, 5 * s, 5.5 * s),
        _pupil(lx, y + 0.5, 3 * s, ink),
        _pupil(rx, y + 0.5, 3 * s, ink),
        _glint(lx + 1.2, y - 0.5),
        _glint(rx + 1.2, y - 0.5),
      ].join('');

    case 'squint':
      return [
        _arc(lx - 4.5, y, lx, y - 3.5, lx + 4.5, y, ink, 1.8 * sw),
        _arc(rx - 4.5, y, rx, y - 3.5, rx + 4.5, y, ink, 1.8 * sw),
      ].join('');

    case 'wink':
      return [
        _sclera(lx, y, 4 * s, 4.5 * s),
        _pupil(lx, y, 2.2 * s, ink),
        _glint(lx + 1, y - 1),
        _arc(rx - 4, y, rx, y - 3.5, rx + 4, y, ink, 1.8 * sw),
      ].join('');

    case 'sleepy':
      return [
        // Heavier upper lid — half-closed
        '<path d="M${jn(lx - 4)} ${jn(y - 0.5)} Q${jn(lx)} ${jn(y + 2)} ${jn(lx + 4)} ${jn(y - 0.5)}" stroke="${ink}" stroke-width="${jn(1.7 * sw)}" stroke-linecap="round" fill="none" />',
        '<path d="M${jn(rx - 4)} ${jn(y - 0.5)} Q${jn(rx)} ${jn(y + 2)} ${jn(rx + 4)} ${jn(y - 0.5)}" stroke="${ink}" stroke-width="${jn(1.7 * sw)}" stroke-linecap="round" fill="none" />',
        // tiny visible pupils
        '<circle cx="${jn(lx)}" cy="${jn(y + 0.5)}" r="${jn(0.9 * sw)}" fill="${ink}" />',
        '<circle cx="${jn(rx)}" cy="${jn(y + 0.5)}" r="${jn(0.9 * sw)}" fill="${ink}" />',
      ].join('');

    case 'star':
      return [_starEye(lx, y, ink), _starEye(rx, y, ink)].join('');

    case 'heart':
      return [_heartEye(lx, y, ink), _heartEye(rx, y, ink)].join('');

    case 'oval':
      // Vertical oval pupils (cute, anime-ish)
      return [
        _sclera(lx, y, 4.5 * s, 5 * s),
        _sclera(rx, y, 4.5 * s, 5 * s),
        '<ellipse cx="${jn(lx)}" cy="${jn(y)}" rx="${jn(1.6 * s)}" ry="${jn(3 * s)}" fill="${ink}" />',
        '<ellipse cx="${jn(rx)}" cy="${jn(y)}" rx="${jn(1.6 * s)}" ry="${jn(3 * s)}" fill="${ink}" />',
        _glint(lx + 0.8, y - 1.5),
        _glint(rx + 0.8, y - 1.5),
      ].join('');

    case 'dot':
      // Minimal dot eyes — scale radius by sw so bold-stroke packs get bigger dots
      return [
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(1.4 * s * sw)}" fill="${ink}" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(1.4 * s * sw)}" fill="${ink}" />',
      ].join('');

    case 'cross':
      // X eyes (cartoon "knocked out" — works for laughing too)
      return [_crossEye(lx, y, ink, sw), _crossEye(rx, y, ink, sw)].join('');
    default:
      return '';
  }
}

String _heartEye(double cx, double cy, String color) {
  // Two small circles + triangle below = heart silhouette
  final s = 2;
  return '<path d="M${jn(cx)} ${jn(cy + s * 1.4)} L${jn(cx - s * 1.8)} ${jn(cy - s * 0.2)} A${jn(s)} ${jn(s)} 0 0 1 ${jn(cx)} ${jn(cy - s * 0.6)} A${jn(s)} ${jn(s)} 0 0 1 ${jn(cx + s * 1.8)} ${jn(cy - s * 0.2)} Z" fill="${color}" />';
}

String _crossEye(double cx, double cy, String color, [double sw = 1]) {
  final s = 2.4;
  return '<g stroke="${color}" stroke-width="${jn(1.6 * sw)}" stroke-linecap="round"><line x1="${jn(cx - s)}" y1="${jn(cy - s)}" x2="${jn(cx + s)}" y2="${jn(cy + s)}" /><line x1="${jn(cx - s)}" y1="${jn(cy + s)}" x2="${jn(cx + s)}" y2="${jn(cy - s)}" /></g>';
}

String _sclera(double cx, double cy, double rx, double ry) {
  return '<ellipse cx="${jn(cx)}" cy="${jn(cy)}" rx="${jn(rx)}" ry="${jn(ry)}" fill="#FFFFFF" />';
}

String _pupil(double cx, double cy, double r, String color) {
  return '<circle cx="${jn(cx)}" cy="${jn(cy)}" r="${jn(r)}" fill="${color}" />';
}

String _glint(double cx, double cy) {
  return '<circle cx="${jn(cx)}" cy="${jn(cy)}" r="0.8" fill="#FFFFFF" />';
}

String _arc(double x1, double y1, double cx, double cy, double x2, double y2, String stroke, double width) {
  return '<path d="M${jn(x1)} ${jn(y1)} Q${jn(cx)} ${jn(cy)} ${jn(x2)} ${jn(y2)}" stroke="$stroke" stroke-width="${jn(width)}" stroke-linecap="round" fill="none" />';
}

String _starEye(double cx, double cy, String color) {
  final s = 3;
  return '<path d="M${jn(cx)} ${jn(cy - s)} L${jn(cx + s * 0.35)} ${jn(cy - s * 0.35)} L${jn(cx + s)} ${jn(cy)} L${jn(cx + s * 0.35)} ${jn(cy + s * 0.35)} L${jn(cx)} ${jn(cy + s)} L${jn(cx - s * 0.35)} ${jn(cy + s * 0.35)} L${jn(cx - s)} ${jn(cy)} L${jn(cx - s * 0.35)} ${jn(cy - s * 0.35)} Z" fill="${color}" />';
}


