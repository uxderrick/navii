import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';
import 'package:usenavii_example/main.dart';

void main() {
  testWidgets('demo renders Navii and NaviiGroup', (tester) async {
    await tester.pumpWidget(const NaviiExampleApp());
    await tester.pumpAndSettle();

    expect(find.text('usenavii'), findsOneWidget);
    expect(find.byType(Navii), findsOneWidget);
    expect(find.byType(NaviiGroup), findsOneWidget);
  });
}
