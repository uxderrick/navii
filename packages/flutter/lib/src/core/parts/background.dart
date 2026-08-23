/// Port of packages/core/src/parts/background.ts
library;

import '../types.dart';
import '../xml.dart';

String renderBackground(String id, Palette palette, [String? override]) {
  final color = escapeXml(override ?? palette.bodyFrom);
  final accent = escapeXml(palette.accent);
  switch (id) {
    case 'none':
      return '';
    case 'solid':
      return '<rect x="0" y="0" width="100" height="100" fill="$color" opacity="0.18" />';
    case 'ring':
      return [
        '<circle cx="50" cy="50" r="48" fill="$color" opacity="0.14" />',
        '<circle cx="50" cy="50" r="46" fill="none" stroke="$accent" stroke-width="0.6" opacity="0.4" />',
      ].join('');
    default:
      return '';
  }
}
