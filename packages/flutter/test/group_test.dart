import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

List<dynamic> _loadGoldens() {
  final file = File('test/fixtures/group_ts.json');
  return jsonDecode(file.readAsStringSync()) as List<dynamic>;
}

GroupOptions _optionsFromJson(Map<String, dynamic>? raw) {
  if (raw == null || raw.isEmpty) return const GroupOptions();
  Object? background = raw['background'];
  if (background is Map) {
    background = BackgroundOverride(background['color'] as String);
  }
  return GroupOptions(
    size: (raw['size'] as num?)?.toDouble(),
    overlap: (raw['overlap'] as num?)?.toDouble(),
    max: raw['max'] as int?,
    counterFill: raw['counterFill'] as String?,
    counterInk: raw['counterInk'] as String?,
    ring: raw['ring'] as String?,
    groupId: raw['groupId'] as String?,
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
  group('renderGroup (TS SVG parity)', () {
    final fixtures = _loadGoldens();

    for (var i = 0; i < fixtures.length; i++) {
      final entry = fixtures[i] as Map<String, dynamic>;
      final id = entry['id'] as String;
      final seeds = (entry['seeds'] as List).cast<String>();
      final optionsRaw =
          (entry['options'] as Map?)?.cast<String, dynamic>() ?? {};
      final expected = entry['svg'] as String;

      test('case $i $id', () {
        final svg = renderGroup(seeds, _optionsFromJson(optionsRaw));
        expect(svg, expected);
      });
    }
  });

  group('renderGroupTiles (TS parity)', () {
    final fixtures = _loadGoldens();

    for (var i = 0; i < fixtures.length; i++) {
      final entry = fixtures[i] as Map<String, dynamic>;
      final id = entry['id'] as String;
      final seeds = (entry['seeds'] as List).cast<String>();
      final optionsRaw =
          (entry['options'] as Map?)?.cast<String, dynamic>() ?? {};
      final expectedTiles = (entry['tiles'] as List).cast<String>();
      final expectedCounter = entry['counter'] as String?;
      final expectedWidth = (entry['width'] as num).toDouble();
      final expectedHeight = (entry['height'] as num).toDouble();

      test('tiles $i $id', () {
        final result = renderGroupTiles(seeds, _optionsFromJson(optionsRaw));
        expect(result.tiles, expectedTiles);
        expect(result.counter, expectedCounter);
        expect(result.width, expectedWidth);
        expect(result.height, expectedHeight);
      });
    }
  });

  group('renderGroup contract', () {
    test('throws on empty seeds', () {
      expect(() => renderGroup([]), throwsArgumentError);
      expect(() => renderGroupTiles([]), throwsArgumentError);
    });

    test('deterministic', () {
      expect(
        renderGroup(['alice', 'bob'], const GroupOptions(size: 48)),
        renderGroup(['alice', 'bob'], const GroupOptions(size: 48)),
      );
    });

    test('different groupId → different clip ids', () {
      final a = renderGroup(
        ['alice', 'bob'],
        const GroupOptions(groupId: 'group-a'),
      );
      final b = renderGroup(
        ['alice', 'bob'],
        const GroupOptions(groupId: 'group-b'),
      );
      final idA = RegExp(r'navii-clip-([a-z0-9]+)').firstMatch(a)?.group(1);
      final idB = RegExp(r'navii-clip-([a-z0-9]+)').firstMatch(b)?.group(1);
      expect(idA, isNotNull);
      expect(idB, isNotNull);
      expect(idA, isNot(idB));
    });

    test('max overflow emits +N counter', () {
      final svg = renderGroup(
        ['a', 'b', 'c', 'd', 'e', 'f'],
        const GroupOptions(size: 32, max: 4),
      );
      expect(svg, contains('+3'));
    });

    test('escapes custom colors', () {
      final svg = renderGroup(
        ['a', 'b', 'c'],
        const GroupOptions(
          size: 48,
          max: 2,
          ring: '#fff" stroke-width="99',
          tileBg: '#000" opacity="0',
          counterFill: '#eee" onload="alert(1)',
          counterInk: '#111" onclick="alert(1)',
        ),
      );
      expect(svg, contains('stroke="#fff&quot; stroke-width=&quot;99"'));
      expect(svg, contains('fill="#000&quot; opacity=&quot;0"'));
      expect(svg, contains('fill="#eee&quot; onload=&quot;alert(1)"'));
      expect(svg, contains('fill="#111&quot; onclick=&quot;alert(1)"'));
    });

    test('width matches composite viewBox', () {
      final seeds = ['x', 'y', 'z'];
      const opts = GroupOptions(size: 48, overlap: 0.3);
      final tiles = renderGroupTiles(seeds, opts);
      final composite = renderGroup(seeds, opts);
      final match =
          RegExp(r'viewBox="0 0 ([\d.]+)').firstMatch(composite);
      expect(double.parse(match!.group(1)!), tiles.width);
    });
  });
}
