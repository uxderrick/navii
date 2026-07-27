import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

List<dynamic> _loadSvgGoldens() {
  final file = File('test/fixtures/packs_svg_ts.json');
  return jsonDecode(file.readAsStringSync()) as List<dynamic>;
}

Map<String, dynamic> _loadMeta() {
  final file = File('test/fixtures/packs_meta_ts.json');
  return jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
}

AvatarOptions _optionsFromJson(Map<String, dynamic>? raw) {
  if (raw == null || raw.isEmpty) return const AvatarOptions();
  return AvatarOptions(
    size: (raw['size'] as num?)?.toDouble(),
    paletteId: raw['paletteId'] as String?,
    packs: (raw['packs'] as List?)?.cast<String>(),
    mood: raw['mood'] as String?,
    style: raw['style'] as String?,
    title: raw['title'] as String?,
    animated: raw['animated'] as bool?,
    tileBg: raw['tileBg'] as String?,
  );
}

void main() {
  group('packs registry', () {
    final meta = _loadMeta();

    test('built-in pack ids match TS', () {
      final ids = builtInPacks.map((p) => p.id).toList()..sort();
      expect(ids, (meta['builtInIds'] as List).cast<String>());
    });

    test('every built-in is in the registry', () {
      for (final pack in builtInPacks) {
        expect(packRegistry[pack.id], same(pack));
      }
    });

    test('resolvePacks skips unknown and dedupes', () {
      expect(
        resolvePacks(['office', 'office', 'does-not-exist', 'halloween'])
            .map((p) => p.id)
            .toList(),
        (meta['resolveSample'] as List).cast<String>(),
      );
    });

    test('office pack contributes 5 namespaced palettes', () {
      final pack = packRegistry['office']!;
      expect(pack.palettes, isNotNull);
      expect(pack.palettes!.length, 5);
      for (final p in pack.palettes!) {
        expect(p.id.startsWith('office:'), isTrue);
      }
    });
  });

  group('packs SVG parity', () {
    final fixtures = _loadSvgGoldens();

    for (var i = 0; i < fixtures.length; i++) {
      final entry = fixtures[i] as Map<String, dynamic>;
      final id = entry['id'] as String;
      final seed = entry['seed'] as String;
      final optionsRaw =
          (entry['options'] as Map?)?.cast<String, dynamic>() ?? {};
      final expected = entry['svg'] as String;

      test('case $i $id', () {
        final svg = createAvatar(seed, _optionsFromJson(optionsRaw));
        expect(svg, expected);
      });
    }
  });

  group('packs contract', () {
    test('empty / unknown packs leave baseline unchanged', () {
      final baseline = createAvatar('alice');
      expect(createAvatar('alice', const AvatarOptions(packs: [])), baseline);
      expect(
        createAvatar('alice', const AvatarOptions(packs: ['does-not-exist'])),
        baseline,
      );
    });

    test('office paletteId differs from baseline and is deterministic', () {
      const opts = AvatarOptions(
        packs: ['office'],
        paletteId: 'office:navy',
      );
      final officeSvg = createAvatar('alice', opts);
      expect(officeSvg, isNot(createAvatar('alice')));
      expect(officeSvg, createAvatar('alice', opts));
    });
  });
}
