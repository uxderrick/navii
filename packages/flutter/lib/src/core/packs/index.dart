/// Pack registry helpers — port of `packages/core/src/packs/index.ts`.
library;

import 'built_in.dart';
import 'types.dart';

export 'built_in.dart' show builtInPacks, packRegistry;
export 'types.dart';

/// Resolve pack ids to [Pack] objects, skipping unknowns and deduping.
List<Pack> resolvePacks(List<String>? ids) {
  if (ids == null || ids.isEmpty) return const [];
  final seen = <String>{};
  final result = <Pack>[];
  for (final id in ids) {
    if (seen.contains(id)) continue;
    final pack = packRegistry[id];
    if (pack != null) {
      seen.add(id);
      result.add(pack);
    }
  }
  return result;
}
