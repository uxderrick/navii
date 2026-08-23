import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

void main() {
  group('createAvatar', () {
    test('rejects empty seed', () {
      expect(() => createAvatar(''), throwsArgumentError);
    });

    test('returns svg for a seed', () {
      final svg = createAvatar('alice@example.com');
      expect(svg.startsWith('<svg'), isTrue);
      expect(svg.contains('navii-grad-'), isTrue);
    });
  });

  group('random', () {
    test('returns an RFC 4122 version 4 seed', () {
      final result = random();

      expect(
        result.seed,
        matches(
          RegExp(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
          ),
        ),
      );
      expect(result.svg, createAvatar(result.seed));
    });
  });
}
