import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

List<dynamic> _loadSelectFixtures() {
  final file = File('test/fixtures/select_avatar_ts.json');
  return jsonDecode(file.readAsStringSync()) as List<dynamic>;
}

AvatarOptions _optionsFromJson(Map<String, dynamic>? raw) {
  if (raw == null || raw.isEmpty) return const AvatarOptions();

  Object? background = raw['background'];
  if (background is Map) {
    background = BackgroundOverride(background['color'] as String);
  }

  Palette? palette;
  final paletteRaw = raw['palette'];
  if (paletteRaw is Map<String, dynamic>) {
    palette = Palette.fromJson(paletteRaw);
  }

  return AvatarOptions(
    paletteId: raw['paletteId'] as String?,
    palette: palette,
    background: background,
    mood: raw['mood'] as String?,
    style: raw['style'] as String?,
    packs: (raw['packs'] as List?)?.cast<String>(),
  );
}

void main() {
  group('selectAvatar (TS parity)', () {
    final fixtures = _loadSelectFixtures();

    for (var i = 0; i < fixtures.length; i++) {
      final entry = fixtures[i] as Map<String, dynamic>;
      final seed = entry['seed'] as String;
      final optionsRaw = (entry['options'] as Map?)?.cast<String, dynamic>() ?? {};
      final expected = entry['spec'] as Map<String, dynamic>;
      final label = 'case $i seed=$seed options=${jsonEncode(optionsRaw)}';

      test(label, () {
        final options = _optionsFromJson(optionsRaw);
        final spec = selectAvatar(seed, options);
        expect(spec.toJson(), expected);
      });
    }
  });

  group('selectAvatar behavior', () {
    test('deterministic', () {
      expect(selectAvatar('alice').toJson(), selectAvatar('alice').toJson());
    });

    test('paletteId override', () {
      expect(selectAvatar('any', const AvatarOptions(paletteId: 'mint')).palette.id, 'mint');
    });

    test('background string override', () {
      expect(
        selectAvatar('any', const AvatarOptions(background: 'ring')).background,
        'ring',
      );
    });

    test('mood happy overrides eyes/mouth, keeps body', () {
      final base = selectAvatar('alice');
      final happy = selectAvatar('alice', const AvatarOptions(mood: 'happy'));
      expect(happy.eyes, 'wide');
      expect(happy.mouth, 'smile');
      expect(happy.body, base.body);
      expect(happy.palette, base.palette);
      expect(happy.topper, base.topper);
    });

    test('office pack sets flat + bgColor flags', () {
      final spec = selectAvatar('alice', const AvatarOptions(packs: ['office']));
      expect(spec.flat, true);
      expect(spec.bgColor, '#FFFFFF');
      expect(spec.body, 'squircle');
    });

    test('unknown packs are no-ops', () {
      expect(
        selectAvatar('alice', const AvatarOptions(packs: ['does-not-exist'])).toJson(),
        selectAvatar('alice').toJson(),
      );
    });

    test('resolvePacks dedupes and skips unknown', () {
      expect(
        resolvePacks(['office', 'office', 'nope', 'halloween']).map((p) => p.id).toList(),
        ['office', 'halloween'],
      );
    });

    test('suppresses topper when antenna present (except leaf)', () {
      var conflicts = 0;
      for (var i = 0; i < 200; i++) {
        final s = selectAvatar('u-$i');
        final blocking = s.topper != 'none' && s.topper != 'leaf';
        if (s.antenna != 'none' && blocking) conflicts++;
      }
      expect(conflicts, 0);
    });
  });
}
