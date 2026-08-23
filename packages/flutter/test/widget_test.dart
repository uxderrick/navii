import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:usenavii/usenavii.dart';

String _svgOf(SvgPicture picture) {
  return (picture.bytesLoader as SvgStringLoader).provideSvg(null);
}

Widget _wrap(Widget child) {
  return Directionality(
    textDirection: TextDirection.ltr,
    child: Center(child: child),
  );
}

void main() {
  group('Navii', () {
    testWidgets('lays out at size', (tester) async {
      await tester.pumpWidget(_wrap(const Navii(seed: 'alice', size: 64)));
      expect(tester.getSize(find.byType(Navii)), const Size(64, 64));
    });

    testWidgets('same seed → same SVG as createAvatar', (tester) async {
      const seed = 'alice@example.com';
      const size = 80.0;
      await tester.pumpWidget(_wrap(const Navii(seed: seed, size: size)));

      final picture = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(
        _svgOf(picture),
        createAvatar(seed, const AvatarOptions(size: size)),
      );
    });

    testWidgets('deterministic across rebuilds', (tester) async {
      await tester.pumpWidget(_wrap(const Navii(seed: 'bob', size: 48)));
      final first = _svgOf(tester.widget<SvgPicture>(find.byType(SvgPicture)));

      await tester.pumpWidget(_wrap(const Navii(seed: 'bob', size: 48)));
      final second = _svgOf(tester.widget<SvgPicture>(find.byType(SvgPicture)));

      expect(first, second);
      expect(first, createAvatar('bob', const AvatarOptions(size: 48)));
    });

    testWidgets('maps styleHint / mood / paletteId into engine options',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const Navii(
            seed: 'carol',
            size: 64,
            styleHint: 'femme',
            mood: 'happy',
            paletteId: 'mint',
          ),
        ),
      );

      final picture = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(
        _svgOf(picture),
        createAvatar(
          'carol',
          const AvatarOptions(
            size: 64,
            style: 'femme',
            mood: 'happy',
            paletteId: 'mint',
          ),
        ),
      );
    });

    testWidgets('alt wins over title for semantics', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const Navii(
            seed: 'alice',
            size: 32,
            title: 'Title label',
            alt: 'Alt label',
          ),
        ),
      );

      expect(
        tester.getSemantics(find.byType(Navii)),
        matchesSemantics(label: 'Alt label', isImage: true),
      );
    });

    testWidgets('title used when alt is omitted', (tester) async {
      await tester.pumpWidget(
        _wrap(const Navii(seed: 'alice', size: 32, title: 'Ada')),
      );

      expect(
        tester.getSemantics(find.byType(Navii)),
        matchesSemantics(label: 'Ada', isImage: true),
      );
    });

    testWidgets('accepts animated without changing layout size', (tester) async {
      await tester.pumpWidget(
        _wrap(const Navii(seed: 'alice', size: 40, animated: true)),
      );
      expect(tester.getSize(find.byType(Navii)), const Size(40, 40));
      final svg = _svgOf(tester.widget<SvgPicture>(find.byType(SvgPicture)));
      expect(
        svg,
        createAvatar('alice', const AvatarOptions(size: 40, animated: true)),
      );
    });
  });

  group('NaviiGroup', () {
    testWidgets('empty seeds → zero-size widget', (tester) async {
      await tester.pumpWidget(_wrap(const NaviiGroup(seeds: [])));
      expect(find.byType(NaviiGroup), findsOneWidget);
      expect(find.byType(SvgPicture), findsNothing);
      expect(tester.getSize(find.byType(SizedBox)), Size.zero);
    });

    testWidgets('lays out to engine tile width/height', (tester) async {
      const seeds = ['a', 'b', 'c'];
      const size = 48.0;
      const overlap = 0.3;
      final expected = renderGroupTiles(
        seeds,
        const GroupOptions(size: size, overlap: overlap),
      );

      await tester.pumpWidget(
        _wrap(
          const NaviiGroup(seeds: seeds, size: size, overlap: overlap),
        ),
      );

      expect(
        tester.getSize(find.byType(NaviiGroup)),
        Size(expected.width, expected.height),
      );
      expect(find.byType(SvgPicture), findsNWidgets(3));
    });

    testWidgets('tile SVGs match renderGroupTiles', (tester) async {
      const seeds = ['alice', 'bob'];
      const size = 40.0;
      final expected = renderGroupTiles(
        seeds,
        const GroupOptions(size: size),
      );

      await tester.pumpWidget(
        _wrap(const NaviiGroup(seeds: seeds, size: size)),
      );

      final pictures =
          tester.widgetList<SvgPicture>(find.byType(SvgPicture)).toList();
      expect(pictures, hasLength(2));
      expect(_svgOf(pictures[0]), expected.tiles[0]);
      expect(_svgOf(pictures[1]), expected.tiles[1]);
    });

    testWidgets('max overflow renders counter tile', (tester) async {
      const seeds = ['a', 'b', 'c', 'd', 'e'];
      await tester.pumpWidget(
        _wrap(
          const NaviiGroup(seeds: seeds, size: 32, max: 3),
        ),
      );

      // 2 avatar SvgPictures + 1 Flutter-native counter (centered Text).
      expect(find.byType(SvgPicture), findsNWidgets(2));
      expect(find.text('+3'), findsOneWidget);
    });

    testWidgets('counter converts CSS RRGGBBAA colors to Flutter ARGB',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const NaviiGroup(
            seeds: ['a', 'b'],
            size: 32,
            max: 1,
            counterFill: '#11223380',
            counterInk: '#44556640',
            ring: '#77889920',
          ),
        ),
      );

      final counter = tester.widget<DecoratedBox>(find.byType(DecoratedBox));
      final decoration = counter.decoration as BoxDecoration;
      final border = decoration.border! as Border;
      final text = tester.widget<Text>(find.text('+2'));

      expect(decoration.color, const Color(0x80112233));
      expect(border.top.color, const Color(0x20778899));
      expect(text.style!.color, const Color(0x40445566));
    });

    testWidgets('counter expands CSS RGBA shorthand', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const NaviiGroup(
            seeds: ['a', 'b'],
            size: 32,
            max: 1,
            counterFill: '#1238',
          ),
        ),
      );

      final counter = tester.widget<DecoratedBox>(find.byType(DecoratedBox));
      final decoration = counter.decoration as BoxDecoration;
      expect(decoration.color, const Color(0x88112233));
    });

    testWidgets('counter rejects unsupported CSS color syntax',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const NaviiGroup(
            seeds: ['a', 'b'],
            size: 32,
            max: 1,
            counterFill: 'rgb(1, 2, 3)',
          ),
        ),
      );

      expect(
        tester.takeException(),
        isA<ArgumentError>().having(
          (error) => error.message,
          'message',
          contains('hex color'),
        ),
      );
    });

    testWidgets('default accessibility label', (tester) async {
      await tester.pumpWidget(
        _wrap(const NaviiGroup(seeds: ['a', 'b'], size: 32)),
      );

      expect(
        tester.getSemantics(find.byType(NaviiGroup)),
        matchesSemantics(label: 'Group of 2 avatars', isImage: true),
      );
    });

    testWidgets('alt overrides default group label', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const NaviiGroup(
            seeds: ['a', 'b'],
            size: 32,
            alt: 'Team avatars',
          ),
        ),
      );

      expect(
        tester.getSemantics(find.byType(NaviiGroup)),
        matchesSemantics(label: 'Team avatars', isImage: true),
      );
    });
  });

  group('README usage snippets', () {
    testWidgets('Navii snippet', (tester) async {
      // Mirrors packages/flutter/README.md Usage section.
      const userId = 'user_42';
      const userName = 'Ada';
      await tester.pumpWidget(
        _wrap(
          const Navii(
            seed: userId,
            size: 64,
            title: userName,
          ),
        ),
      );
      expect(tester.getSize(find.byType(Navii)), const Size(64, 64));
      expect(
        tester.getSemantics(find.byType(Navii)),
        matchesSemantics(label: userName, isImage: true),
      );
    });

    testWidgets('NaviiGroup snippet', (tester) async {
      // Mirrors packages/flutter/README.md NaviiGroup section.
      final teamIds = ['a', 'b', 'c', 'd', 'e', 'f'];
      await tester.pumpWidget(
        _wrap(
          NaviiGroup(
            seeds: teamIds,
            size: 48,
            overlap: 0.3,
            max: 5,
          ),
        ),
      );
      // max: 5 with 6 seeds → 4 avatar tiles + Flutter +N counter
      expect(find.byType(SvgPicture), findsNWidgets(4));
      expect(find.text('+2'), findsOneWidget);
      expect(tester.getSize(find.byType(NaviiGroup)).height, 48);
    });
  });
}
