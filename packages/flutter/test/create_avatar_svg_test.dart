import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

List<dynamic> _loadGoldens() {
  final file = File('test/fixtures/create_avatar_ts.json');
  return jsonDecode(file.readAsStringSync()) as List<dynamic>;
}

AvatarOptions _optionsFromJson(Map<String, dynamic>? raw) {
  if (raw == null || raw.isEmpty) return const AvatarOptions();
  Object? background = raw['background'];
  if (background is Map) {
    background = BackgroundOverride(background['color'] as String);
  }
  return AvatarOptions(
    size: (raw['size'] as num?)?.toDouble(),
    paletteId: raw['paletteId'] as String?,
    background: background,
    mood: raw['mood'] as String?,
    style: raw['style'] as String?,
    packs: (raw['packs'] as List?)?.cast<String>(),
    title: raw['title'] as String?,
    animated: raw['animated'] as bool?,
    tileBg: raw['tileBg'] as String?,
  );
}

void main() {
  group('createAvatar (TS SVG parity)', () {
    final fixtures = _loadGoldens();

    for (var i = 0; i < fixtures.length; i++) {
      final entry = fixtures[i] as Map<String, dynamic>;
      final seed = entry['seed'] as String;
      final optionsRaw =
          (entry['options'] as Map?)?.cast<String, dynamic>() ?? {};
      final expected = entry['svg'] as String;
      final label = 'case $i seed=$seed';

      test(label, () {
        final svg = createAvatar(seed, _optionsFromJson(optionsRaw));
        expect(svg, expected);
      });
    }
  });

  group('createAvatar contract', () {
    test('throws on empty seed', () {
      expect(() => createAvatar(''), throwsArgumentError);
    });

    test('deterministic', () {
      expect(createAvatar('alice'), createAvatar('alice'));
    });

    test('returns svg wrapper', () {
      final svg = createAvatar('hello');
      expect(svg.startsWith('<svg'), isTrue);
      expect(svg.endsWith('</svg>'), isTrue);
    });
  });
}
