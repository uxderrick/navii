/// Port of packages/core/src/parts/topper.ts
library;

import '../types.dart';
import '../js_num.dart';
import 'anchor.dart';


String renderTopper(String id, FaceAnchor anchor, Palette palette) {
  if (id == 'none') return '';

  final cx = anchor.topperX;
  final topY = anchor.topperY;
  final ink = palette.ink;
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
    case 'ears':
      // Pointy ears flanking the apex
      return [
        '<path d="M${jn(cx - 16)} ${jn(topY + 6)} L${jn(cx - 11)} ${jn(topY - 5)} L${jn(cx - 6)} ${jn(topY + 8)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />',
        '<path d="M${jn(cx + 6)} ${jn(topY + 8)} L${jn(cx + 11)} ${jn(topY - 5)} L${jn(cx + 16)} ${jn(topY + 6)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />',
        // inner ear blush
        '<path d="M${jn(cx - 14)} ${jn(topY + 4)} L${jn(cx - 11)} ${jn(topY - 1)} L${jn(cx - 8)} ${jn(topY + 5)} Z" fill="${palette.blush}" opacity="0.65" />',
        '<path d="M${jn(cx + 8)} ${jn(topY + 5)} L${jn(cx + 11)} ${jn(topY - 1)} L${jn(cx + 14)} ${jn(topY + 4)} Z" fill="${palette.blush}" opacity="0.65" />',
      ].join('');

    case 'roundEars':
      return [
        '<circle cx="${jn(cx - 13)}" cy="${jn(topY + 2)}" r="6" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />',
        '<circle cx="${jn(cx + 13)}" cy="${jn(topY + 2)}" r="6" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />',
        '<circle cx="${jn(cx - 13)}" cy="${jn(topY + 2)}" r="3" fill="${palette.blush}" opacity="0.6" />',
        '<circle cx="${jn(cx + 13)}" cy="${jn(topY + 2)}" r="3" fill="${palette.blush}" opacity="0.6" />',
      ].join('');

    case 'horn':
      // Single short horn off-center
      return [
        '<path d="M${jn(cx - 1)} ${jn(topY + 2)} Q${jn(cx)} ${jn(topY - 6)} ${jn(cx + 4)} ${jn(topY - 10)} Q${jn(cx + 6)} ${jn(topY - 4)} ${jn(cx + 3)} ${jn(topY + 2)} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" />',
      ].join('');

    case 'horns':
      // Two stubby horns
      return [
        '<path d="M${jn(cx - 7)} ${jn(topY + 4)} Q${jn(cx - 8)} ${jn(topY - 4)} ${jn(cx - 4)} ${jn(topY - 7)} Q${jn(cx - 2)} ${jn(topY - 1)} ${jn(cx - 3)} ${jn(topY + 4)} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" />',
        '<path d="M${jn(cx + 3)} ${jn(topY + 4)} Q${jn(cx + 2)} ${jn(topY - 1)} ${jn(cx + 4)} ${jn(topY - 7)} Q${jn(cx + 8)} ${jn(topY - 4)} ${jn(cx + 7)} ${jn(topY + 4)} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" />',
      ].join('');

    case 'tuft':
      // Hair tuft / single curl
      return [
        '<path d="M${jn(cx)} ${jn(topY + 2)} Q${jn(cx - 2)} ${jn(topY - 4)} ${jn(cx + 1)} ${jn(topY - 8)} Q${jn(cx + 6)} ${jn(topY - 5)} ${jn(cx + 4)} ${jn(topY + 1)} Z" fill="${ink}" opacity="0.85" />',
      ].join('');

    case 'cap':
      // Beanie / cap
      return [
        '<path d="M${jn(cx - 16)} ${jn(topY + 6)} Q${jn(cx - 16)} ${jn(topY - 8)} ${jn(cx)} ${jn(topY - 8)} Q${jn(cx + 16)} ${jn(topY - 8)} ${jn(cx + 16)} ${jn(topY + 6)} Z" fill="${palette.ink}" opacity="0.92" />',
        '<rect x="${jn(cx - 16)}" y="${jn(topY + 5)}" width="32" height="2.5" rx="1" fill="${palette.accent}" opacity="0.85" />',
        '<circle cx="${jn(cx)}" cy="${jn(topY - 9)}" r="2.2" fill="${palette.accent}" stroke="${ink}" stroke-width="0.5" />',
      ].join('');

    case 'leaf':
      // Small leaf sprig — wholesome
      return [
        '<path d="M${jn(cx - 1)} ${jn(topY + 2)} Q${jn(cx - 6)} ${jn(topY - 4)} ${jn(cx - 1)} ${jn(topY - 8)} Q${jn(cx + 3)} ${jn(topY - 4)} ${jn(cx - 1)} ${jn(topY + 2)} Z" fill="#22C55E" stroke="${ink}" stroke-width="0.4" opacity="0.95" />',
        '<path d="M${jn(cx + 1)} ${jn(topY + 2)} Q${jn(cx + 5)} ${jn(topY - 2)} ${jn(cx + 6)} ${jn(topY - 6)}" stroke="#16A34A" stroke-width="1" fill="none" stroke-linecap="round" />',
      ].join('');

    case 'headband':
      // Sweatband across forehead
      return [
        '<path d="M${jn(cx - 18)} ${jn(topY + 8)} Q${jn(cx)} ${jn(topY + 2)} ${jn(cx + 18)} ${jn(topY + 8)} L${jn(cx + 18)} ${jn(topY + 12)} Q${jn(cx)} ${jn(topY + 6)} ${jn(cx - 18)} ${jn(topY + 12)} Z" fill="${palette.bodyTo}" stroke="${ink}" stroke-width="0.6" />',
        '<rect x="${jn(cx - 2)}" y="${jn(topY + 4)}" width="4" height="4" rx="1" fill="${palette.accent}" stroke="${ink}" stroke-width="0.4" />',
      ].join('');

    case 'halo':
      // Floating ring above head
      return [
        '<ellipse cx="${jn(cx)}" cy="${jn(topY - 6)}" rx="11" ry="2.5" fill="none" stroke="#FACC15" stroke-width="2" opacity="0.95" />',
        '<ellipse cx="${jn(cx)}" cy="${jn(topY - 6)}" rx="8.5" ry="1.6" fill="none" stroke="#FDE68A" stroke-width="0.6" opacity="0.7" />',
      ].join('');

    case 'crown':
      // Three-point crown
      return [
        '<path d="M${jn(cx - 11)} ${jn(topY + 4)} L${jn(cx - 11)} ${jn(topY - 4)} L${jn(cx - 6)} ${jn(topY + 1)} L${jn(cx)} ${jn(topY - 7)} L${jn(cx + 6)} ${jn(topY + 1)} L${jn(cx + 11)} ${jn(topY - 4)} L${jn(cx + 11)} ${jn(topY + 4)} Z" fill="#FACC15" stroke="${ink}" stroke-width="0.7" />',
        '<circle cx="${jn(cx - 11)}" cy="${jn(topY - 4)}" r="1.4" fill="#EF4444" stroke="${ink}" stroke-width="0.3" />',
        '<circle cx="${jn(cx)}" cy="${jn(topY - 7)}" r="1.6" fill="#EF4444" stroke="${ink}" stroke-width="0.3" />',
        '<circle cx="${jn(cx + 11)}" cy="${jn(topY - 4)}" r="1.4" fill="#EF4444" stroke="${ink}" stroke-width="0.3" />',
      ].join('');

    case 'antlers':
      // Branching antlers
      return [
        '<path d="M${jn(cx - 5)} ${jn(topY + 4)} L${jn(cx - 6)} ${jn(topY - 4)} M${jn(cx - 6)} ${jn(topY - 4)} L${jn(cx - 10)} ${jn(topY - 6)} M${jn(cx - 6)} ${jn(topY - 4)} L${jn(cx - 6)} ${jn(topY - 9)} M${jn(cx - 6)} ${jn(topY - 9)} L${jn(cx - 8)} ${jn(topY - 11)} M${jn(cx - 6)} ${jn(topY - 9)} L${jn(cx - 3)} ${jn(topY - 11)}" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" fill="none" />',
        '<path d="M${jn(cx + 5)} ${jn(topY + 4)} L${jn(cx + 6)} ${jn(topY - 4)} M${jn(cx + 6)} ${jn(topY - 4)} L${jn(cx + 10)} ${jn(topY - 6)} M${jn(cx + 6)} ${jn(topY - 4)} L${jn(cx + 6)} ${jn(topY - 9)} M${jn(cx + 6)} ${jn(topY - 9)} L${jn(cx + 8)} ${jn(topY - 11)} M${jn(cx + 6)} ${jn(topY - 9)} L${jn(cx + 3)} ${jn(topY - 11)}" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" fill="none" />',
      ].join('');

    case 'bob': {
      // Chin-length bob — hair frames forehead + temples. Reads as a hair
      // silhouette on top of the head. Works for full-bleed (Office) and
      // standard bodies — anchored to topperY + extends down to face area.
      final eyeY = anchor.eyeY;
      final tt = topY - 4;            // top of hair
      final bt = eyeY + 6;             // hair drops to mid-cheek level
      return [
        // Main hair cap — slightly asymmetric for soft look
        '<path d="M${jn(cx - 24)} ${jn(bt)} Q${jn(cx - 26)} ${jn(eyeY - 4)} ${jn(cx - 22)} ${jn(tt + 4)} Q${jn(cx - 14)} ${jn(tt - 2)} ${jn(cx)} ${jn(tt - 3)} Q${jn(cx + 14)} ${jn(tt - 2)} ${jn(cx + 22)} ${jn(tt + 4)} Q${jn(cx + 26)} ${jn(eyeY - 4)} ${jn(cx + 24)} ${jn(bt)} Q${jn(cx + 18)} ${jn(eyeY + 2)} ${jn(cx + 14)} ${jn(eyeY - 2)} Q${jn(cx)} ${jn(eyeY - 8)} ${jn(cx - 14)} ${jn(eyeY - 2)} Q${jn(cx - 18)} ${jn(eyeY + 2)} ${jn(cx - 24)} ${jn(bt)} Z" fill="${ink}" opacity="0.92" />',
        // Subtle highlight strand
        '<path d="M${jn(cx - 14)} ${jn(tt + 4)} Q${jn(cx - 6)} ${jn(tt + 2)} ${jn(cx + 2)} ${jn(tt + 6)}" stroke="${palette.accent}" stroke-width="0.6" fill="none" opacity="0.25" />',
      ].join('');
    }

    case 'bun': {
      // Top knot bun — small disc above the head, with a soft hair base
      // hugging the crown.
      final baseY = topY + 4;
      final bunY = topY - 8;
      return [
        // Hair base on crown
        '<path d="M${jn(cx - 16)} ${jn(baseY)} Q${jn(cx)} ${jn(topY - 4)} ${jn(cx + 16)} ${jn(baseY)} Q${jn(cx + 12)} ${jn(baseY - 4)} ${jn(cx)} ${jn(baseY - 6)} Q${jn(cx - 12)} ${jn(baseY - 4)} ${jn(cx - 16)} ${jn(baseY)} Z" fill="${ink}" opacity="0.92" />',
        // Bun disc
        '<ellipse cx="${jn(cx)}" cy="${jn(bunY)}" rx="6" ry="5" fill="${ink}" opacity="0.95" />',
        // Bun wrap detail
        '<ellipse cx="${jn(cx)}" cy="${jn(bunY - 0.5)}" rx="3.5" ry="2.5" fill="none" stroke="${palette.accent}" stroke-width="0.4" opacity="0.4" />',
      ].join('');
    }

    case 'textileBand':
      return [
        '<path d="M${jn(cx - 20)} ${jn(topY + 9)} Q${jn(cx)} ${jn(topY + 3)} ${jn(cx + 20)} ${jn(topY + 9)} L${jn(cx + 20)} ${jn(topY + 13)} Q${jn(cx)} ${jn(topY + 7)} ${jn(cx - 20)} ${jn(topY + 13)} Z" fill="#F3CF4E" stroke="${ink}" stroke-width="0.55" />',
        '<rect x="${jn(cx - 15)}" y="${jn(topY + 7.5)}" width="5" height="4" fill="#111827" opacity="0.94" />',
        '<rect x="${jn(cx - 8)}" y="${jn(topY + 7)}" width="5" height="4.5" fill="#B12F28" opacity="0.94" />',
        '<rect x="${jn(cx - 1)}" y="${jn(topY + 6.5)}" width="5" height="5" fill="#2F6A3E" opacity="0.94" />',
        '<rect x="${jn(cx + 6)}" y="${jn(topY + 7)}" width="5" height="4.5" fill="#F8D04A" opacity="0.94" />',
      ].join('');

    case 'geometricCap':
      return [
        '<path d="M${jn(cx - 15)} ${jn(topY + 7)} L${jn(cx - 8)} ${jn(topY - 6)} L${jn(cx + 8)} ${jn(topY - 6)} L${jn(cx + 15)} ${jn(topY + 7)} Z" fill="${palette.ink}" opacity="0.94" />',
        '<path d="M${jn(cx - 12)} ${jn(topY + 5)} L${jn(cx - 5)} ${jn(topY - 3)} L${jn(cx)} ${jn(topY + 5)} Z" fill="#F3CF4E" opacity="0.94" />',
        '<path d="M${jn(cx + 12)} ${jn(topY + 5)} L${jn(cx + 5)} ${jn(topY - 3)} L${jn(cx)} ${jn(topY + 5)} Z" fill="#B12F28" opacity="0.94" />',
        '<rect x="${jn(cx - 3)}" y="${jn(topY + 1)}" width="6" height="5" fill="#2F6A3E" opacity="0.9" />',
      ].join('');

    case 'galleryWrap':
      return [
        '<path d="M${jn(cx - 18)} ${jn(topY + 8)} Q${jn(cx - 14)} ${jn(topY - 6)} ${jn(cx + 2)} ${jn(topY - 8)} Q${jn(cx + 17)} ${jn(topY - 5)} ${jn(cx + 19)} ${jn(topY + 9)} Q${jn(cx + 8)} ${jn(topY + 4)} ${jn(cx - 18)} ${jn(topY + 8)} Z" fill="#B12F28" stroke="${ink}" stroke-width="0.55" />',
        '<path d="M${jn(cx - 6)} ${jn(topY - 5)} Q${jn(cx + 2)} ${jn(topY + 1)} ${jn(cx + 16)} ${jn(topY + 5)}" stroke="#F3CF4E" stroke-width="1" opacity="0.95" fill="none" />',
        '<path d="M${jn(cx - 14)} ${jn(topY + 5)} Q${jn(cx - 4)} ${jn(topY + 1)} ${jn(cx + 13)} ${jn(topY + 7)}" stroke="#2F6A3E" stroke-width="0.9" opacity="0.9" fill="none" />',
      ].join('');

    case 'danfoRoofStripe':
      return [
        '<path d="M${jn(cx - 20)} ${jn(topY + 8)} Q${jn(cx)} ${jn(topY + 2)} ${jn(cx + 20)} ${jn(topY + 8)} L${jn(cx + 20)} ${jn(topY + 13)} Q${jn(cx)} ${jn(topY + 7)} ${jn(cx - 20)} ${jn(topY + 13)} Z" fill="#F5C51B" stroke="${ink}" stroke-width="0.6" />',
        '<rect x="${jn(cx - 15)}" y="${jn(topY + 8)}" width="30" height="2.5" rx="1" fill="#111827" opacity="0.9" />',
        '<rect x="${jn(cx - 10)}" y="${jn(topY + 11)}" width="8" height="2.5" fill="#008753" opacity="0.96" />',
        '<rect x="${jn(cx - 1)}" y="${jn(topY + 11)}" width="8" height="2.5" fill="#F8F7EF" opacity="0.96" />',
        '<rect x="${jn(cx + 8)}" y="${jn(topY + 11)}" width="8" height="2.5" fill="#008753" opacity="0.96" />',
      ].join('');

    case 'naijaBand':
      return [
        '<path d="M${jn(cx - 19)} ${jn(topY + 8)} Q${jn(cx)} ${jn(topY + 3)} ${jn(cx + 19)} ${jn(topY + 8)} L${jn(cx + 19)} ${jn(topY + 13)} Q${jn(cx)} ${jn(topY + 8)} ${jn(cx - 19)} ${jn(topY + 13)} Z" fill="#008753" stroke="${ink}" stroke-width="0.55" />',
        '<rect x="${jn(cx - 5)}" y="${jn(topY + 6.5)}" width="10" height="6" rx="1" fill="#F8F7EF" opacity="0.98" />',
        '<rect x="${jn(cx - 18)}" y="${jn(topY + 9)}" width="6" height="3" fill="#F5C51B" opacity="0.96" />',
        '<rect x="${jn(cx + 12)}" y="${jn(topY + 9)}" width="6" height="3" fill="#F5C51B" opacity="0.96" />',
      ].join('');

    case 'routeCap':
      return [
        '<path d="M${jn(cx - 16)} ${jn(topY + 6)} Q${jn(cx - 13)} ${jn(topY - 6)} ${jn(cx)} ${jn(topY - 7)} Q${jn(cx + 13)} ${jn(topY - 6)} ${jn(cx + 16)} ${jn(topY + 6)} Z" fill="#008753" stroke="${ink}" stroke-width="0.6" />',
        '<path d="M${jn(cx - 14)} ${jn(topY + 6)} L${jn(cx + 14)} ${jn(topY + 6)}" stroke="#F5C51B" stroke-width="3" stroke-linecap="round" />',
        '<rect x="${jn(cx - 4)}" y="${jn(topY - 5)}" width="8" height="8" rx="1.5" fill="#F8F7EF" stroke="${ink}" stroke-width="0.4" />',
      ].join('');

    case 'neonRouteBand':
      return [
        '<path d="M${jn(cx - 22)} ${jn(topY + 8)} Q${jn(cx)} ${jn(topY + 1)} ${jn(cx + 22)} ${jn(topY + 8)} L${jn(cx + 20)} ${jn(topY + 14)} Q${jn(cx)} ${jn(topY + 8)} ${jn(cx - 20)} ${jn(topY + 14)} Z" fill="${matatuBlack}" stroke="${ink}" stroke-width="0.6" />',
        '<path d="M${jn(cx - 18)} ${jn(topY + 9)} L${jn(cx + 18)} ${jn(topY + 7)}" stroke="${routeYellow}" stroke-width="2.6" stroke-linecap="round" />',
        '<rect x="${jn(cx - 18)}" y="${jn(topY + 11.5)}" width="9" height="2" fill="${kenyaGreen}" opacity="0.96" />',
        '<rect x="${jn(cx - 4)}" y="${jn(topY + 10.8)}" width="8" height="2.4" fill="${paperWhite}" opacity="0.98" />',
        '<rect x="${jn(cx + 9)}" y="${jn(topY + 11.5)}" width="9" height="2" fill="${kenyaRed}" opacity="0.96" />',
        '<text x="${jn(cx)}" y="${jn(topY + 10.7)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="5" font-weight="800" fill="${matatuBlack}">46</text>',
      ].join('');

    case 'shukaGridBand':
      return [
        '<path d="M${jn(cx - 20)} ${jn(topY + 8)} Q${jn(cx)} ${jn(topY + 3)} ${jn(cx + 20)} ${jn(topY + 8)} L${jn(cx + 20)} ${jn(topY + 13)} Q${jn(cx)} ${jn(topY + 8)} ${jn(cx - 20)} ${jn(topY + 13)} Z" fill="${kenyaRed}" stroke="${ink}" stroke-width="0.55" />',
        '<rect x="${jn(cx - 15)}" y="${jn(topY + 8)}" width="30" height="1.7" fill="${matatuBlack}" opacity="0.96" />',
        '<rect x="${jn(cx - 15)}" y="${jn(topY + 11.5)}" width="30" height="1.5" fill="${paperWhite}" opacity="0.96" />',
        '<rect x="${jn(cx - 7)}" y="${jn(topY + 6.5)}" width="2" height="7" fill="#1E4EA8" opacity="0.92" />',
        '<rect x="${jn(cx + 6)}" y="${jn(topY + 6.5)}" width="2" height="7" fill="${matatuBlack}" opacity="0.92" />',
        '<rect x="${jn(cx - 18)}" y="${jn(topY + 6.8)}" width="5" height="2" fill="${routeYellow}" opacity="0.95" />',
      ].join('');

    case 'stickerCap':
      return [
        '<path d="M${jn(cx - 17)} ${jn(topY + 6)} L${jn(cx + 12)} ${jn(topY - 6)} C${jn(cx + 17)} ${jn(topY - 4)} ${jn(cx + 20)} ${jn(topY + 1)} ${jn(cx + 17)} ${jn(topY + 6)} Z" fill="${paperWhite}" stroke="${ink}" stroke-width="0.6" />',
        '<path d="M${jn(cx - 14)} ${jn(topY + 5)} L${jn(cx + 15)} ${jn(topY + 5)}" stroke="${routeYellow}" stroke-width="2.6" stroke-linecap="round" />',
        '<rect x="${jn(cx - 4)}" y="${jn(topY - 2)}" width="12" height="5" rx="1.1" fill="${matatuBlack}" stroke="${ink}" stroke-width="0.35" />',
        '<text x="${jn(cx + 2)}" y="${jn(topY + 1.9)}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="4.5" font-weight="800" fill="${routeYellow}">CBD</text>',
      ].join('');

    case 'browserTabs':
      return [
        '<ellipse cx="${jn(cx)}" cy="${jn(topY + 9)}" rx="19" ry="5" fill="none" stroke="${commandBlue}" stroke-width="1.2" opacity="0.88" />',
        '<circle cx="${jn(cx - 10)}" cy="${jn(topY + 9)}" r="2.2" fill="${paperWhite}" opacity="0.92" />',
        '<circle cx="${jn(cx)}" cy="${jn(topY + 9)}" r="2.2" fill="${commandGreen}" opacity="0.88" />',
        '<circle cx="${jn(cx + 10)}" cy="${jn(topY + 9)}" r="2.2" fill="${commandAmber}" opacity="0.88" />',
      ].join('');

    case 'commandBar':
      return [
        '<path d="M${jn(cx - 17)} ${jn(topY + 12)} Q${jn(cx)} ${jn(topY + 5)} ${jn(cx + 17)} ${jn(topY + 12)}" stroke="${commandBlue}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.9" />',
        '<circle cx="${jn(cx - 15)}" cy="${jn(topY + 11.5)}" r="2" fill="${commandSlate}" opacity="0.92" />',
        '<circle cx="${jn(cx + 15)}" cy="${jn(topY + 11.5)}" r="2" fill="${commandGreen}" opacity="0.92" />',
      ].join('');

    case 'notificationChip':
      return [
        '<rect x="${jn(cx - 14)}" y="${jn(topY + 6)}" width="28" height="8" rx="4" fill="${paperWhite}" stroke="${commandBlue}" stroke-width="0.9" opacity="0.9" />',
        '<circle cx="${jn(cx - 6)}" cy="${jn(topY + 10)}" r="1.5" fill="${commandSlate}" opacity="0.88" />',
        '<circle cx="${jn(cx)}" cy="${jn(topY + 10)}" r="1.5" fill="${commandGreen}" opacity="0.88" />',
        '<circle cx="${jn(cx + 6)}" cy="${jn(topY + 10)}" r="1.5" fill="${commandAmber}" opacity="0.88" />',
      ].join('');

    case 'chartHeader':
      return [
        '<path d="M${jn(cx - 22)} ${jn(topY + 9)} Q${jn(cx)} ${jn(topY + 3)} ${jn(cx + 22)} ${jn(topY + 9)} L${jn(cx + 22)} ${jn(topY + 14)} Q${jn(cx)} ${jn(topY + 8)} ${jn(cx - 22)} ${jn(topY + 14)} Z" fill="${paperWhite}" stroke="${ink}" stroke-width="0.55" />',
        '<circle cx="${jn(cx - 10)}" cy="${jn(topY + 10)}" r="2.4" fill="${commandBlue}" opacity="0.86" />',
        '<circle cx="${jn(cx)}" cy="${jn(topY + 7)}" r="2.4" fill="${commandGreen}" opacity="0.86" />',
        '<circle cx="${jn(cx + 10)}" cy="${jn(topY + 10)}" r="2.4" fill="${commandAmber}" opacity="0.86" />',
        '<path d="M${jn(cx - 8)} ${jn(topY + 9)} L${jn(cx - 2)} ${jn(topY + 7.5)} L${jn(cx + 8)} ${jn(topY + 9)}" stroke="${commandSlate}" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.72" />',
      ].join('');

    case 'witchHat': {
      // Tall pointed witch hat — cone + brim + band w/ buckle. Sits on apex,
      // tilts slightly for stylized silhouette.
      final tipY = topY - 26;
      final baseY = topY + 2;
      return [
        // Cone — slight curve, tilts right
        '<path d="M${jn(cx - 14)} ${jn(baseY)} Q${jn(cx - 4)} ${jn(baseY - 10)} ${jn(cx + 4)} ${jn(tipY)} Q${jn(cx + 2)} ${jn(baseY - 4)} ${jn(cx + 14)} ${jn(baseY)} Z" fill="${ink}" opacity="0.96" />',
        // Brim — wide flat oval w/ slight curve
        '<ellipse cx="${jn(cx)}" cy="${jn(baseY + 2)}" rx="22" ry="3.4" fill="${ink}" opacity="0.96" />',
        // Band across cone base
        '<rect x="${jn(cx - 14)}" y="${jn(baseY - 4)}" width="28" height="3" fill="${palette.accent}" opacity="0.85" />',
        // Buckle
        '<rect x="${jn(cx - 2)}" y="${jn(baseY - 4)}" width="4" height="3" fill="${palette.bodyFrom}" stroke="${ink}" stroke-width="0.4" />',
        // Star/moon sparkle near tip
        '<circle cx="${jn(cx + 2)}" cy="${jn(tipY + 6)}" r="0.9" fill="${palette.accent}" opacity="0.9" />',
      ].join('');
    }

    case 'pumpkinStem': {
      // Curled green stem + small leaf — sits on top of a pumpkin body.
      return [
        // Main stem — slightly curved
        '<path d="M${jn(cx - 2)} ${jn(topY + 4)} Q${jn(cx)} ${jn(topY - 2)} ${jn(cx + 1)} ${jn(topY - 8)} L${jn(cx + 3)} ${jn(topY - 8)} Q${jn(cx + 4)} ${jn(topY)} ${jn(cx + 2)} ${jn(topY + 4)} Z" fill="#3F6F2C" stroke="${ink}" stroke-width="0.5" />',
        // Leaf curling off
        '<path d="M${jn(cx + 3)} ${jn(topY - 4)} Q${jn(cx + 9)} ${jn(topY - 8)} ${jn(cx + 12)} ${jn(topY - 4)} Q${jn(cx + 8)} ${jn(topY - 2)} ${jn(cx + 3)} ${jn(topY - 2)} Z" fill="#4A8035" stroke="${ink}" stroke-width="0.4" />',
        // Vein on leaf
        '<path d="M${jn(cx + 5)} ${jn(topY - 3)} L${jn(cx + 11)} ${jn(topY - 5)}" stroke="#2D5020" stroke-width="0.4" />',
      ].join('');
    }

    case 'ghostSheet': {
      // Drapey sheet "hood" — extra fabric over the head, suggesting a draped
      // ghost. Two soft fold lines for texture.
      return [
        // Sheet cap — wider than body, hangs lower at sides
        '<path d="M${jn(cx - 22)} ${jn(topY + 8)} Q${jn(cx - 26)} ${jn(topY - 4)} ${jn(cx - 14)} ${jn(topY - 10)} Q${jn(cx)} ${jn(topY - 14)} ${jn(cx + 14)} ${jn(topY - 10)} Q${jn(cx + 26)} ${jn(topY - 4)} ${jn(cx + 22)} ${jn(topY + 8)} Q${jn(cx + 12)} ${jn(topY + 4)} ${jn(cx)} ${jn(topY + 6)} Q${jn(cx - 12)} ${jn(topY + 4)} ${jn(cx - 22)} ${jn(topY + 8)} Z" fill="${palette.accent}" stroke="${ink}" stroke-width="0.6" opacity="0.9" />',
        // Fold shadows
        '<path d="M${jn(cx - 12)} ${jn(topY - 6)} Q${jn(cx - 10)} ${jn(topY - 2)} ${jn(cx - 14)} ${jn(topY + 4)}" stroke="${ink}" stroke-width="0.45" fill="none" opacity="0.35" />',
        '<path d="M${jn(cx + 12)} ${jn(topY - 6)} Q${jn(cx + 10)} ${jn(topY - 2)} ${jn(cx + 14)} ${jn(topY + 4)}" stroke="${ink}" stroke-width="0.45" fill="none" opacity="0.35" />',
      ].join('');
    }

    case 'ponytail': {
      // Sleek pulled-back hair + side ponytail. Reads as hair (not a helmet)
      // by keeping the forehead hairline tight + giving the tail an obvious
      // tied-off base ring and a long tapered strand.
      final eyeY = anchor.eyeY;
      final fh = eyeY - 7;             // forehead hairline
      final crownY = topY;              // top of head
      final baseX = cx + 18;            // ponytail tie x
      final baseY = crownY + 6;         // ponytail tie y
      return [
        // Sleek hair cap — narrower than bob, hugs the crown, soft hairline.
        '<path d="M${jn(cx - 22)} ${jn(fh)} Q${jn(cx - 24)} ${jn(crownY - 2)} ${jn(cx - 12)} ${jn(crownY - 4)} L${jn(cx + 14)} ${jn(crownY - 4)} Q${jn(cx + 24)} ${jn(crownY)} ${jn(cx + 22)} ${jn(fh)} Q${jn(cx + 10)} ${jn(fh - 1)} ${jn(cx)} ${jn(fh + 2)} Q${jn(cx - 10)} ${jn(fh - 1)} ${jn(cx - 22)} ${jn(fh)} Z" fill="${ink}" opacity="0.94" />',
        // Subtle highlight sweeping back toward the tie
        '<path d="M${jn(cx - 12)} ${jn(crownY - 2)} Q${jn(cx)} ${jn(crownY - 3)} ${jn(baseX - 2)} ${jn(baseY - 2)}" stroke="${palette.accent}" stroke-width="0.5" fill="none" opacity="0.3" />',
        // Ponytail tie — small ring where the hair gathers
        '<ellipse cx="${jn(baseX)}" cy="${jn(baseY)}" rx="3" ry="2.4" fill="${ink}" opacity="0.95" />',
        '<ellipse cx="${jn(baseX)}" cy="${jn(baseY)}" rx="1.4" ry="1.1" fill="${palette.accent}" opacity="0.32" />',
        // Tail — long tapered strand curving down and slightly out
        '<path d="M${jn(baseX - 1)} ${jn(baseY + 2)} Q${jn(baseX + 5)} ${jn(baseY + 10)} ${jn(baseX + 8)} ${jn(baseY + 20)} Q${jn(baseX + 9)} ${jn(baseY + 28)} ${jn(baseX + 4)} ${jn(baseY + 30)} Q${jn(baseX + 1)} ${jn(baseY + 22)} ${jn(baseX - 3)} ${jn(baseY + 12)} Z" fill="${ink}" opacity="0.92" />',
        // Inner highlight following the tail's flow direction
        '<path d="M${jn(baseX + 2)} ${jn(baseY + 6)} Q${jn(baseX + 5)} ${jn(baseY + 16)} ${jn(baseX + 6)} ${jn(baseY + 24)}" stroke="${palette.accent}" stroke-width="0.5" fill="none" opacity="0.25" />',
      ].join('');
    }
    default:
      return '';
  }
}



