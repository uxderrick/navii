import 'package:flutter/material.dart';
import 'package:usenavii/usenavii.dart';

void main() {
  runApp(const NaviiExampleApp());
}

class NaviiExampleApp extends StatelessWidget {
  const NaviiExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'usenavii example',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
      ),
      home: const DemoPage(),
    );
  }
}

class DemoPage extends StatefulWidget {
  const DemoPage({super.key});

  @override
  State<DemoPage> createState() => _DemoPageState();
}

class _DemoPageState extends State<DemoPage> {
  static const _moods = <String>[
    'neutral',
    'happy',
    'serious',
    'sleepy',
    'wink',
  ];

  static const _teamSeeds = <String>[
    'alice@example.com',
    'bob',
    'carol',
    'dave',
    'eve',
    'frank',
  ];

  final _seedController = TextEditingController(text: 'alice@example.com');

  double _size = 96;
  String _mood = 'neutral';
  String _seed = 'alice@example.com';

  @override
  void dispose() {
    _seedController.dispose();
    super.dispose();
  }

  void _applySeed([String? value]) {
    final next = (value ?? _seedController.text).trim();
    if (next.isEmpty) return;
    setState(() {
      _seed = next;
      _seedController.text = next;
    });
  }

  void _randomize() {
    final result = random(AvatarOptions(size: _size, mood: _mood));
    _applySeed(result.seed);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 48),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Text('usenavii', style: theme.textTheme.headlineMedium),
                const SizedBox(height: 4),
                Text(
                  'Deterministic mascot avatars for Flutter.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 28),
                Card(
                  elevation: 0,
                  color: theme.colorScheme.surfaceContainerLowest,
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Navii(
                          seed: _seed,
                          size: _size,
                          mood: _mood,
                          title: _seed,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _seed,
                          style: theme.textTheme.labelLarge,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _seedController,
                  decoration: const InputDecoration(
                    labelText: 'Seed',
                    hintText: 'user.id, UUID, or email',
                  ),
                  textInputAction: TextInputAction.done,
                  onSubmitted: _applySeed,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: _applySeed,
                        child: const Text('Apply seed'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _randomize,
                        child: const Text('Random'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Text('Size ${_size.round()}', style: theme.textTheme.titleSmall),
                Slider(
                  value: _size,
                  min: 48,
                  max: 192,
                  divisions: 18,
                  label: _size.round().toString(),
                  onChanged: (value) => setState(() => _size = value),
                ),
                const SizedBox(height: 8),
                Text('Mood', style: theme.textTheme.titleSmall),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final mood in _moods)
                      ChoiceChip(
                        label: Text(mood),
                        selected: _mood == mood,
                        onSelected: (_) => setState(() => _mood = mood),
                      ),
                  ],
                ),
                const SizedBox(height: 32),
                Text('NaviiGroup', style: theme.textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(
                  'Overlapping stack with a +N counter when max is exceeded.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                NaviiGroup(
                  seeds: _teamSeeds,
                  size: 48,
                  overlap: 0.3,
                  max: 5,
                  alt: 'Example team avatars',
                ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
