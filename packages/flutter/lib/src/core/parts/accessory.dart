/// Port of packages/core/src/parts/accessory.ts
library;

import '../types.dart';
import '../js_num.dart';
import 'anchor.dart';


String renderAccessory(
  String id,
  Palette palette,
  FaceAnchor anchor, {
  double strokeMul = 1,
}) {
  final sw = strokeMul;
  final routeYellow = '#F5C51B';
  final kenyaGreen = '#00843D';
  final kenyaRed = '#C8102E';
  final matatuBlack = '#101820';
  final paperWhite = '#F8F7EF';
  final commandBlue = '#CBD5E1';
  final commandGreen = '#8FB7A2';
  final commandAmber = '#B7C3D0';
  final commandSlate = '#64748B';
  switch (id) {
    case 'none':
      return '';
    case 'blush': {
      final lx = anchor.cx - anchor.cheekOffset;
      final rx = anchor.cx + anchor.cheekOffset;
      final y = anchor.cheekY;
      return [
        '<ellipse cx="${jn(lx)}" cy="${jn(y)}" rx="3.6" ry="2.2" fill="${palette.blush}" opacity="0.5" />',
        '<ellipse cx="${jn(rx)}" cy="${jn(y)}" rx="3.6" ry="2.2" fill="${palette.blush}" opacity="0.5" />',
      ].join('');
    }
    case 'freckles': {
      final lx = anchor.cx - 8;
      final rx = anchor.cx + 8;
      final y = anchor.cheekY;
      return [
        _dot(lx, y, palette.ink),
        _dot(lx + 3, y + 1.5, palette.ink),
        _dot(rx, y, palette.ink),
        _dot(rx - 3, y + 1.5, palette.ink),
      ].join('');
    }
    case 'sparkle':
      return [
        _sparkle(76, anchor.eyeY - 18, 3, palette),
        _sparkle(24, anchor.eyeY - 16, 2.5, palette),
        _sparkle(82, anchor.cheekY + 2, 2, palette),
      ].join('');

    case 'glasses': {
      // Round-frame glasses over both eyes
      final lx = anchor.cx - anchor.eyeOffset;
      final rx = anchor.cx + anchor.eyeOffset;
      final y = anchor.eyeY;
      final r = 6;
      final gw = 1.2 * sw;
      return [
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(r)}" fill="none" stroke="${palette.ink}" stroke-width="${jn(gw)}" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(r)}" fill="none" stroke="${palette.ink}" stroke-width="${jn(gw)}" />',
        '<line x1="${jn(lx + r)}" y1="${jn(y)}" x2="${jn(rx - r)}" y2="${jn(y)}" stroke="${palette.ink}" stroke-width="${jn(gw)}" />',
        // subtle lens fill
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(r - 1)}" fill="#FFFFFF" opacity="0.18" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(r - 1)}" fill="#FFFFFF" opacity="0.18" />',
      ].join('');
    }

    case 'eyepatch': {
      // Patch over right eye, strap across head
      final rx = anchor.cx + anchor.eyeOffset;
      final y = anchor.eyeY;
      return [
        '<ellipse cx="${jn(rx)}" cy="${jn(y)}" rx="6" ry="5.2" fill="${palette.ink}" />',
        '<path d="M${jn(rx - 6)} ${jn(y - 4)} L${jn(anchor.cx - 18)} ${jn(anchor.eyeY - 8)}" stroke="${palette.ink}" stroke-width="0.9" />',
        '<path d="M${jn(rx + 6)} ${jn(y - 3)} L${jn(anchor.cx + 22)} ${jn(anchor.eyeY - 6)}" stroke="${palette.ink}" stroke-width="0.9" />',
      ].join('');
    }

    case 'mole': {
      // Small beauty mark below left cheek
      return '<circle cx="${jn(anchor.cx - anchor.cheekOffset * 0.6)}" cy="${jn(anchor.cheekY + 2)}" r="0.9" fill="${palette.ink}" />';
    }

    case 'earring': {
      // Pair of small drop earrings — sit at the outer cheek edge, near jawline
      final ex = anchor.cheekOffset + 4;
      final ey = anchor.cheekY + 4;
      final lx = anchor.cx - ex;
      final rx = anchor.cx + ex;
      return [
        // Left earring — small stud + drop
        '<circle cx="${jn(lx)}" cy="${jn(ey)}" r="${jn(1.1 * sw)}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${jn(0.4 * sw)}" />',
        '<ellipse cx="${jn(lx)}" cy="${jn(ey + 3.2)}" rx="${jn(1.3 * sw)}" ry="${jn(2 * sw)}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${jn(0.4 * sw)}" />',
        // Right earring
        '<circle cx="${jn(rx)}" cy="${jn(ey)}" r="${jn(1.1 * sw)}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${jn(0.4 * sw)}" />',
        '<ellipse cx="${jn(rx)}" cy="${jn(ey + 3.2)}" rx="${jn(1.3 * sw)}" ry="${jn(2 * sw)}" fill="${palette.accent}" stroke="${palette.ink}" stroke-width="${jn(0.4 * sw)}" />',
      ].join('');
    }

    case 'goldHoop': {
      final ex = anchor.cheekOffset + 4;
      final ey = anchor.cheekY + 4;
      return [
        '<circle cx="${jn(anchor.cx - ex)}" cy="${jn(ey)}" r="${jn(2.4 * sw)}" fill="none" stroke="${palette.accent}" stroke-width="${jn(0.9 * sw)}" />',
        '<circle cx="${jn(anchor.cx + ex)}" cy="${jn(ey)}" r="${jn(2.4 * sw)}" fill="none" stroke="${palette.accent}" stroke-width="${jn(0.9 * sw)}" />',
      ].join('');
    }

    case 'blackStarPin': {
      final x = anchor.cx + 13;
      final y = anchor.cheekY + 11;
      return '<path d="M${jn(x)} ${jn(y - 3.6)} L${jn(x + 1.1)} ${jn(y - 1.1)} L${jn(x + 3.8)} ${jn(y - 1.1)} L${jn(x + 1.6)} ${jn(y + 0.6)} L${jn(x + 2.4)} ${jn(y + 3.2)} L${jn(x)} ${jn(y + 1.6)} L${jn(x - 2.4)} ${jn(y + 3.2)} L${jn(x - 1.6)} ${jn(y + 0.6)} L${jn(x - 3.8)} ${jn(y - 1.1)} L${jn(x - 1.1)} ${jn(y - 1.1)} Z" fill="${palette.ink}" opacity="0.88" />';
    }

    case 'yellowGlasses': {
      final lx = anchor.cx - anchor.eyeOffset;
      final rx = anchor.cx + anchor.eyeOffset;
      final y = anchor.eyeY;
      final r = 6;
      final gw = 1.3 * sw;
      return [
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(r)}" fill="none" stroke="#F5C51B" stroke-width="${jn(gw)}" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(r)}" fill="none" stroke="#F5C51B" stroke-width="${jn(gw)}" />',
        '<line x1="${jn(lx + r)}" y1="${jn(y)}" x2="${jn(rx - r)}" y2="${jn(y)}" stroke="#F5C51B" stroke-width="${jn(gw)}" />',
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(r - 1)}" fill="#FFFFFF" opacity="0.16" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(r - 1)}" fill="#FFFFFF" opacity="0.16" />',
      ].join('');
    }

    case 'greenPin': {
      final x = anchor.cx + 13;
      final y = anchor.cheekY + 10;
      return [
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(3.2 * sw)}" fill="#008753" stroke="${palette.ink}" stroke-width="${jn(0.45 * sw)}" />',
        '<rect x="${jn(x - 1)}" y="${jn(y - 3)}" width="2" height="6" fill="#F8F7EF" opacity="0.96" />',
      ].join('');
    }

    case 'routeDot': {
      final x = anchor.cx - 13;
      final y = anchor.cheekY + 10;
      return [
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(3.3 * sw)}" fill="#F5C51B" stroke="${palette.ink}" stroke-width="${jn(0.5 * sw)}" />',
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(1.1 * sw)}" fill="#111827" opacity="0.9" />',
      ].join('');
    }

    case 'brightGlasses': {
      final lx = anchor.cx - anchor.eyeOffset;
      final rx = anchor.cx + anchor.eyeOffset;
      final y = anchor.eyeY;
      final r = 6;
      final gw = 1.35 * sw;
      return [
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(r)}" fill="none" stroke="${paperWhite}" stroke-width="${jn(gw)}" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(r)}" fill="none" stroke="${routeYellow}" stroke-width="${jn(gw)}" />',
        '<line x1="${jn(lx + r)}" y1="${jn(y)}" x2="${jn(rx - r)}" y2="${jn(y)}" stroke="${kenyaGreen}" stroke-width="${jn(gw)}" />',
        '<circle cx="${jn(lx)}" cy="${jn(y)}" r="${jn(r - 1)}" fill="#FFFFFF" opacity="0.16" />',
        '<circle cx="${jn(rx)}" cy="${jn(y)}" r="${jn(r - 1)}" fill="#FFFFFF" opacity="0.16" />',
        '<path d="M${jn(lx - 2)} ${jn(y - 8)} L${jn(lx + 2)} ${jn(y - 8)}" stroke="${kenyaRed}" stroke-width="${jn(0.9 * sw)}" stroke-linecap="round" />',
      ].join('');
    }

    case 'kenyaPin': {
      final x = anchor.cx + 13;
      final y = anchor.cheekY + 10;
      return [
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(3.4 * sw)}" fill="${matatuBlack}" stroke="${palette.ink}" stroke-width="${jn(0.45 * sw)}" />',
        '<rect x="${jn(x - 2.6)}" y="${jn(y - 1.8)}" width="5.2" height="1.2" fill="${kenyaRed}" opacity="0.98" />',
        '<rect x="${jn(x - 2.6)}" y="${jn(y + 0.4)}" width="5.2" height="1.2" fill="${kenyaGreen}" opacity="0.98" />',
        '<rect x="${jn(x - 2.6)}" y="${jn(y - 0.4)}" width="5.2" height="0.8" fill="${paperWhite}" opacity="0.98" />',
      ].join('');
    }

    case 'matatuMark': {
      final x = anchor.cx - 13;
      final y = anchor.cheekY + 10;
      return [
        '<rect x="${jn(x - 5)}" y="${jn(y - 4)}" width="10" height="7" rx="1.2" fill="${routeYellow}" stroke="${palette.ink}" stroke-width="${jn(0.45 * sw)}" />',
        '<text x="${jn(x)}" y="${jn(y + 1.1)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="5" font-weight="800" fill="${matatuBlack}">46</text>',
        '<circle cx="${jn(x - 4.2)}" cy="${jn(y + 4.1)}" r="${jn(0.8 * sw)}" fill="${kenyaGreen}" />',
        '<circle cx="${jn(x + 4.2)}" cy="${jn(y + 4.1)}" r="${jn(0.8 * sw)}" fill="${kenyaRed}" />',
      ].join('');
    }

    case 'statusDot': {
      final x = anchor.cx + 15;
      final y = anchor.cheekY + 9;
      return [
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(4.1 * sw)}" fill="#0F172A" stroke="${palette.ink}" stroke-width="${jn(0.45 * sw)}" />',
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(2.1 * sw)}" fill="${commandGreen}" />',
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(1.05 * sw)}" fill="${commandSlate}" opacity="0.86" />',
      ].join('');
    }

    case 'cursorPointer': {
      final x = anchor.cx + 13;
      final y = anchor.eyeY - 15;
      return [
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(4.8 * sw)}" fill="none" stroke="${commandBlue}" stroke-width="${jn(1.1 * sw)}" opacity="0.88" />',
        '<circle cx="${jn(x)}" cy="${jn(y)}" r="${jn(1.5 * sw)}" fill="${commandGreen}" opacity="0.95" />',
      ].join('');
    }

    case 'sparklineBadge': {
      final x = anchor.cx - 15;
      final y = anchor.cheekY + 8;
      return [
        '<circle cx="${jn(x - 4.2)}" cy="${jn(y)}" r="${jn(2.1 * sw)}" fill="${commandBlue}" opacity="0.9" />',
        '<circle cx="${jn(x + 4.2)}" cy="${jn(y)}" r="${jn(2.1 * sw)}" fill="${commandGreen}" opacity="0.9" />',
        '<path d="M${jn(x - 2.1)} ${jn(y)} L${jn(x + 2.1)} ${jn(y)}" stroke="${commandSlate}" stroke-width="${jn(0.9 * sw)}" stroke-linecap="round" opacity="0.75" />',
      ].join('');
    }

    case 'integrationBadge': {
      final x = anchor.cx - 14;
      final y = anchor.cheekY + 9;
      return [
        '<rect x="${jn(x - 6.8)}" y="${jn(y - 4.6)}" width="13.6" height="9.2" rx="2" fill="${commandBlue}" stroke="${palette.ink}" stroke-width="${jn(0.45 * sw)}" />',
        '<circle cx="${jn(x - 2.6)}" cy="${jn(y)}" r="${jn(1.15 * sw)}" fill="${commandSlate}" opacity="0.82" />',
        '<circle cx="${jn(x + 2.6)}" cy="${jn(y)}" r="${jn(1.15 * sw)}" fill="${paperWhite}" opacity="0.88" />',
        '<circle cx="${jn(x + 6.5)}" cy="${jn(y - 4.2)}" r="${jn(1.4 * sw)}" fill="${commandGreen}" stroke="${paperWhite}" stroke-width="${jn(0.35 * sw)}" />',
      ].join('');
    }

    case 'successCheck': {
      final x = anchor.cx + 14;
      final y = anchor.cheekY + 9;
      return [
        '<rect x="${jn(x - 6)}" y="${jn(y - 5)}" width="12" height="10" rx="3" fill="${commandGreen}" stroke="${palette.ink}" stroke-width="${jn(0.45 * sw)}" />',
        '<circle cx="${jn(x - 2.1)}" cy="${jn(y)}" r="${jn(1.2 * sw)}" fill="${paperWhite}" opacity="0.86" />',
        '<circle cx="${jn(x + 2.1)}" cy="${jn(y)}" r="${jn(1.2 * sw)}" fill="${commandSlate}" opacity="0.86" />',
        '<circle cx="${jn(x - 7.5)}" cy="${jn(y - 4.8)}" r="${jn(1.25 * sw)}" fill="${commandAmber}" />',
      ].join('');
    }
    default:
      return '';
  }
}


String _dot(double cx, double cy, String color) {
    return '<circle cx="${jn(cx)}" cy="${jn(cy)}" r="0.85" fill="${color}" opacity="0.55" />';
}
String _sparkle(double cx, double cy, double s, Palette p) {
    return '<path d="M${jn(cx)} ${jn(cy - s)} L${jn(cx + s * 0.3)} ${jn(cy - s * 0.3)} L${jn(cx + s)} ${jn(cy)} L${jn(cx + s * 0.3)} ${jn(cy + s * 0.3)} L${jn(cx)} ${jn(cy + s)} L${jn(cx - s * 0.3)} ${jn(cy + s * 0.3)} L${jn(cx - s)} ${jn(cy)} L${jn(cx - s * 0.3)} ${jn(cy - s * 0.3)} Z" fill="${p.accent}" stroke="${p.ink}" stroke-width="0.3" opacity="0.9" />';
}
