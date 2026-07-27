/// Port of packages/core/src/parts/antenna.ts
library;

import '../js_num.dart';
import '../types.dart';
import 'anchor.dart';

String renderAntenna(String id, FaceAnchor anchor, Palette palette) {
  if (id == 'none') return '';

  final cx = anchor.topperX;
  final topY = anchor.topperY;
  final color = palette.accent;
  final ink = palette.ink;

  switch (id) {
    case 'classic':
      return [
        '<path d="M${jn(cx)} ${jn(topY)} Q${jn(cx + 1)} ${jn(topY - 5)} ${jn(cx + 2.5)} ${jn(topY - 9)}" stroke="$ink" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.55" />',
        '<circle class="spark" cx="${jn(cx + 2.5)}" cy="${jn(topY - 10)}" r="2.6" fill="$color" stroke="$ink" stroke-width="0.6" opacity="0.95" />',
      ].join('');
    case 'curl':
      return [
        '<path d="M${jn(cx)} ${jn(topY)} Q${jn(cx + 6)} ${jn(topY - 4)} ${jn(cx + 1)} ${jn(topY - 8)} Q${jn(cx - 4)} ${jn(topY - 11)} ${jn(cx + 1)} ${jn(topY - 14)}" stroke="$ink" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.55" />',
        '<circle class="spark" cx="${jn(cx + 1)}" cy="${jn(topY - 14)}" r="2.2" fill="$color" stroke="$ink" stroke-width="0.6" opacity="0.95" />',
      ].join('');
    case 'double':
      return [
        '<path d="M${jn(cx - 4)} ${jn(topY)} Q${jn(cx - 5)} ${jn(topY - 4)} ${jn(cx - 5.5)} ${jn(topY - 8)}" stroke="$ink" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55" />',
        '<path d="M${jn(cx + 4)} ${jn(topY)} Q${jn(cx + 5)} ${jn(topY - 4)} ${jn(cx + 5.5)} ${jn(topY - 8)}" stroke="$ink" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55" />',
        '<circle class="spark" cx="${jn(cx - 5.5)}" cy="${jn(topY - 9)}" r="2.1" fill="$color" stroke="$ink" stroke-width="0.5" opacity="0.95" />',
        '<circle class="spark" cx="${jn(cx + 5.5)}" cy="${jn(topY - 9)}" r="2.1" fill="$color" stroke="$ink" stroke-width="0.5" opacity="0.95" />',
      ].join('');
    case 'spike':
      return [
        '<path class="spark" d="M${jn(cx - 2.5)} ${jn(topY - 1)} L${jn(cx + 1)} ${jn(topY - 11)} L${jn(cx + 4.5)} ${jn(topY - 1)} Z" fill="$color" stroke="$ink" stroke-width="0.6" opacity="0.95" />',
      ].join('');
    default:
      return '';
  }
}
