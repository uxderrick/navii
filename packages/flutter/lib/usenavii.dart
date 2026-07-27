/// Deterministic mascot avatars for Flutter.
///
/// Dart port of `@usenavii/core` + widgets mirroring `@usenavii/react-native`.
/// See the repo root `AGENTS.md` for the phase-by-phase implementation plan.
library;

export 'src/core/create_avatar.dart';
export 'src/core/packs/index.dart' show builtInPacks, packRegistry, resolvePacks, Pack;
export 'src/core/prng.dart' show cyrb53, createRng, Rng;
export 'src/core/render.dart' show renderAvatar, renderAvatarInner;
export 'src/core/seed.dart';
export 'src/core/select.dart' show selectAvatar;
export 'src/core/sha256.dart' show sha256Hex;
export 'src/core/types.dart';
export 'src/widgets/navii.dart';
export 'src/widgets/navii_group.dart';
