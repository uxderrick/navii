/// Port of packages/core/src/parts/body.ts
library;

import '../js_num.dart';
import '../types.dart';
import 'anchor.dart';

final Map<String, String> _bodyPaths = {
  'orb':
      'M50 20 C72 20 84 36 84 54 C84 73 70 86 50 86 C30 86 16 73 16 54 C16 36 28 20 50 20 Z',
  'tall':
      'M50 15 C66 15 74 30 74 48 C74 70 66 91 50 91 C34 91 26 70 26 48 C26 30 34 15 50 15 Z',
  'squat':
      'M50 28 C74 28 88 42 88 60 C88 78 74 86 50 86 C26 86 12 78 12 60 C12 42 26 28 50 28 Z',
  'pear':
      'M50 18 C62 18 70 32 70 46 C70 56 80 66 80 76 C80 86 68 90 50 90 C32 90 20 86 20 76 C20 66 30 56 30 46 C30 32 38 18 50 18 Z',
  'pebble':
      'M52 19 C72 21 86 36 84 56 C82 73 68 85 50 85 C30 85 16 72 16 54 C16 35 32 17 52 19 Z',
  'dumpling':
      'M50 30 C62 30 70 38 70 48 C70 56 78 64 80 72 C82 82 70 88 50 88 C30 88 18 82 20 72 C22 64 30 56 30 48 C30 38 38 30 50 30 Z',
  'taro':
      'M50 14 C58 14 64 22 64 30 C64 36 60 40 60 46 C60 54 76 60 78 76 C80 88 66 91 50 91 C34 91 20 88 22 76 C24 60 40 54 40 46 C40 40 36 36 36 30 C36 22 42 14 50 14 Z',
  'wisp':
      'M50 12 C60 12 66 24 66 40 C66 60 74 78 70 90 C64 96 36 96 30 90 C26 78 34 60 34 40 C34 24 40 12 50 12 Z',
  'squircle':
      'M4 0 C2 0 0 2 0 4 C0 35 0 65 0 96 C0 98 2 100 4 100 C35 100 65 100 96 100 C98 100 100 98 100 96 C100 65 100 35 100 4 C100 2 98 0 96 0 C65 0 35 0 4 0 Z',
  'pumpkin':
      'M50 18 C70 18 86 30 86 52 C86 74 70 88 50 88 C30 88 14 74 14 52 C14 30 30 18 50 18 Z',
  'ghost':
      'M50 12 C68 12 78 24 78 42 C78 60 80 76 80 88 L74 84 L68 90 L62 84 L56 90 L50 84 L44 90 L38 84 L32 90 L26 84 L20 88 C20 76 22 60 22 42 C22 24 32 12 50 12 Z',
  'skullHead':
      'M50 16 C68 16 80 30 80 50 C80 64 76 72 70 78 L68 86 L60 88 L60 82 L40 82 L40 88 L32 86 L30 78 C24 72 20 64 20 50 C20 30 32 16 50 16 Z',
  'galleryPlaque':
      'M50 16 C68 16 78 29 78 48 L78 80 C78 87 71 91 50 91 C29 91 22 87 22 80 L22 48 C22 29 32 16 50 16 Z',
  'softShield':
      'M50 15 C67 18 80 30 80 49 C80 70 67 84 50 91 C33 84 20 70 20 49 C20 30 33 18 50 15 Z',
  'wovenTile':
      'M20 18 L80 18 C83 18 86 21 86 24 L86 76 C86 83 80 88 50 91 C20 88 14 83 14 76 L14 24 C14 21 17 18 20 18 Z',
  'medallion':
      'M50 14 C68 14 82 28 82 48 C82 70 68 88 50 88 C32 88 18 70 18 48 C18 28 32 14 50 14 Z',
  'busBadge':
      'M22 18 L78 18 C83 18 86 22 86 28 L86 73 C86 82 78 88 50 91 C22 88 14 82 14 73 L14 28 C14 22 17 18 22 18 Z',
  'routePlaque':
      'M20 20 L80 20 C84 20 87 23 87 27 L87 75 C87 82 82 87 75 87 L25 87 C18 87 13 82 13 75 L13 27 C13 23 16 20 20 20 Z',
  'signTile':
      'M25 15 L75 15 C82 15 86 21 86 30 L86 70 C86 82 76 90 50 90 C24 90 14 82 14 70 L14 30 C14 21 18 15 25 15 Z',
  'matatuBadge':
      'M18 18 L82 18 C86 18 89 22 89 28 L86 76 C85 84 76 89 50 91 C24 89 15 84 14 76 L11 28 C11 22 14 18 18 18 Z',
  'routeSticker':
      'M17 22 L79 14 C84 13 88 17 88 22 L84 73 C83 80 78 85 71 86 L21 91 C15 91 11 86 12 80 L16 29 C16 25 14 23 17 22 Z',
  'cityPlaque':
      'M22 16 L78 16 C83 16 86 19 86 24 L86 78 C86 84 80 88 50 90 C20 88 14 84 14 78 L14 24 C14 19 17 16 22 16 Z',
  'angledSignTile':
      'M28 14 L82 22 C86 23 88 27 87 32 L79 78 C78 84 72 88 50 90 C28 88 18 82 16 75 L13 29 C12 23 18 15 28 14 Z',
  'dashboardCard':
      'M17 16 L83 16 C87 16 90 19 90 23 L90 78 C90 84 85 89 79 89 L21 89 C15 89 10 84 10 78 L10 23 C10 19 13 16 17 16 Z',
  'metricTile':
      'M21 18 L79 18 C84 18 87 22 87 27 L87 77 C87 83 82 88 76 88 L24 88 C18 88 13 83 13 77 L13 27 C13 22 16 18 21 18 Z',
  'appWindow':
      'M16 14 L84 14 C88 14 91 17 91 21 L91 79 C91 85 86 90 80 90 L20 90 C14 90 9 85 9 79 L9 21 C9 17 12 14 16 14 Z',
  'alertPill':
      'M28 18 L72 18 C84 18 91 30 91 44 L91 60 C91 76 80 88 50 88 C20 88 9 76 9 60 L9 44 C9 30 16 18 28 18 Z',
};

