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
}
