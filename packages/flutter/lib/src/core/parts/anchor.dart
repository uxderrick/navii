/// Port of packages/core/src/parts/anchor.ts
library;

class FaceAnchor {
  const FaceAnchor({
    required this.cx,
    required this.eyeY,
    required this.eyeOffset,
    required this.eyeScale,
    required this.mouthY,
    required this.mouthSpan,
    required this.topperX,
    required this.topperY,
    required this.groundY,
    required this.cheekY,
    required this.cheekOffset,
  });

  final double cx;
  final double eyeY;
  final double eyeOffset;
  final double eyeScale;
  final double mouthY;
  final double mouthSpan;
  final double topperX;
  final double topperY;
  final double groundY;
  final double cheekY;
  final double cheekOffset;

  FaceAnchor copyWith({double? eyeOffset}) => FaceAnchor(
        cx: cx,
        eyeY: eyeY,
        eyeOffset: eyeOffset ?? this.eyeOffset,
        eyeScale: eyeScale,
        mouthY: mouthY,
        mouthSpan: mouthSpan,
        topperX: topperX,
        topperY: topperY,
        groundY: groundY,
        cheekY: cheekY,
        cheekOffset: cheekOffset,
      );
}

final Map<String, FaceAnchor> anchors = {
  'orb': FaceAnchor(cx: 50, eyeY: 52, eyeOffset: 10, eyeScale: 1.0, mouthY: 62, mouthSpan: 7, topperX: 50, topperY: 22, groundY: 86, cheekY: 58, cheekOffset: 18),
  'tall': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 8, eyeScale: 1.05, mouthY: 60, mouthSpan: 6, topperX: 50, topperY: 18, groundY: 91, cheekY: 55, cheekOffset: 14),
  'squat': FaceAnchor(cx: 50, eyeY: 56, eyeOffset: 11, eyeScale: 0.95, mouthY: 66, mouthSpan: 8, topperX: 50, topperY: 30, groundY: 86, cheekY: 62, cheekOffset: 20),
  'pear': FaceAnchor(cx: 50, eyeY: 51, eyeOffset: 9, eyeScale: 1.0, mouthY: 60, mouthSpan: 6.5, topperX: 50, topperY: 24, groundY: 90, cheekY: 57, cheekOffset: 15),
  'pebble': FaceAnchor(cx: 50, eyeY: 54, eyeOffset: 10.5, eyeScale: 1.0, mouthY: 63, mouthSpan: 7.5, topperX: 53, topperY: 23, groundY: 85, cheekY: 59, cheekOffset: 19),
  'dumpling': FaceAnchor(cx: 50, eyeY: 58, eyeOffset: 11, eyeScale: 0.98, mouthY: 68, mouthSpan: 8, topperX: 50, topperY: 32, groundY: 88, cheekY: 64, cheekOffset: 21),
  'taro': FaceAnchor(cx: 50, eyeY: 50, eyeOffset: 9, eyeScale: 1.02, mouthY: 60, mouthSpan: 6.5, topperX: 50, topperY: 14, groundY: 91, cheekY: 55, cheekOffset: 14),
  'wisp': FaceAnchor(cx: 50, eyeY: 47, eyeOffset: 7.5, eyeScale: 1.08, mouthY: 58, mouthSpan: 5.5, topperX: 50, topperY: 12, groundY: 94, cheekY: 53, cheekOffset: 12),
  'squircle': FaceAnchor(cx: 50, eyeY: 44, eyeOffset: 13, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 8, groundY: 98, cheekY: 52, cheekOffset: 24),
  'pumpkin': FaceAnchor(cx: 50, eyeY: 52, eyeOffset: 11, eyeScale: 1.0, mouthY: 66, mouthSpan: 9, topperX: 50, topperY: 18, groundY: 88, cheekY: 60, cheekOffset: 20),
  'ghost': FaceAnchor(cx: 50, eyeY: 42, eyeOffset: 8, eyeScale: 1.05, mouthY: 54, mouthSpan: 6, topperX: 50, topperY: 12, groundY: 92, cheekY: 50, cheekOffset: 14),
  'skullHead': FaceAnchor(cx: 50, eyeY: 50, eyeOffset: 10, eyeScale: 1.0, mouthY: 70, mouthSpan: 7, topperX: 50, topperY: 16, groundY: 90, cheekY: 60, cheekOffset: 16),
  'galleryPlaque': FaceAnchor(cx: 50, eyeY: 50, eyeOffset: 10, eyeScale: 1.0, mouthY: 62, mouthSpan: 7, topperX: 50, topperY: 16, groundY: 91, cheekY: 57, cheekOffset: 17),
  'softShield': FaceAnchor(cx: 50, eyeY: 50, eyeOffset: 10, eyeScale: 1.0, mouthY: 62, mouthSpan: 7, topperX: 50, topperY: 15, groundY: 91, cheekY: 57, cheekOffset: 18),
  'wovenTile': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 12, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 18, groundY: 91, cheekY: 56, cheekOffset: 22),
  'medallion': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 10, eyeScale: 1.0, mouthY: 61, mouthSpan: 7, topperX: 50, topperY: 14, groundY: 88, cheekY: 56, cheekOffset: 18),
  'busBadge': FaceAnchor(cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 18, groundY: 91, cheekY: 56, cheekOffset: 22),
  'routePlaque': FaceAnchor(cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 20, groundY: 87, cheekY: 56, cheekOffset: 23),
  'signTile': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 11, eyeScale: 1.0, mouthY: 62, mouthSpan: 7, topperX: 50, topperY: 15, groundY: 90, cheekY: 56, cheekOffset: 20),
  'matatuBadge': FaceAnchor(cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 18, groundY: 91, cheekY: 56, cheekOffset: 22),
  'routeSticker': FaceAnchor(cx: 50, eyeY: 48, eyeOffset: 11, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 17, groundY: 91, cheekY: 56, cheekOffset: 21),
  'cityPlaque': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 12, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 16, groundY: 90, cheekY: 56, cheekOffset: 22),
  'angledSignTile': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 11, eyeScale: 1.0, mouthY: 62, mouthSpan: 7, topperX: 50, topperY: 15, groundY: 90, cheekY: 56, cheekOffset: 20),
  'dashboardCard': FaceAnchor(cx: 50, eyeY: 47, eyeOffset: 12, eyeScale: 1.0, mouthY: 61, mouthSpan: 8, topperX: 50, topperY: 16, groundY: 89, cheekY: 55, cheekOffset: 23),
  'metricTile': FaceAnchor(cx: 50, eyeY: 48, eyeOffset: 11, eyeScale: 1.0, mouthY: 61, mouthSpan: 7, topperX: 50, topperY: 18, groundY: 88, cheekY: 55, cheekOffset: 21),
  'appWindow': FaceAnchor(cx: 50, eyeY: 48, eyeOffset: 12, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 14, groundY: 90, cheekY: 56, cheekOffset: 23),
  'alertPill': FaceAnchor(cx: 50, eyeY: 49, eyeOffset: 11, eyeScale: 1.0, mouthY: 62, mouthSpan: 8, topperX: 50, topperY: 18, groundY: 88, cheekY: 56, cheekOffset: 22),
};
