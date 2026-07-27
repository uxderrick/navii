import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

void main() {
  group('createAvatar (Phase 2–4 stubs)', () {
    test('rejects empty seed', () {
      expect(() => createAvatar(''), throwsArgumentError);
    });

    test('throws UnimplementedError until Dart core is ported', () {
      expect(
        () => createAvatar('alice@example.com'),
        throwsA(isA<UnimplementedError>()),
      );
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
