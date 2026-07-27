import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

List<dynamic> _loadGoldens() {
  final file = File('test/fixtures/build_ts.json');
  return jsonDecode(file.readAsStringSync()) as List<dynamic>;
}

BuildSpec _specFromJson(Map<String, dynamic>? raw) {
  if (raw == null || raw.isEmpty) return const BuildSpec();
  return BuildSpec(
    palette: raw['palette'] as String?,
    body: raw['body'] as String?,
    eyes: raw['eyes'] as String?,
    mouth: raw['mouth'] as String?,
    antenna: raw['antenna'] as String?,
    accessory: raw['accessory'] as String?,
    background: raw['background'] as String?,
    topper: raw['topper'] as String?,
    outfit: raw['outfit'] as String?,
    hueShift: (raw['hueShift'] as num?)?.toDouble(),
    bodyScale: (raw['bodyScale'] as num?)?.toDouble(),
    eyeGapShift: (raw['eyeGapShift'] as num?)?.toDouble(),
    mouthCurveScale: (raw['mouthCurveScale'] as num?)?.toDouble(),
    antennaTilt: (raw['antennaTilt'] as num?)?.toDouble(),
  );
}

AvatarOptions _optionsFromJson(Map<String, dynamic>? raw) {
  if (raw == null || raw.isEmpty) return const AvatarOptions();
  return AvatarOptions(
    size: (raw['size'] as num?)?.toDouble(),
    paletteId: raw['paletteId'] as String?,
    title: raw['title'] as String?,
    animated: raw['animated'] as bool?,
    tileBg: raw['tileBg'] as String?,
  );
}

void main() {
  group('build (TS SVG parity)', () {
    final fixtures = _loadGoldens();

    for (var i = 0; i < fixtures.length; i++) {
      final entry = fixtures[i] as Map<String, dynamic>;
      final id = entry['id'] as String;
      final specRaw =
          (entry['spec'] as Map?)?.cast<String, dynamic>() ?? {};
      final optionsRaw =
          (entry['options'] as Map?)?.cast<String, dynamic>() ?? {};
      final expected = entry['svg'] as String;

      test('case $i $id', () {
        final svg = build(
          _specFromJson(specRaw),
          _optionsFromJson(optionsRaw),
        );
        expect(svg, expected);
      });
    }
  });

  group('build contract', () {
    test('defaults return svg', () {
      final svg = build();
      expect(svg.startsWith('<svg'), isTrue);
      expect(svg.endsWith('</svg>'), isTrue);
    });

    test('respects mint palette colors', () {
      final svg = build(
        const BuildSpec(
          palette: 'mint',
          body: 'tall',
          eyes: 'star',
          mouth: 'grin',
        ),
      );
      expect(svg, contains('#6EE7B7'));
      expect(svg, contains('#064E3B'));
    });

    test('honors size option', () {
      final svg = build(const BuildSpec(), const AvatarOptions(size: 256));
      expect(svg, contains('width="256"'));
      expect(svg, contains('height="256"'));
    });

    test('byte-identical for same spec', () {
      expect(
        build(const BuildSpec(body: 'tall', eyes: 'star')),
        build(const BuildSpec(body: 'tall', eyes: 'star')),
      );
    });

    test('different specs differ', () {
      final a = build(const BuildSpec(body: 'orb', eyes: 'round'));
      final b = build(const BuildSpec(body: 'tall', eyes: 'star'));
      expect(a, isNot(b));
    });

    test('unknown palette falls back', () {
      final svg = build(const BuildSpec(palette: 'nonexistent'));
      expect(svg.startsWith('<svg'), isTrue);
    });
  });
}
