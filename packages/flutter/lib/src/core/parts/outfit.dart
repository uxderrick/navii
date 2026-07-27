/// Port of packages/core/src/parts/outfit.ts
library;

import 'dart:math' as math;
import '../types.dart';
import '../js_num.dart';
import 'anchor.dart';


String renderOutfit(String id, FaceAnchor anchor, Palette palette) {
  if (id == 'none') return '';

  // Chest anchor: centered horizontally on the body, vertically positioned
  // just below the chin (~70% down from mouth to ground).
  final cx = anchor.cx;
  final cy = anchor.mouthY + (anchor.groundY - anchor.mouthY) * 0.55;
  final ink = palette.ink;
  final accent = palette.accent;
  final routeYellow = '#F5C51B';
  final kenyaGreen = '#00843D';
  final kenyaRed = '#C8102E';
  final matatuBlack = '#101820';
  final paperWhite = '#F8F7EF';
  final commandBlue = '#CBD5E1';
  final commandGreen = '#8FB7A2';
  final commandAmber = '#B7C3D0';

  switch (id) {
    case 'collar':
      // Two short triangles meeting at center — dress shirt collar peek
      return [
        '<path d="M${jn(cx - 9)} ${jn(cy)} L${jn(cx - 2)} ${jn(cy - 4)} L${jn(cx - 2)} ${jn(cy + 5)} Z" fill="${accent}" stroke="${ink}" stroke-width="0.7" />',
        '<path d="M${jn(cx + 9)} ${jn(cy)} L${jn(cx + 2)} ${jn(cy - 4)} L${jn(cx + 2)} ${jn(cy + 5)} Z" fill="${accent}" stroke="${ink}" stroke-width="0.7" />',
        // tiny button at center
        '<circle cx="${jn(cx)}" cy="${jn(cy + 4)}" r="0.9" fill="${ink}" />',
      ].join('');

    case 'scarf':
      // Wrap with two tails hanging
      return [
        // wrap band
        '<path d="M${jn(cx - 14)} ${jn(cy - 2)} Q${jn(cx)} ${jn(cy + 3)} ${jn(cx + 14)} ${jn(cy - 2)} L${jn(cx + 14)} ${jn(cy + 3)} Q${jn(cx)} ${jn(cy + 8)} ${jn(cx - 14)} ${jn(cy + 3)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />',
        // tail 1 (left)
        '<path d="M${jn(cx - 6)} ${jn(cy + 5)} L${jn(cx - 9)} ${jn(cy + 12)} L${jn(cx - 4)} ${jn(cy + 12)} L${jn(cx - 2)} ${jn(cy + 5)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.5" />',
        // tail 2 (slightly right)
        '<path d="M${jn(cx + 1)} ${jn(cy + 6)} L${jn(cx + 4)} ${jn(cy + 13)} L${jn(cx - 1)} ${jn(cy + 13)} L${jn(cx - 2)} ${jn(cy + 6)} Z" fill="${palette.bodyFrom}" stroke="${ink}" stroke-width="0.5" />',
      ].join('');

    case 'bowtie':
      // Two triangles meeting at a center knot
      return [
        // left wing
        '<path d="M${jn(cx - 1)} ${jn(cy)} L${jn(cx - 9)} ${jn(cy - 4)} L${jn(cx - 9)} ${jn(cy + 4)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.7" />',
        // right wing
        '<path d="M${jn(cx + 1)} ${jn(cy)} L${jn(cx + 9)} ${jn(cy - 4)} L${jn(cx + 9)} ${jn(cy + 4)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.7" />',
        // center knot
        '<rect x="${jn(cx - 1.4)}" y="${jn(cy - 2.4)}" width="2.8" height="4.8" rx="0.8" fill="${palette.bodyFrom}" stroke="${ink}" stroke-width="0.5" />',
      ].join('');

    case 'sunflower':
      // Sunflower boutonnière pinned to chest (off-center, like a real one)
      {
        final fx = cx - 8;
        final fy = cy + 2;
        final petals = <String>[];
        // 8 petals around center
        for (var i = 0; i < 8; i++) {
          final a = (i / 8) * math.pi * 2;
          final px = fx + math.cos(a) * 3.2;
          final py = fy + math.sin(a) * 3.2;
          petals.add(
            '<ellipse cx="${px.toStringAsFixed(2)}" cy="${py.toStringAsFixed(2)}" rx="2.4" ry="1.3" fill="#FACC15" stroke="$ink" stroke-width="0.35" transform="rotate(${(a * 180 / math.pi).toStringAsFixed(1)} ${px.toStringAsFixed(2)} ${py.toStringAsFixed(2)})" />',
          );
        }
        return [
          // stem (tucked behind)
          '<path d="M${jn(fx + 2)} ${jn(fy + 2)} Q${jn(fx + 4)} ${jn(fy + 6)} ${jn(fx + 1)} ${jn(fy + 10)}" stroke="#16A34A" stroke-width="1.1" fill="none" stroke-linecap="round" />',
          // leaf
          '<path d="M${jn(fx + 3)} ${jn(fy + 6)} Q${jn(fx + 7)} ${jn(fy + 4)} ${jn(fx + 6)} ${jn(fy + 8)} Q${jn(fx + 4)} ${jn(fy + 8)} ${jn(fx + 3)} ${jn(fy + 6)} Z" fill="#22C55E" stroke="${ink}" stroke-width="0.35" />',
          ...petals,
          // center disc
          '<circle cx="${jn(fx)}" cy="${jn(fy)}" r="2" fill="#92400E" stroke="${ink}" stroke-width="0.4" />',
          // texture dots on disc
          '<circle cx="${jn(fx - 0.6)}" cy="${jn(fy - 0.5)}" r="0.4" fill="#451A03" />',
          '<circle cx="${jn(fx + 0.7)}" cy="${jn(fy + 0.3)}" r="0.4" fill="#451A03" />',
          '<circle cx="${jn(fx - 0.4)}" cy="${jn(fy + 0.8)}" r="0.4" fill="#451A03" />',
        ].join('');
      }

    case 'necklace':
      // Thin curved chain w/ a small pendant
      return [
        // chain (curve from collarbone left → drop → right)
        '<path d="M${jn(cx - 10)} ${jn(cy)} Q${jn(cx)} ${jn(cy + 8)} ${jn(cx + 10)} ${jn(cy)}" stroke="${accent}" stroke-width="0.8" fill="none" stroke-linecap="round" />',
        // pendant
        '<circle cx="${jn(cx)}" cy="${jn(cy + 7)}" r="1.6" fill="${accent}" stroke="${ink}" stroke-width="0.5" />',
        '<circle cx="${jn(cx)}" cy="${jn(cy + 7)}" r="0.7" fill="${palette.blush}" />',
      ].join('');

    case 'tie':
      // Necktie — small knot at neckline + tapered blade hanging below.
      // Dressy / corporate signal. Uses palette.bodyTo as tie color, palette.accent
      // as the shirt collar peek behind it.
      {
        final knotTop = cy - 3;
        final knotBot = cy + 1;
        return [
          // Shirt-collar peek behind the tie (so tie reads as worn over a shirt)
          '<path d="M${jn(cx - 11)} ${jn(cy - 2)} L${jn(cx - 3)} ${jn(knotBot)} L${jn(cx + 3)} ${jn(knotBot)} L${jn(cx + 11)} ${jn(cy - 2)} L${jn(cx + 6)} ${jn(cy + 6)} L${jn(cx - 6)} ${jn(cy + 6)} Z" fill="${accent}" stroke="${ink}" stroke-width="0.55" />',
          // Knot — small trapezoid centered
          '<path d="M${jn(cx - 3.2)} ${jn(knotTop)} L${jn(cx + 3.2)} ${jn(knotTop)} L${jn(cx + 2.4)} ${jn(knotBot)} L${jn(cx - 2.4)} ${jn(knotBot)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.5" />',
          // Blade — narrower at top, widens, then pointed tip at bottom
          '<path d="M${jn(cx - 2.4)} ${jn(knotBot)} L${jn(cx + 2.4)} ${jn(knotBot)} L${jn(cx + 3.4)} ${jn(cy + 6)} L${jn(cx + 2.8)} ${jn(cy + 12)} L${jn(cx)} ${jn(cy + 15)} L${jn(cx - 2.8)} ${jn(cy + 12)} L${jn(cx - 3.4)} ${jn(cy + 6)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.5" />',
          // Subtle highlight stripe down the blade
          '<path d="M${jn(cx)} ${jn(knotBot + 0.5)} L${jn(cx)} ${jn(cy + 13.5)}" stroke="${ink}" stroke-width="0.35" opacity="0.35" />',
        ].join('');
      }

    case 'patternedCollar':
      return [
        '<path d="M${jn(cx - 15)} ${jn(cy - 3)} Q${jn(cx)} ${jn(cy + 5)} ${jn(cx + 15)} ${jn(cy - 3)} L${jn(cx + 12)} ${jn(cy + 5)} Q${jn(cx)} ${jn(cy + 12)} ${jn(cx - 12)} ${jn(cy + 5)} Z" fill="#111827" stroke="${ink}" stroke-width="0.6" />',
        '<rect x="${jn(cx - 12)}" y="${jn(cy)}" width="4" height="6" fill="#B12F28" opacity="0.96" />',
        '<rect x="${jn(cx - 6)}" y="${jn(cy + 2)}" width="4" height="6" fill="#F3CF4E" opacity="0.96" />',
        '<rect x="${jn(cx)}" y="${jn(cy + 3)}" width="4" height="6" fill="#2F6A3E" opacity="0.96" />',
        '<rect x="${jn(cx + 6)}" y="${jn(cy + 2)}" width="4" height="6" fill="#F8D04A" opacity="0.96" />',
      ].join('');

    case 'roadStripeCollar':
      return [
        '<path d="M${jn(cx - 15)} ${jn(cy - 3)} Q${jn(cx)} ${jn(cy + 5)} ${jn(cx + 15)} ${jn(cy - 3)} L${jn(cx + 12)} ${jn(cy + 5)} Q${jn(cx)} ${jn(cy + 11)} ${jn(cx - 12)} ${jn(cy + 5)} Z" fill="#111827" stroke="${ink}" stroke-width="0.6" />',
        '<rect x="${jn(cx - 11)}" y="${jn(cy)}" width="7" height="5" fill="#F5C51B" opacity="0.98" />',
        '<rect x="${jn(cx - 2)}" y="${jn(cy + 2)}" width="4" height="6" fill="#F8F7EF" opacity="0.98" />',
        '<rect x="${jn(cx + 5)}" y="${jn(cy)}" width="7" height="5" fill="#008753" opacity="0.98" />',
      ].join('');

    case 'flagCollar':
      return [
        '<path d="M${jn(cx - 14)} ${jn(cy - 3)} Q${jn(cx)} ${jn(cy + 4)} ${jn(cx + 14)} ${jn(cy - 3)} L${jn(cx + 11)} ${jn(cy + 5)} Q${jn(cx)} ${jn(cy + 10)} ${jn(cx - 11)} ${jn(cy + 5)} Z" fill="#008753" stroke="${ink}" stroke-width="0.6" />',
        '<rect x="${jn(cx - 4)}" y="${jn(cy - 1)}" width="8" height="9" rx="1" fill="#F8F7EF" opacity="0.98" />',
        '<path d="M${jn(cx - 13)} ${jn(cy + 1)} L${jn(cx + 13)} ${jn(cy + 1)}" stroke="#F5C51B" stroke-width="1.1" stroke-linecap="round" />',
      ].join('');

    case 'yellowTrimNecklace':
      return [
        '<path d="M${jn(cx - 11)} ${jn(cy)} Q${jn(cx)} ${jn(cy + 8)} ${jn(cx + 11)} ${jn(cy)}" stroke="#F5C51B" stroke-width="1" fill="none" stroke-linecap="round" />',
        '<rect x="${jn(cx - 2.5)}" y="${jn(cy + 5.5)}" width="5" height="5" rx="1" fill="#008753" stroke="${ink}" stroke-width="0.45" />',
        '<rect x="${jn(cx - 0.8)}" y="${jn(cy + 5.8)}" width="1.6" height="4.4" fill="#F8F7EF" opacity="0.96" />',
      ].join('');

    case 'shukaCheckCollar':
      return [
        '<path d="M${jn(cx - 15)} ${jn(cy - 3)} Q${jn(cx)} ${jn(cy + 5)} ${jn(cx + 15)} ${jn(cy - 3)} L${jn(cx + 12)} ${jn(cy + 5)} Q${jn(cx)} ${jn(cy + 11)} ${jn(cx - 12)} ${jn(cy + 5)} Z" fill="${kenyaRed}" stroke="${ink}" stroke-width="0.6" />',
        '<rect x="${jn(cx - 13)}" y="${jn(cy)}" width="26" height="1.6" fill="${matatuBlack}" opacity="0.96" />',
        '<rect x="${jn(cx - 13)}" y="${jn(cy + 4)}" width="26" height="1.5" fill="${paperWhite}" opacity="0.96" />',
        '<rect x="${jn(cx - 6)}" y="${jn(cy - 1)}" width="2" height="8" fill="#1E4EA8" opacity="0.92" />',
        '<rect x="${jn(cx + 6)}" y="${jn(cy - 1)}" width="2" height="8" fill="${matatuBlack}" opacity="0.92" />',
        '<rect x="${jn(cx - 12)}" y="${jn(cy + 2)}" width="5" height="1.5" fill="${routeYellow}" opacity="0.95" />',
      ].join('');

    case 'neonTrimCollar':
      return [
        '<path d="M${jn(cx - 15)} ${jn(cy - 3)} Q${jn(cx)} ${jn(cy + 5)} ${jn(cx + 15)} ${jn(cy - 3)} L${jn(cx + 12)} ${jn(cy + 5)} Q${jn(cx)} ${jn(cy + 11)} ${jn(cx - 12)} ${jn(cy + 5)} Z" fill="${matatuBlack}" stroke="${ink}" stroke-width="0.6" />',
        '<path d="M${jn(cx - 12)} ${jn(cy + 1)} L${jn(cx + 12)} ${jn(cy + 1)}" stroke="${routeYellow}" stroke-width="2" stroke-linecap="round" />',
        '<rect x="${jn(cx - 12)}" y="${jn(cy + 4)}" width="8" height="2" fill="${kenyaGreen}" opacity="0.98" />',
        '<rect x="${jn(cx - 3)}" y="${jn(cy + 4)}" width="6" height="2" fill="${paperWhite}" opacity="0.98" />',
        '<rect x="${jn(cx + 5)}" y="${jn(cy + 4)}" width="8" height="2" fill="${kenyaRed}" opacity="0.98" />',
      ].join('');

    case 'routeStripeNecklace':
      return [
        '<path d="M${jn(cx - 12)} ${jn(cy)} Q${jn(cx)} ${jn(cy + 8)} ${jn(cx + 12)} ${jn(cy)}" stroke="${routeYellow}" stroke-width="1.2" fill="none" stroke-linecap="round" />',
        '<rect x="${jn(cx - 4)}" y="${jn(cy + 5)}" width="8" height="5.5" rx="1" fill="${paperWhite}" stroke="${ink}" stroke-width="0.45" />',
        '<text x="${jn(cx)}" y="${jn(cy + 9.5)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="4.3" font-weight="800" fill="${matatuBlack}">CBD</text>',
      ].join('');

    case 'dataCollar':
      return [
        '<path d="M${jn(cx - 16)} ${jn(cy - 3)} Q${jn(cx)} ${jn(cy + 5)} ${jn(cx + 16)} ${jn(cy - 3)} L${jn(cx + 13)} ${jn(cy + 6)} Q${jn(cx)} ${jn(cy + 12)} ${jn(cx - 13)} ${jn(cy + 6)} Z" fill="#0F172A" stroke="${ink}" stroke-width="0.55" />',
        '<circle cx="${jn(cx - 8)}" cy="${jn(cy + 3)}" r="2" fill="${commandBlue}" opacity="0.92" />',
        '<circle cx="${jn(cx)}" cy="${jn(cy + 5)}" r="2" fill="${commandGreen}" opacity="0.92" />',
        '<circle cx="${jn(cx + 8)}" cy="${jn(cy + 3)}" r="2" fill="${commandAmber}" opacity="0.92" />',
      ].join('');

    case 'pipelineBand':
      return [
        '<path d="M${jn(cx - 15)} ${jn(cy - 2)} Q${jn(cx)} ${jn(cy + 5)} ${jn(cx + 15)} ${jn(cy - 2)} L${jn(cx + 12)} ${jn(cy + 6)} Q${jn(cx)} ${jn(cy + 11)} ${jn(cx - 12)} ${jn(cy + 6)} Z" fill="${paperWhite}" stroke="${ink}" stroke-width="0.55" />',
        '<circle cx="${jn(cx - 9)}" cy="${jn(cy + 3)}" r="2.2" fill="${commandBlue}" />',
        '<path d="M${jn(cx - 6.5)} ${jn(cy + 3)} L${jn(cx - 1.8)} ${jn(cy + 3)}" stroke="#0F172A" stroke-width="1" stroke-linecap="round" />',
        '<circle cx="${jn(cx)}" cy="${jn(cy + 3)}" r="2.2" fill="${commandGreen}" />',
        '<path d="M${jn(cx + 2.5)} ${jn(cy + 3)} L${jn(cx + 7.2)} ${jn(cy + 3)}" stroke="#0F172A" stroke-width="1" stroke-linecap="round" />',
        '<circle cx="${jn(cx + 9)}" cy="${jn(cy + 3)}" r="2.2" fill="${commandAmber}" />',
      ].join('');

    case 'connectorNecklace':
      return [
        '<path d="M${jn(cx - 12)} ${jn(cy)} Q${jn(cx)} ${jn(cy + 8)} ${jn(cx + 12)} ${jn(cy)}" stroke="${commandBlue}" stroke-width="1.1" fill="none" stroke-linecap="round" />',
        '<rect x="${jn(cx - 4.5)}" y="${jn(cy + 5)}" width="9" height="6" rx="1.4" fill="#0F172A" stroke="${ink}" stroke-width="0.45" />',
        '<circle cx="${jn(cx - 1.8)}" cy="${jn(cy + 8)}" r="1.05" fill="${commandGreen}" />',
        '<circle cx="${jn(cx + 1.8)}" cy="${jn(cy + 8)}" r="1.05" fill="${commandBlue}" />',
      ].join('');
    default:
      return '';
  }
}



