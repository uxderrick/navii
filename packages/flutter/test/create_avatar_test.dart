import 'package:flutter/widgets.dart';
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

  group('NaviiGroup', () {
    testWidgets('empty seeds builds without calling the engine', (tester) async {
      await tester.pumpWidget(
        const Center(child: NaviiGroup(seeds: [])),
      );
      expect(find.byType(NaviiGroup), findsOneWidget);
      expect(find.byType(SizedBox), findsOneWidget);
      expect(tester.getSize(find.byType(SizedBox)), Size.zero);
    });
  });
}
