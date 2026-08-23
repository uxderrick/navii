import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

Map<String, dynamic> _loadFixtures() {
  final file = File('test/fixtures/primitives_ts.json');
  return jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
}

void main() {
  final fixtures = _loadFixtures();

  group('sha256Hex (TS parity)', () {
    final expected = fixtures['sha256'] as Map<String, dynamic>;

    test('empty string', () {
      expect(sha256Hex(''), expected['empty']);
    });

    test('"abc"', () {
      expect(sha256Hex('abc'), expected['abc']);
    });

    test('test@example.com', () {
      expect(sha256Hex('test@example.com'), expected['testEmail']);
    });

    test('112× a (block boundary)', () {
      expect(sha256Hex('a' * 112), expected['a112']);
    });

    test('emoji UTF-8', () {
      expect(sha256Hex('hello 😀'), expected['emoji']);
    });
  });

  group('cyrb53 (TS parity)', () {
    final expected = fixtures['cyrb53'] as Map<String, dynamic>;

    for (final entry in expected.entries) {
      final key = entry.key;
      final input = key == '__empty__' ? '' : key;
      final values = entry.value as Map<String, dynamic>;

      test('hash("$input")', () {
        expect(cyrb53(input), (values['salt0'] as List).cast<int>());
        expect(cyrb53(input, 1), (values['salt1'] as List).cast<int>());
      });
    }
  });

  group('createRng (TS parity)', () {
    final expected = fixtures['rng'] as Map<String, dynamic>;

    for (final entry in expected.entries) {
      final seedKey = entry.key;
      final values = entry.value as Map<String, dynamic>;

      test('stream("$seedKey")', () {
        final r = createRng(seedKey);
        final next = List.generate(16, (_) => r.next());
        expect(next, (values['next'] as List).cast<double>());

        final r2 = createRng(seedKey);
        final ints = List.generate(8, (_) => r2.nextInt(10));
        expect(ints, (values['ints'] as List).cast<int>());

        final r3 = createRng(seedKey);
        final bools = List.generate(8, (_) => r3.nextBool(0.5));
        expect(bools, (values['bools'] as List).cast<bool>());

        final r4 = createRng(seedKey);
        final ranges = List.generate(8, (_) => r4.range(-1, 1));
        expect(ranges, (values['ranges'] as List).cast<double>());

        final r5 = createRng(seedKey);
        final picks = List.generate(8, (_) => r5.pick(['a', 'b', 'c', 'd']));
        expect(picks, (values['picks'] as List).cast<String>());
      });
    }

    test('pick throws on empty', () {
      expect(() => createRng('x').pick(<String>[]), throwsStateError);
    });
  });

  group('seed helpers (TS parity)', () {
    final expected = fixtures['seed'] as Map<String, dynamic>;

    test('normalizeEmail', () {
      expect(normalizeEmail('  A@B.C  '), expected['normalize']);
    });

    test('seedFromEmail Gravatar vector', () {
      expect(seedFromEmail('test@example.com'), expected['fromEmail']);
      expect(seedFromEmail('  Test@Example.COM  '), expected['fromEmailNorm']);
    });

    test('seedFromEmail Café (precomposed)', () {
      expect(seedFromEmail('Café@Example.COM'), expected['cafe']);
    });

    test('seed prefers id', () {
      expect(
        seed(const SeedFields(id: 'u123', email: 'a@b.c', name: 'Alice')),
        expected['id'],
      );
    });

    test('seed coerces numeric id', () {
      expect(seed(const SeedFields(id: 42)), expected['numId']);
    });

    test('seed hashes email by default', () {
      expect(
        seed(const SeedFields(email: 'a@b.c', name: 'Alice')),
        expected['emailHashed'],
      );
    });

    test('seed raw email when hashEmail: false', () {
      expect(
        seed(const SeedFields(email: 'a@b.c'), const SeedOptions(hashEmail: false)),
        expected['emailRaw'],
      );
    });

    test('seed name + createdAt millis', () {
      expect(
        seed(const SeedFields(name: 'Alice', createdAt: 1700000000000)),
        expected['nameTs'],
      );
    });

    test('seed name + DateTime', () {
      expect(
        seed(SeedFields(
          name: 'Alice',
          createdAt: DateTime.parse('2024-01-01T00:00:00Z'),
        )),
        expected['nameDate'],
      );
    });

    test('seed name + ISO string', () {
      expect(
        seed(const SeedFields(name: 'Alice', createdAt: '2024-01-01T00:00:00Z')),
        expected['nameIso'],
      );
    });

    test('seed bare name', () {
      expect(seed(const SeedFields(name: 'Alice')), expected['nameOnly']);
    });

    test('seed skips empty id', () {
      expect(
        seed(
          const SeedFields(id: '', email: 'a@b.c'),
          const SeedOptions(hashEmail: false),
        ),
        expected['emptyIdFallback'],
      );
    });

    test('seed throws when empty', () {
      expect(() => seed(const SeedFields()), throwsArgumentError);
      expect(
        () => seed(const SeedFields(id: null, email: null, name: '')),
        throwsArgumentError,
      );
    });

    test('seedFromEmail throws on empty', () {
      expect(() => seedFromEmail(''), throwsArgumentError);
    });
  });
}