String renderBodyDefs(
  String id,
  Palette palette,
  String gradId, {
  bool flat = false,
}) {
  if (flat) {
    return '<radialGradient id="$gradId"><stop offset="0%" stop-color="${palette.bodyFrom}" /><stop offset="100%" stop-color="${palette.bodyFrom}" /></radialGradient>';
  }
  return '''
<radialGradient id="$gradId" cx="42%" cy="32%" r="68%">
  <stop offset="0%" stop-color="${palette.bodyFrom}" />
  <stop offset="100%" stop-color="${palette.bodyTo}" />
</radialGradient>'''
      .trim();
}

String renderBody(
  String id,
  Palette palette,
  String gradId, {
  bool flat = false,
}) {
  final d = _bodyPaths[id]!;
  final a = anchors[id]!;
  final outlineColor = _withAlpha(palette.ink, 0.18);

  final parts = <String>[];
  if (!flat) {
    parts.add(
      '<ellipse cx="${jn(a.cx)}" cy="${jn(a.groundY + 4)}" rx="22" ry="2.6" fill="${palette.ink}" opacity="0.16" />',
    );
  }
  parts.add(
    flat
        ? '<path d="$d" fill="url(#$gradId)" />'
        : '<path d="$d" fill="url(#$gradId)" stroke="$outlineColor" stroke-width="0.7" />',
  );
  if (!flat) {
    parts.add(
      '<ellipse cx="${jn(a.cx - 12)}" cy="${jn(a.eyeY - 14)}" rx="11" ry="7" fill="#FFFFFF" opacity="0.22" transform="rotate(-18 ${jn(a.cx - 12)} ${jn(a.eyeY - 14)})" />',
    );
  }
  return parts.join('');
}

String _withAlpha(String hex, double alpha) {
  var h = hex.replaceFirst('#', '');
  final v = h.length == 3 ? h.split('').map((c) => '$c$c').join('') : h;
  final part = v.substring(0, 6);
  final r = int.parse(part.substring(0, 2), radix: 16);
  final g = int.parse(part.substring(2, 4), radix: 16);
  final b = int.parse(part.substring(4, 6), radix: 16);
  return 'rgba($r,$g,$b,$alpha)';
}
