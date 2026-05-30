/**
 * Seed helper — composes the most stable identifier from a user-shaped
 * object into a single string for `createAvatar`.
 *
 * Priority: `id` → `email` → `name + createdAt` → `name` alone.
 *
 * The whole point: stop devs accidentally passing a display name. Names
 * collide; ids and emails don't. When only a name is available, composing
 * it with `createdAt` makes the result globally unique while remaining
 * stable across renders (assuming `createdAt` is set once at signup).
 */

import { sha256Hex } from './sha256.js';

/**
 * Normalize an email the same way Gravatar does — trim + lowercase, NFC.
 * Exported so callers can reproduce the canonical form before hashing.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().normalize('NFC');
}

/**
 * Turn an email into a stable, opaque seed using Gravatar's scheme:
 * `sha256(trim(lowercase(email)))` → lowercase hex.
 *
 * Why: passing raw emails as seeds leaks them through URLs (server logs,
 * Referer headers, browser history, CDN cache keys, analytics). The hash
 * is stable across systems that normalize the same way, so two products
 * looking up the same person get the same avatar.
 *
 * @example
 * ```ts
 * const s = seedFromEmail(user.email);
 * createAvatar(s);                          // safe to log
 * // or hit the API: `/avatar/${s}.svg`     // no plaintext email on the wire
 * ```
 */
export function seedFromEmail(email: string): string {
  if (typeof email !== 'string' || email.length === 0) {
    throw new Error('navii: seedFromEmail() requires a non-empty string');
  }
  return sha256Hex(normalizeEmail(email));
}

export interface SeedFields {
  /** Stable primary key (database id, UUID, OAuth sub). Best choice. */
  id?: string | number | null | undefined;
  /** Email. Stable + unique. Good fallback when id isn't available client-side. */
  email?: string | null | undefined;
  /** Display name. Collision-prone — only acceptable composed with `createdAt`. */
  name?: string | null | undefined;
  /** Account creation time. Combined with `name` to bake uniqueness in at signup. */
  createdAt?: string | number | Date | null | undefined;
}

export interface SeedOptions {
  /**
   * When the email branch is used, hash the email instead of returning it
   * raw. Hashing keeps the seed stable but stops the address from leaking
   * into URLs, server logs, and Referer headers. Default `true` from v1.
   *
   * Set to `false` to opt back into the legacy plaintext-email behavior —
   * useful for migrations where existing avatars are keyed off the raw
   * email and you don't want every user's face to change.
   */
  hashEmail?: boolean;
}

/**
 * Compose a stable seed string from the most unique field available.
 *
 * @example
 * ```ts
 * const s = seed({ id: user.id, email: user.email, name: user.name });
 * createAvatar(s);
 * ```
 *
 * @example If only a name exists, pass `createdAt` to avoid collisions:
 * ```ts
 * seed({ name: 'Alice', createdAt: user.createdAt });
 * // → "Alice|1700000000000"
 * ```
 *
 * @example Opt out of email hashing (legacy behavior):
 * ```ts
 * seed({ email: 'a@b.c' }, { hashEmail: false });
 * // → "a@b.c"  — avoid; only for migrating off the old default.
 * ```
 *
 * @throws if no usable field is provided.
 */
export function seed(fields: SeedFields, options: SeedOptions = {}): string {
  const hashEmail = options.hashEmail ?? true;

  if (fields.id !== null && fields.id !== undefined && String(fields.id).length > 0) {
    return String(fields.id);
  }
  if (fields.email && fields.email.length > 0) {
    return hashEmail ? seedFromEmail(fields.email) : fields.email;
  }
  if (fields.name && fields.name.length > 0) {
    if (fields.createdAt !== null && fields.createdAt !== undefined) {
      const ts = fields.createdAt instanceof Date
        ? fields.createdAt.getTime()
        : typeof fields.createdAt === 'number'
          ? fields.createdAt
          : Date.parse(fields.createdAt as string);
      if (Number.isFinite(ts)) return `${fields.name}|${ts}`;
      return `${fields.name}|${fields.createdAt}`;
    }
    return fields.name;
  }
  throw new Error('navii: seed() requires at least one of { id, email, name }');
}
