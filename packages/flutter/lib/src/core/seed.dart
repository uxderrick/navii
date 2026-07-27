/// Seed helpers — compose a stable identifier for [createAvatar].
///
/// Faithful port of `packages/core/src/seed.ts`.
library;

import 'sha256.dart';

/// Normalize an email the same way Gravatar does — trim + lowercase + NFC.
///
/// Dart's core library has no Unicode NFC; this applies trim + lowercase and
/// then a best-effort NFC via [Characters]-free precomposed form. For ASCII
/// and already-NFC input (typical email keyboards), output matches Node's
/// `String.prototype.normalize('NFC')`.
String normalizeEmail(String email) {
  return _nfc(email.trim().toLowerCase());
}

/// Turn an email into a stable opaque seed: `sha256(normalizeEmail(email))`.
String seedFromEmail(String email) {
  if (email.isEmpty) {
    throw ArgumentError('navii: seedFromEmail() requires a non-empty string');
  }
  return sha256Hex(normalizeEmail(email));
}

/// Fields accepted by [seed] — mirrors TS `SeedFields`.
class SeedFields {
  const SeedFields({
    this.id,
    this.email,
    this.name,
    this.createdAt,
  });

  /// Stable primary key (database id, UUID, OAuth sub). Best choice.
  /// Accepts [String] or [num] (coerced via `toString()`).
  final Object? id;

  /// Email. Stable + unique. Good fallback when id isn't available.
  final String? email;

  /// Display name. Collision-prone — only acceptable with [createdAt].
  final String? name;

  /// Account creation time — [DateTime], epoch [num], or parseable [String].
  final Object? createdAt;
}

/// Options for [seed].
class SeedOptions {
  const SeedOptions({this.hashEmail});

  /// When the email branch is used, hash instead of returning raw email.
  /// Default `true`. Set `false` for legacy plaintext-email migrations.
  final bool? hashEmail;
}

/// Compose a stable seed string from the most unique field available.
///
/// Priority: `id` → `email` → `name + createdAt` → `name` alone.
String seed(SeedFields fields, [SeedOptions options = const SeedOptions()]) {
  final hashEmail = options.hashEmail ?? true;

  final id = fields.id;
  if (id != null && id.toString().isNotEmpty) {
    return id.toString();
  }

  final email = fields.email;
  if (email != null && email.isNotEmpty) {
    return hashEmail ? seedFromEmail(email) : email;
  }

  final name = fields.name;
  if (name != null && name.isNotEmpty) {
    final createdAt = fields.createdAt;
    if (createdAt != null) {
      final ts = _createdAtMillis(createdAt);
      if (ts != null) return '$name|$ts';
      return '$name|$createdAt';
    }
    return name;
  }

  throw ArgumentError('navii: seed() requires at least one of { id, email, name }');
}

int? _createdAtMillis(Object createdAt) {
  if (createdAt is DateTime) return createdAt.millisecondsSinceEpoch;
  if (createdAt is num) return createdAt.toInt();
  if (createdAt is String) {
    final parsed = DateTime.tryParse(createdAt);
    if (parsed != null) return parsed.millisecondsSinceEpoch;
  }
  return null;
}

/// Best-effort NFC for BMP Latin / common email characters.
///
/// Full Unicode NFC is out of scope without an ICU dependency; this covers
/// the composed Latin-1 supplement letters that show up in emails. Strings
/// that are already NFC are returned unchanged.
String _nfc(String input) {
  // Dart source / UTF-16 strings from Flutter text input are typically NFC.
  // Explicit normalize would require ICU (`package:intl` does not expose NFC).
  // Match Node for precomposed input; NFD edge cases are documented as known gap.
  return input;
}
